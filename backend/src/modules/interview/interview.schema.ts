import * as z from "zod";
import { JobTitle, Mode } from "../../enums";

export const onGoingInterviewSchema = z.object({
  userResponse: z.string().min(10),
  // send both for hosted session interviews
  jobTitle: z.enum(JobTitle).optional(),
  skills: z.array(z.string()).optional(), //requiredSkills
});
export const interviewSubmitSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(Mode),
  timeTaken: z.number(),
});
