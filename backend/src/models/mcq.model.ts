import { InferSchemaType, model, Schema, Types } from "mongoose";
import { JobTitle } from "./user.model";
export enum Difficulty {
  easy = "easy",
  medium = "medium",
  hard = "hard",
}

export enum QuestionSource {
  ai = "ai",
  interviewer = "interviewer",
}

const mcqSchema = new Schema(
  {
    jobTitle: { type: String, enum: Object.values(JobTitle), required: true },
    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: "Exactly 4 options are required.",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
    },
    explanation: {
      type: String,
      required: false,
    },
    source: {
      type: String,
      enum: Object.values(QuestionSource),
      required: true,
    },
    createdById: {
      type: Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true }
);

export type McqSchemaType = InferSchemaType<typeof mcqSchema>;

export interface IMcqDocument extends McqSchemaType {
  _id: Types.ObjectId;
}

export const McqQuestion = model<IMcqDocument>("McqQuestion", mcqSchema);
