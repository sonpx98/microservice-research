import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs';
import pLimit from 'p-limit';

export type AudioFormat = 'wav' | 'mp3';

@Injectable()
export class PiperService implements OnModuleInit {
    private readonly logger = new Logger(PiperService.name);
    private readonly piperBinaryPath = path.resolve(process.cwd(), 'tools/piper-venv/bin/piper');
    private readonly modelsDir = path.resolve(process.cwd(), 'tools/piper/models');
    private readonly limit = pLimit(1);

    onModuleInit() {
        this.verifySetup();
    }

    private verifySetup() {
        if (!fs.existsSync(this.piperBinaryPath)) {
            this.logger.error(`Piper binary not found at ${this.piperBinaryPath}`);
            return;
        }
        this.logger.log(`Piper binary found at ${this.piperBinaryPath}`);
    }

    /**
     * Stream audio output (for real-time playback)
     */
    async generateAudio(text: string, model: string = 'en_US-ryan-low'): Promise<Readable> {
        return this.limit(async () => {
            const modelPath = path.join(this.modelsDir, `${model}.onnx`);
            if (!fs.existsSync(modelPath)) {
                throw new Error(`Model ${model} not found at ${modelPath}`);
            }

            this.logger.log(`Generating audio stream for: "${text}" with model: ${model}`);

            const piperProcess = spawn(this.piperBinaryPath, [
                '--model', modelPath,
                '--output_file', '-'
            ]);

            return new Promise<Readable>((resolve, reject) => {
                piperProcess.stdin.write(text);
                piperProcess.stdin.end();

                piperProcess.on('error', (err) => {
                    this.logger.error('Failed to start piper process', err);
                    reject(err);
                });

                resolve(piperProcess.stdout);

                piperProcess.stderr.on('data', (data) => {
                    this.logger.debug(`Piper stderr: ${data}`);
                });

                piperProcess.on('close', (code) => {
                    if (code !== 0) {
                        this.logger.error(`Piper process exited with code ${code}`);
                    }
                });
            });
        });
    }

    /**
     * Generate audio as Buffer with configurable format
     * @param text - Text to synthesize
     * @param model - Voice model name
     * @param format - Output format: 'wav' (no deps) or 'mp3' (requires lame)
     */
    async generateBuffer(
        text: string,
        model: string = 'en_US-ryan-low',
        format: AudioFormat = 'mp3'
    ): Promise<Buffer> {
        return this.limit(async () => {
            const modelPath = path.join(this.modelsDir, `${model}.onnx`);
            if (!fs.existsSync(modelPath)) {
                throw new Error(`Model ${model} not found at ${modelPath}`);
            }

            this.logger.log(`Generating ${format.toUpperCase()} for: "${text}" with model: ${model}`);

            return new Promise<Buffer>((resolve, reject) => {
                const piperProcess = spawn(this.piperBinaryPath, [
                    '--model', modelPath,
                    '--output_file', '-'
                ]);

                let outputStream: Readable;

                if (format === 'mp3') {
                    // Pipe through lame for MP3 encoding
                    // Use full path for macOS homebrew, fallback to PATH for Linux
                    const lamePath = process.platform === 'darwin' ? '/opt/homebrew/bin/lame' : 'lame';
                    const lameProcess = spawn(lamePath, [
                        '-b', '32',      // 32kbps bitrate
                        '-m', 'm',       // mono
                        '--quiet',
                        '-', '-'         // stdin to stdout
                    ]);

                    piperProcess.stdout.pipe(lameProcess.stdin);
                    outputStream = lameProcess.stdout;

                    lameProcess.on('error', (err) => {
                        this.logger.error('Lame error - is lame installed?', err);
                        reject(new Error('lame not installed. Run: brew install lame (Mac) or apt install lame (Linux)'));
                    });
                } else {
                    // WAV: direct output, no conversion
                    outputStream = piperProcess.stdout;
                }

                // Collect output
                const chunks: Buffer[] = [];
                outputStream.on('data', (chunk) => chunks.push(chunk));
                outputStream.on('end', () => resolve(Buffer.concat(chunks)));

                // Write text and handle errors
                piperProcess.stdin.write(text);
                piperProcess.stdin.end();

                piperProcess.on('error', (err) => {
                    this.logger.error('Piper process error', err);
                    reject(err);
                });

                piperProcess.stderr.on('data', (data) => {
                    this.logger.debug(`Piper stderr: ${data}`);
                });
            });
        });
    }

    /**
     * Get MIME type for format
     */
    getMimeType(format: AudioFormat): string {
        return format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
    }
}
