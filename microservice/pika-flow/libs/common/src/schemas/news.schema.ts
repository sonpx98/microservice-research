import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsDocument = HydratedDocument<News>;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
    title!: string;

  @Prop({ required: true, unique: true })
    link!: string;

  @Prop()
    content!: string;

  @Prop()
    source!: string;

  @Prop()
  pubDate!: string;

  @Prop([String])
    tags!: string[];
}

export const NewsSchema = SchemaFactory.createForClass(News);