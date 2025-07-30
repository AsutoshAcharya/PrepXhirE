import { Router } from "express";
import container from "../../container";
import { verifyToken, hasRole } from "../../middlewares/authenticator";
import { UserRole } from "../../models/user.model";
const controller = container.resolve("mcqController");
const router = Router();

router.post(
  "/create",
  [verifyToken, hasRole(UserRole.Admin, UserRole.Interviewer)],
  controller.createMcq
);

export default router;
