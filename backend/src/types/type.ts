import { Request } from "express";
import { IUserDocument } from "../models/user.model";
import { JwtPayload } from "jsonwebtoken";
import { CreateMcqDto } from "../modules/mcq/mcq.schema";
import { Types } from "mongoose";
import { IMcqDocument } from "../models/mcq.model";

import {
  CandidateStatus,
  Difficulty,
  JobTitle,
  Mode,
  QuestionSource,
  RoundType,
  UserRole,
} from "../enums";

export type ResponseStruct = {
  success: boolean | null;
  message: string;
  type: string | null;
  data: any | null;
  status: number;
};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export interface JwtDecodeData extends JwtPayload {
  id: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface CustomRequest extends Request {
  user?: IUserDocument;
}

export type InsertDto = CreateMcqDto & {
  createdById?: Types.ObjectId;
  source: QuestionSource;
  questionTopic: string;
};

export type GenerateMcqDto = {
  jobTitle: JobTitle;
  difficulty: Difficulty;
  topics: Array<string>;
  role: UserRole;
  createdById?: Types.ObjectId;
  saveToDb?: boolean;
  questionCount?: number;
};

export type AiFeedbackDto = {
  question: string;
  questionId: Types.ObjectId;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  questionTopic: string;
};

export type InsertResponseDto = Omit<
  AiFeedbackDto,
  "question" | "correctIndex" | "questionTopic"
>;

export type InsertSubmissionDto = {
  sessionId?: Types.ObjectId;
  candidateId: Types.ObjectId;
  mode: Mode;
  roundType: RoundType;
  startedAt: Date;
  endedAt: Date;
  mcqData?: {
    score: number;
    responses: Array<InsertResponseDto>;
    aiFeedBack: string;
  };
};

export interface SubmissionQuestionsResult {
  _id: Types.ObjectId;
  questions: Array<Partial<IMcqDocument>>;
}

export type McqRoundDto = {
  roundTime: number;
  questionIds: Array<Types.ObjectId>;
};

export type SessionCandidate = {
  candidateId: Types.ObjectId;
  status: CandidateStatus;
  score?: number;
  completedAt?: Date;
};

export type HostedSessionDto = {
  interviewerId: Types.ObjectId;
  title: string;
  jobTitle: JobTitle;
  jobLocation: string;
  organizationName: string;
  isPublic: boolean;
  rounds: {
    mcq?: boolean;
    coding?: boolean;
    interview?: boolean;
  };
  expireDate?: Date;
  candidates: Array<SessionCandidate>;
  access?: {
    inviteCode?: string;
    maxCandidates?: number;
  };
};

export type SessionDto = {
  mcqRoundDto: McqRoundDto;
  hostedSessionDto: HostedSessionDto;
};
