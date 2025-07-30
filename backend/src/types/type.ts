import { Request } from "express";
import { IUserDocument, UserRole } from "../models/user.model";
import { JwtPayload } from "jsonwebtoken";

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
