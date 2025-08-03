import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, JwtDecodeData } from "../types/type";
import ResponseBuilder from "../utils/ResponseBuilder";
import Some from "../utils/Some";
import { Dependencies } from "../container";
import { UserRole } from "../models/user.model";

class Authenticator {
  private readonly userModel;
  private readonly rb;
  private readonly unauthorizedMessage =
    "You are not authorized for this action";

  constructor({ userModel }: Dependencies) {
    this.userModel = userModel;
    this.rb = new ResponseBuilder({ type: "verify-user" });
  }

  public verifyToken = async (
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

        if (!user) return this.rb.notFound("User not found").send(res);

        req.user = user;
        next();
      });
    } catch {
      return this.rb.unauthorized().send(res);
    }
  };

  public hasRole = (...allowedRoles: UserRole[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return this.rb.unauthorized(this.unauthorizedMessage).send(res);
      }

      next();
    };
  };

  public isInterviewer = this.hasRole(UserRole.Interviewer);

  public isAdmin = this.hasRole(UserRole.Admin);
}

export default Authenticator;
