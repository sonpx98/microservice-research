#!/usr/bin/env node
// stdio MCP server wrapping apps/api. Config via env: API_URL, API_KEY, TTS_OUTPUT_DIR.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const API_URL = (process.env.API_URL || 'http://127.0.0.1:3000/api').replace(/\/$/, '');
const API_KEY = process.env.API_KEY;
const TTS_OUTPUT_DIR = resolve(process.env.TTS_OUTPUT_DIR || join(homedir(), 'Downloads'));

async function api(method: 'GET' | 'POST', path: string, body?: unknown, query?: Record<string, unknown>) {
  const qs = query
    ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]))
    : '';
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (method !== 'GET') {
    if (!API_KEY) throw new Error('API_KEY env is required for write tools');
    headers['x-api-key'] = API_KEY;
  }
  const res = await fetch(`${API_URL}${path}${qs}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${res.status} ${method} ${path}: ${await res.text()}`);
  return res;
}

const json = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
const getJson = async (path: string, query?: Record<string, unknown>) => json(await (await api('GET', path, undefined, query)).json());
const postJson = async (path: string, body: unknown) => json(await (await api('POST', path, body)).json());

const server = new McpServer({ name: 'pika', version: '1.0.0' });

const paging = { page: z.number().int().min(1).optional(), limit: z.number().int().min(1).max(50).optional() };
const level = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).describe('CEFR level');

// ---- readings ----
server.registerTool('list_readings', {
  description: 'List english-learning reading passages (paginated). Use before creating to avoid duplicate topics.',
  inputSchema: { level: level.optional(), topic: z.string().optional(), q: z.string().optional(), ...paging },
}, (args) => getJson('/readings', args));

server.registerTool('get_reading', {
  description: 'Get one reading passage with its quizzes by id.',
  inputSchema: { id: z.string() },
}, ({ id }) => getJson(`/readings/${id}`));

server.registerTool('create_reading', {
  description: 'Save a reading passage you generated. Content length by level: A1-A2 150-300 words, B1-B2 350-600, C1-C2 600-1000. Separate paragraphs with blank lines. 3-5 multiple-choice quizzes with exactly one isCorrect option each.',
  inputSchema: {
    title: z.string(),
    content: z.string(),
    level,
    topic: z.string(),
    quizzes: z.array(z.object({
      question: z.string(),
      options: z.array(z.object({ answer: z.string(), isCorrect: z.boolean() })).min(2),
      explanation: z.string().optional(),
    })).optional(),
  },
}, (args) => postJson('/readings', args));

// ---- conversations ----
server.registerTool('list_conversations', {
  description: 'List english-learning conversations (without audio).',
}, () => getJson('/conversation'));

server.registerTool('get_conversation', {
  description: 'Get one conversation by id (dialogue text, no audio).',
  inputSchema: { id: z.string() },
}, ({ id }) => getJson(`/conversation/${id}`));

server.registerTool('create_conversation', {
  description: 'Save a two-person English conversation you generated. Speakers must be "Person A" (male voice) and "Person B" (female voice), 24-32 lines of natural small talk. Slow: the API synthesizes audio for every line before responding.',
  inputSchema: {
    topic: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    dialogue: z.array(z.object({ speaker: z.enum(['Person A', 'Person B']), text: z.string() })).min(2),
  },
}, async (args) => {
  const saved = await (await api('POST', '/conversation', args)).json();
  // strip audio buffers from the echo
  return json({ ...saved, dialogue: saved.dialogue?.map((l: { speaker: string; text: string; audio?: unknown }) => ({ speaker: l.speaker, text: l.text, hasAudio: !!l.audio })) });
});

// ---- news ----
server.registerTool('list_news', {
  description: 'List crawled tech news (paginated). q searches titles; tag filters by tag.',
  inputSchema: { q: z.string().optional(), tag: z.string().optional(), ...paging },
}, (args) => getJson('/news', args));

server.registerTool('get_news', {
  description: 'Get one news article by id.',
  inputSchema: { id: z.string() },
}, ({ id }) => getJson(`/news/${id}`));

// ---- tts ----
server.registerTool('text_to_speech', {
  description: `Synthesize speech with Piper and write an mp3 to disk (default dir: ${TTS_OUTPUT_DIR}). Returns the file path. Models: en_US-ryan-low (male), en_US-lessac-low (female).`,
  inputSchema: {
    text: z.string().min(1),
    model: z.enum(['en_US-ryan-low', 'en_US-lessac-low']).optional(),
    fileName: z.string().regex(/^[\w.-]+$/).optional().describe('Without directory; .mp3 appended if missing'),
  },
}, async ({ text, model, fileName }) => {
  const res = await api('POST', '/tts/generate-buffer?format=mp3', { text, model });
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = (fileName || `tts-${Date.now()}`).replace(/(\.mp3)?$/, '.mp3');
  const path = join(TTS_OUTPUT_DIR, name);
  await mkdir(TTS_OUTPUT_DIR, { recursive: true });
  await writeFile(path, bytes);
  return json({ path, bytes: bytes.length });
});

await server.connect(new StdioServerTransport());
