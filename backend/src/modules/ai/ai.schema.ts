import * as z from "zod";
export const aiInterviewResponseSchema = z.object({
  feedback: z.string().optional(),
  nextQuestion: z.string(),
});
