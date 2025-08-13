import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import {
  AuthUser,
  CustomRequest,
  CustomSocket,
  JwtDecodeData,
  SocketNextFunction,
} from "../types/type";
import ResponseBuilder from "../utils/ResponseBuilder";
import Some from "../utils/Some";
import { UserRole } from "../enums";
import toMongoObjectId from "../utils/toMongoObjectId";
import ErrorUtils from "../utils/ErrorUtils";

class Authenticator {
  private readonly rb;
  private readonly unauthorizedMessage =
    "You are not authorized for this action";
  private readonly badRequestMessage = "Unauthorized: Missing token or userId";

  constructor() {
    this.rb = new ResponseBuilder({ type: "verify-user" });
  }

  private decodeToken(token: string): AuthUser | null {
    const decoded = jwt.verify(
      token,
      process.env.JWT as string
    ) as JwtDecodeData;
    console.log(decoded);
    if (decoded)
      return {
        _id: toMongoObjectId(decoded.id),
        fullName: decoded.name,
        email: decoded.email,
        role: decoded.role,
        jobTitle: decoded.jobTitle,
        skills: decoded.skills,
      } as AuthUser;

    return null;
  }

  public verifyToken = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = Some.String(req.headers["token"]);
      // const userId = Some.String(req.headers["user"]);

      if (!token) {
        return this.rb.badRequest(this.badRequestMessage).send(res);
      }
      const decoded = this.decodeToken(token);

      if (!decoded) return this.rb.unauthorized().send(res);

      req.user = decoded;

      next();
    } catch {
      return this.rb.unauthorized().send(res);
    }
  };

  public verifySocketToken = async (
    socket: CustomSocket,
    next: SocketNextFunction
  ) => {
    try {
      const token = Some.String(socket.handshake.headers["token"]);
      // const userId = Some.String(socket.handshake.headers["user"]);

      if (!token) {
        return next(new Error(this.badRequestMessage));
      }
      console.log("token", token);
      const decoded = this.decodeToken(token);

      if (!decoded) return next(new Error("Unauthorized"));

      socket.user = decoded;

      next();
    } catch (err) {
      // console.log(err);
      return ErrorUtils.getErrorMessage(err, "Unauthorized");
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
