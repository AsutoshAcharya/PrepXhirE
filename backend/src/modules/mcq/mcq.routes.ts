import { Router } from "express";
import container from "../../container";
import { UserRole } from "../../models/user.model";
const controller = container.resolve("mcqController");
const authenticator = container.resolve("authenticator");

const router = Router();

router.post(
  "/create",
  [
    authenticator.verifyToken,
    authenticator.hasRole(UserRole.Admin, UserRole.Interviewer),
  ],
  controller.createMcq
);

export default router;
