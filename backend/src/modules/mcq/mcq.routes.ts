import { Request, Response, Router } from "express";
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
  .post(
    "/update/:id",
    [authenticator.verifyToken, authenticator.isAdmin],
    controller.updateMcqById
  )
  .delete(
    "/delete/:id",
    [authenticator.verifyToken, authenticator.isAdmin],
    controller.deleteMcqById
  );

export default router;
