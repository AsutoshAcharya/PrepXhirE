import { InferSchemaType, model, Schema, Types } from "mongoose";
import { InterviewUser, CollectionNames } from "../enums";

const MessageSchema = new Schema(
  {
    user: {
      type: String,
      enum: Object.values(InterviewUser),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const QAConversationSchema = new Schema(
  {
    question: {
      type: MessageSchema,
      required: true,
    },
    answer: {
      type: MessageSchema,
    },
    aiFeedback: {
      type: String,
    },
  },
  { _id: false }
);

const InterviewSchema = new Schema(
  {
    candidateId: {
      type: Types.ObjectId,
      ref: CollectionNames.Users,
      required: true,
    },
    interviewerId: {
      type: Types.ObjectId,
      ref: CollectionNames.Users,
    },
    sessionId: {
      type: Types.ObjectId,
      ref: CollectionNames.HostedSession,
    },
    conversation: {
      type: [QAConversationSchema],
      default: [],
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    interviewRecordUrl: {
      type: String,
    },
    overallAiFeedback: {
      type: String,
    },
  },
  { timestamps: true }
);

export type InterviewSchemaType = InferSchemaType<typeof InterviewSchema>;

export interface IInterviewDocument extends InterviewSchemaType {
  _id: Types.ObjectId;
}

export const InterviewModel = model<IInterviewDocument>(
  "interview",
  InterviewSchema
);
