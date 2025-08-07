import * as z from "zod";
import { JobTitle } from "../../enums";
import { isFuture, isPast, isToday, isValid } from "date-fns";
import { isValidObjectId } from "mongoose";

const mcqRoundSchema = z.object({
  roundTime: z.number().max(120), // minutes
  questionIds: z
    .array(z.string())
    .min(5)
    .max(15)
    .refine((ids) => ids.every((id) => isValidObjectId(id)), {
      message: "Invalid mongoId",
    }),
});

const roundSchema = z
  .object({
    mcq: z.boolean().optional(),
    coding: z.boolean().optional(),
    interview: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value === true), {
    message:
      "At least one round type (mcq, coding, interview) must be selected",
  });

export const hostedSessionSchema = z.object({
  title: z.string().min(6).max(35),
  jobTitle: z.enum(JobTitle),
  jobLocation: z.string().max(35),
  jobDescription: z.string().max(1500),
  requiredSkills: z.array(z.string()),
  organizationName: z.string().max(35),
  isPublic: z.boolean(),
  rounds: roundSchema,
  expireDate: z.string().refine(
    (d) => {
      const date = new Date(d);
      return isValid(date) && !isToday(date) && isFuture(date);
    },
    {
      message: "Only future dates are allowed",
    }
  ),
  mcq: mcqRoundSchema.optional(),
  candidates: z.array(z.string()).optional(),
  access: z
    .object({
      inviteCode: z.string().max(15).optional(),
      maxCandidates: z.number().max(50).optional(),
    })
    .optional(),
});

export type McqRoundSchemaType = z.infer<typeof mcqRoundSchema>;
