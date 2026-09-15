import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument, DialogueLine } from '../../common/schemas';
import { PiperService } from '../../tts/piper.service';

type Line = Pick<DialogueLine, 'speaker' | 'text'>;
export interface CreateConversationDto {
  topic: string;
  difficulty?: string;
  dialogue: Line[];
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
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

  /** Store a dialogue produced elsewhere; synthesizes one audio clip per line. */
  async create({ topic, difficulty = 'Intermediate', dialogue }: CreateConversationDto) {
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
