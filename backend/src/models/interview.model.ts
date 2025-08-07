import { InferSchemaType, model, Schema, Types } from "mongoose";

import { InterviewUser, CollectionNames } from "../enums";

const ConversationMessageSchema = new Schema(
  {
    type: {
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

const InterviewSchema = new Schema(
  {
    candidateId: {
      type: Types.ObjectId,
      ref: CollectionNames.Users,
      required: true,
    },
    interviewerId: { type: Types.ObjectId, ref: CollectionNames.Users },
    sessionId: { type: Types.ObjectId, ref: CollectionNames.HostedSession },
    conversation: [ConversationMessageSchema],
    interviewRecordUrl: String,
    aiFeedback: String,
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
