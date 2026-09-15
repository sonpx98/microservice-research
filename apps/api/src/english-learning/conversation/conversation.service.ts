import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument, DialogueLine } from '../../common/schemas';
import { AiService } from '../ai/ai.service';
import { PiperService } from '../../tts/piper.service';

type Line = Pick<DialogueLine, 'speaker' | 'text'>;

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private aiService: AiService,
    private piper: PiperService,
  ) {}

  findAll() {
    return this.conversationModel.find().select('-dialogue.audio').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, withAudio = false) {
    const query = this.conversationModel.findById(id);
    const conversation = await (withAudio ? query : query.select('-dialogue.audio')).exec();
    if (!conversation) throw new NotFoundException(`Conversation with ID ${id} not found`);
    return conversation;
  }

  /** Generate dialogue via AI, synthesize audio per line, persist. */
  async generate(topic: string, difficulty = 'Intermediate') {
    const prompt = `Generate a natural, engaging English conversation between two friends (Person A and Person B) about "${topic}".

Requirements:
- Create a realistic small talk conversation like everyday life discussions
- Include 12-16 dialogue exchanges (24-32 lines total)
- Use natural filler words, reactions, and expressions (e.g., "Oh really?", "You know what I mean?", "That's so true!")
- Include idioms, phrasal verbs, and colloquial expressions appropriate for ${difficulty} level
- Show emotions, opinions, and personal stories
- Include some interruptions, agreements, and follow-up questions
- Make it feel like a genuine casual conversation between friends

Return valid JSON with this structure:
{
    "dialogue": [
        { "speaker": "Person A", "text": "Hey! Long time no see! How have you been?" },
        { "speaker": "Person B", "text": "Oh my gosh, I know right? It's been ages! I've been super busy with..." }
    ]
}`;

    this.logger.log(`Generating conversation "${topic}" via ${this.aiService.getCurrentAdapterName()}`);
    const { dialogue } = await this.aiService.generateConversation(prompt);
    if (!dialogue?.length) throw new Error('Generated conversation has no dialogue');

    const withAudio = await this.attachAudio(dialogue);
    return new this.conversationModel({
      topic,
      difficulty,
      dialogue: withAudio,
      audioGenerated: withAudio.every((l) => l.audio),
    }).save();
  }

  async regenerateAudio(id: string) {
    const conversation = await this.findOne(id);
    const dialogue = await this.attachAudio(conversation.dialogue);
    const audioGenerated = dialogue.every((l) => l.audio);
    await this.conversationModel.findByIdAndUpdate(id, { dialogue, audioGenerated });
    return { conversationId: id, topic: conversation.topic, linesProcessed: dialogue.length, audioGenerated };
  }

  async regenerateAllAudio(force: boolean) {
    const filter = force ? {} : { audioGenerated: { $ne: true } };
    const ids = await this.conversationModel.find(filter).select('_id').exec();
    const results = [];
    for (const { _id } of ids) results.push(await this.regenerateAudio(String(_id)));
    return { processed: results.length, results };
  }

  private async attachAudio(lines: Line[]): Promise<DialogueLine[]> {
    const out: DialogueLine[] = [];
    for (const [i, line] of lines.entries()) {
      this.logger.log(`Audio ${i + 1}/${lines.length}`);
      out.push({ speaker: line.speaker, text: line.text, audio: await this.synthesize(line) });
    }
    return out;
  }

  private async synthesize({ text, speaker }: Line): Promise<Buffer | undefined> {
    // Person A = male (ryan), Person B = female (lessac)
    const model = speaker.includes('A') ? 'en_US-ryan-low' : 'en_US-lessac-low';
    try {
      return await this.piper.generateBuffer(text, model, 'mp3');
    } catch (error) {
      this.logger.error(`TTS failed for "${text}"`, error);
      return undefined;
    }
  }
}
