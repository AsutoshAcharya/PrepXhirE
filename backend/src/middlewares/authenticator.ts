import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, JwtDecodeData } from "../types/type";

import ResponseBuilder from "../utils/ResponseBuilder";
import Some from "../utils/Some";
import { Dependencies } from "../container";
import { UserRole } from "../models/user.model";

class Authenticator {
  private readonly unauthorizedMessage =
    "You are not authorized for this action";
  private readonly userModel;
  private readonly rb;
  constructor({ userModel }: Dependencies) {
    this.userModel = userModel;
    this.rb = new ResponseBuilder({ type: "verify-user" });
  }
  public verifyToken = (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = Some.String(req.headers["token"]);
      const userId = Some.String(req.headers["user"]);

      if (!token || !userId) {
        return this.rb.unauthorized().send(res);
      }

      jwt.verify(token, process.env.JWT as string, async (err, decoded) => {
        if (err || !decoded) {
          return this.rb.unauthorized().send(res);
        }

        const { id } = decoded as JwtDecodeData;
        const user = await this.userModel.findById(id);

        if (!user) {
          return this.rb.notFound().send(res);
        }

        req.user = user;
        next();
      });
    } catch {
      return this.rb.unauthorized().send(res);
    }
  };

  public isInterviewer = (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || req.user.role !== UserRole.Interviewer)
      return this.rb.unauthorized(this.unauthorizedMessage).send(res);

    next();
  };

  public isAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== UserRole.Admin)
      return this.rb.unauthorized(this.unauthorizedMessage).send(res);

    next();
  };

  public hasRole = (...allowedRoles: UserRole[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!req.user || !allowedRoles.includes(req.user.role))
        return this.rb.unauthorized(this.unauthorizedMessage).send(res);

      next();
    };
  };
}

export default Authenticator;
