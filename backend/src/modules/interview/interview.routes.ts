import { Router } from "express";
import container from "../../container";
const authenticator = container.resolve("authenticator");
const controller = container.resolve("interviewController");

const router = Router();

//handle for sessionId later for hosted sessions
router
  .post("/start", authenticator.verifyToken, controller.startInterview)
  .post(
    "/ongoing/:interviewId",
    authenticator.verifyToken,
    controller.onGoingInterview
  );

export default router;
