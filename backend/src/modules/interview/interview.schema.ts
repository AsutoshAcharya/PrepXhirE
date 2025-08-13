import * as z from "zod";
import { JobTitle, Mode } from "../../enums";

export const onGoingInterviewSchema = z.object({
  userResponse: z.string().min(10),
  jobTitle: z.enum(JobTitle),
  //   skills: z.array(z.string()).min(1),
});
export const interviewSubmitSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(Mode),
  timeTaken: z.number(),
});
