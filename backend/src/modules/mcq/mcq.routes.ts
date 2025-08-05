import { Router } from "express";
import container from "../../container";
import { UserRole } from "../../models/user.model";

const controller = container.resolve("mcqController");
const authenticator = container.resolve("authenticator");

const router = Router();

router
  .post(
    "/create",
    [
      authenticator.verifyToken,
      authenticator.hasRole(UserRole.Admin, UserRole.Interviewer),
    ],
    controller.createMcq
  )
  .get("/generate", authenticator.verifyToken, controller.generateMcq)
  .patch(
    "/update/:id",
    [authenticator.verifyToken, authenticator.isAdmin],
    controller.updateMcqById
  )
  .delete(
    "/delete/:id",
    [authenticator.verifyToken, authenticator.isAdmin],
    controller.deleteMcqById
  )
  .post("/submit", authenticator.verifyToken, controller.submitMcq)
  .delete(
    "/submission/:id",
    [authenticator.verifyToken, authenticator.isAdmin],
    controller.deleteSubmission
  )
  .get(
    "/retake/:submissionId",
    [authenticator.verifyToken, authenticator.isCandidate],
    controller.retakeMcq
  );

export default router;
