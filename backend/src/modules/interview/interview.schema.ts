import * as z from "zod";
import { JobTitle } from "../../enums";

export const onGoingInterviewSchema = z.object({
  userResponse: z.string().min(10),
  jobTitle: z.enum(JobTitle),
  //   skills: z.array(z.string()).min(1),
});
