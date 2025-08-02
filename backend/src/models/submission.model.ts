import { Schema, Types, InferSchemaType, model } from "mongoose";

export enum Mode {
  Hosted = "hosted",
  Practice = "practice",
}

export enum RoundType {
  Mcq = "mcq",
  Coding = "coding",
  Interview = "interview",
}

const mcqResponseSchema = new Schema({
  questionId: {
    type: Types.ObjectId,
    required: true,
  },
  selectedIndex: {
    type: Number,
    required: true,
  },
  correctIndex: {
    type: Number,
    required: true,
  },
  isCorrect: Boolean,
});

const submissionSchema = new Schema(
  {
    sessionId: {
      //for hosted by interviewer sessions
      type: Types.ObjectId,
      required: false,
    },
    candidateId: {
      type: Types.ObjectId,
      required: true,
    },
    mode: {
      type: String,
      enum: Object.values(Mode),
      required: true,
    },
    roundType: {
      type: String,
      enum: Object.values(RoundType),
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    mcqData: {
      type: String,
      required: false,
      score: {
        type: String,
        required: true,
      },
      responses: [mcqResponseSchema],
      aiFeedBack: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export type SubmissionSchemaType = InferSchemaType<typeof submissionSchema>;

export interface ISubmissionDocument extends SubmissionSchemaType {
  _id: Types.ObjectId;
}

export const Submission = model<ISubmissionDocument>(
  "submission",
  submissionSchema
);
