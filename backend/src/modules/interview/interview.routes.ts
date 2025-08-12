import { Response, Router } from "express";
import container from "../../container";
import { CustomRequest } from "../../types/type";
const authenticator = container.resolve("authenticator");
const controller = container.resolve("interviewController");

const router = Router();

//test route
router.get("/test", authenticator.verifyToken, controller.test);

//handle for sessionId later for hosted sessions
router
  .post("/start", authenticator.verifyToken, controller.startInterview)
  .post(
    "/ongoing/:interviewId",
    authenticator.verifyToken,
    controller.onGoingInterview
  )
  .post(
    "/end/:interviewId",
    authenticator.verifyToken,
    controller.endInterview
  );

export default router;
