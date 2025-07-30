import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, JwtDecodeData } from "../types/type";
import { User, UserRole } from "../models/user.model";
import ResponseBuilder from "../utils/ResponseBuilder";
import Some from "../utils/Some";
const UNAUTHORIZED_MESSAGE = "You are not authorized for this action";

export async function verifyToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const rb = new ResponseBuilder({ type: "auth" });

  try {
    const token = Some.String(req.headers["token"]);
    const userId = Some.String(req.headers["user"]);

    if (!token || !userId) {
      return rb.unauthorized().send(res);
    }

    jwt.verify(token, process.env.JWT as string, async (err, decoded) => {
      if (err || !decoded) {
        return rb.unauthorized().send(res);
      }

      const { id } = decoded as JwtDecodeData;
      const user = await User.findById(id);

      if (!user) {
        return rb.notFound().send(res);
      }

      req.user = user;
      next();
    });
  } catch {
    return rb.unauthorized().send(res);
  }
}

export function isInterviewer(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const rb = new ResponseBuilder({ type: "verify-user" });

  if (!req.user || req.user.role !== UserRole.Interviewer)
    return rb.unauthorized(UNAUTHORIZED_MESSAGE).send(res);

  next();
}

export function isAdmin(req: CustomRequest, res: Response, next: NextFunction) {
  const rb = new ResponseBuilder({ type: "verify-user" });

  if (!req.user || req.user.role !== UserRole.Admin)
    return rb.unauthorized(UNAUTHORIZED_MESSAGE).send(res);

  next();
}

export function hasRole(...allowedRoles: UserRole[]) {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const rb = new ResponseBuilder({ type: "verify-user" });

    if (!req.user || !allowedRoles.includes(req.user.role))
      rb.unauthorized(UNAUTHORIZED_MESSAGE).send(res);

    next();
  };
}
