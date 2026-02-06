import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

export class DialogueLine {
    @Prop({ required: true })
    speaker!: string; // e.g., 'Person A', 'Person B'

    @Prop({ required: true })
    text!: string;

    @Prop({ type: Buffer })
    audio?: Buffer; // MP3 audio data (64kbps)
}

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ required: true })
    topic!: string;

    @Prop({ required: true })
    difficulty!: string; // e.g., 'Beginner', 'Intermediate', 'Advanced'

    @Prop({ type: [DialogueLine], default: [] })
    dialogue!: DialogueLine[];

    @Prop({ default: false })
    audioGenerated!: boolean; // True if audio has been generated for all lines
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
