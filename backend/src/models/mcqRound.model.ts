import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNames } from "../enums";

const mcqRoundSchema = new Schema({
  roundTime: {
    required: true,
    type: Number,
  },
  questionIds: {
    required: true,
    type: [String],
    ref: CollectionNames.McqQuestions,
    validate: {
      validator: (ids: Types.ObjectId[]) => !ids || ids.length <= 15,
      message: "Maximum 15 questions per round",
    },
  },
});

export type McqRoundSchemaType = InferSchemaType<typeof mcqRoundSchema>;

export interface IMcqRoundDocument extends McqRoundSchemaType {
  _id: Types.ObjectId;
}

export const McqRoundModel = model<IMcqRoundDocument>(
  "mcqRound",
  mcqRoundSchema
);
