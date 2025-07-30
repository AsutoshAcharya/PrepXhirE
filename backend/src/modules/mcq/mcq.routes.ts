import { Router } from "express";
import container from "../../container";
import authenticator, {
  isAdmin,
  isInterviewer,
} from "../../middlewares/authenticator";
const controller = container.resolve("mcqController");
const router = Router();

router.post("/create", [authenticator, isInterviewer], controller.createMcq);

export default router;
