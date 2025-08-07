import { InferSchemaType, model, Schema, Types } from "mongoose";

import { isFuture, isToday } from "date-fns";
import { CandidateStatus, CollectionNames, JobTitle } from "../enums";

const candidateSchema = new Schema(
  {
    candidateId: {
      type: Types.ObjectId,
      ref: CollectionNames.Users,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CandidateStatus),
      default: CandidateStatus.Invited,
      required: true,
    },
    score: Number,
    completedAt: Date,
  },
  { _id: false }
);

//only interviewer cah host
const hostedSessionSchema = new Schema(
  {
    interviewerId: {
      type: Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      enum: Object.values(JobTitle),
      required: true,
    },
    jobLocation: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    requiredSkills: {
      type: [String],
    },
    organizationName: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: false,
      default: true,
    },
    rounds: {
      mcq: {
        type: Boolean,
        required: false,
      },
      coding: {
        type: Boolean,
        required: false,
      },
      interview: {
        type: Boolean,
        required: false,
      },
    },
    expireDate: {
      type: Date,
      required: false,
      validate: {
        validator: (d: Date) => !isToday(d) && isFuture(d),
        message: "Only future dates are allowed",
      },
    },
    questionSet: {
      mcqRoundId: {
        type: Types.ObjectId,
        required: false,
      },
      //   will later add
      //   codingRoundId,
      //   interviewRoundId,
    },
    candidates: [candidateSchema],
    access: {
      inviteCode: {
        type: String,
        required: false,
      },
      maxCandidates: {
        type: Number,
        required: false,
      },
    },
  },
  { timestamps: true }
);

export type HostedSessionSchemaType = InferSchemaType<
  typeof hostedSessionSchema
>;

export interface IHostedSessionDocument extends HostedSessionSchemaType {
  _id: Types.ObjectId;
}

export const HostedSessionModel = model<IHostedSessionDocument>(
  "hostedSession",
  hostedSessionSchema
);
