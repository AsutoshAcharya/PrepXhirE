import { Router } from "express";
import container from "../../container";
import { UserRole } from "../../enums";

const authenticator = container.resolve("authenticator");
const controller = container.resolve("hostedSessionController");

const router = Router();

router
  .post(
    "/create",
    [
      authenticator.verifyToken,
      authenticator.hasRole(UserRole.Admin, UserRole.Interviewer),
    ],
    controller.hostSession
  )
  //candidate can join public sessions
  .get("/public", authenticator.verifyToken, controller.getPublicSessions)
  .get(
    "/own-sessions/:interviewerId",
    [
      authenticator.verifyToken,
      authenticator.hasRole(UserRole.Admin, UserRole.Interviewer),
    ],
    controller.getOwnHostedSessions
  );

export default router;
