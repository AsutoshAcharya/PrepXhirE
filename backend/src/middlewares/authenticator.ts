import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthUser, CustomRequest, JwtDecodeData } from "../types/type";
import ResponseBuilder from "../utils/ResponseBuilder";
import Some from "../utils/Some";
import { Dependencies } from "../container";
import { JobTitle, UserRole } from "../enums";
import toMongoObjectId from "../utils/toMongoObjectId";

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

        const { id, role, email, skills, jobTitle, name } =
          decoded as JwtDecodeData;
        // const user = await this.userModel.findById(id);

        // if (!user) return this.rb.notFound("User not found").send(res);

        req.user = {
          _id: toMongoObjectId(id),
          fullName: name,
          email,
          role: role as UserRole,
          jobTitle: jobTitle as JobTitle,
          skills,
        } as AuthUser;
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

  public isCandidate = this.hasRole(UserRole.Candidate);
}

export default Authenticator;
