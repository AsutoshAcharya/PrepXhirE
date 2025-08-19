import { Router } from "express";
import container from "../../container";
const authenticator = container.resolve("authenticator");
const submissionController = container.resolve("submissionController");

const router = Router();

router.get(
  "/:candidateId",
  authenticator.verifyToken,
  submissionController.getCandidateSubmissions
);

export default router;
