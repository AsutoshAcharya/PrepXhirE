import { Request } from "express";
import { IUserDocument, UserRole } from "../models/user.model";
import { JwtPayload } from "jsonwebtoken";
import { CreateMcqDto } from "../modules/mcq/mcq.schema";
import { Types } from "mongoose";
import { QuestionSource } from "../models/mcq.model";

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
};
