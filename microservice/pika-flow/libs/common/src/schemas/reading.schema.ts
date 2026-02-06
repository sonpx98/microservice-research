import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReadingDocument = HydratedDocument<Reading>;

export class QuizOption {
    @Prop() answer!: string;
    @Prop() isCorrect!: boolean;
}

export class Quiz {
    @Prop() question!: string;
    @Prop([QuizOption]) options!: QuizOption[];
    @Prop() explanation?: string;
}

@Schema({ timestamps: true })
export class Reading {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ required: true })
    level!: string; // e.g., 'A1', 'B2', 'C1'

    @Prop({ required: true })
    topic!: string;

    @Prop({ type: [Quiz], default: [] })
    quizzes!: Quiz[];
}

export const ReadingSchema = SchemaFactory.createForClass(Reading);
