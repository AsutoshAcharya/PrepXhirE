import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, JwtDecodeData } from "../types/type";
import { User, UserRole } from "../models/user.model";
import ResponseBuilder from "../utils/ResponseBuilder";
import Some from "../utils/Some";

async function authenticator(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const rb = new ResponseBuilder({ type: "auth" });

  try {
    const token = Some.String(req.headers["token"]);
    const userId = Some.String(req.headers["user"]);

    if (!token || !userId) {
      const response = rb.unauthorized().build();
      return res.status(response.status).json(response);
    }

    jwt.verify(token, process.env.JWT as string, async (err, decoded) => {
      if (err || !decoded) {
        const response = rb.unauthorized().build();
        return res.status(response.status).json(response);
      }

      const { id } = decoded as JwtDecodeData;
      const user = await User.findById(id);

      if (!user) {
        const response = rb.notFound().build();
        return res.status(response.status).json(response);
      }

      req.user = user;
      next();
    });
  } catch {
    const response = rb.unauthorized().build();
    res.status(response.status).json(response);
  }
}

export function isInterviewer(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const rb = new ResponseBuilder({ type: "verify-user" });

  if (!req.user || req.user.role !== UserRole.Interviewer) {
    const response = rb
      .unauthorized("You are not authorized for this action")
      .build();
    return res.status(response.status).json(response);
  }

  next();
}

export function isAdmin(req: CustomRequest, res: Response, next: NextFunction) {
  const rb = new ResponseBuilder({ type: "verify-user" });

  if (!req.user || req.user.role !== UserRole.Admin) {
    const response = rb
      .unauthorized("You are not authorized for this action")
      .build();
    return res.status(response.status).json(response);
  }

  next();
}

export default authenticator;
