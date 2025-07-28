import { z } from "zod";
import { JobTitle, UserRole } from "../../models/user.model";

export const authSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().max(65),
  password: z.string().min(6),
  role: z.enum(UserRole).optional(),
  jobTitle: z.enum(JobTitle),
  bio: z.string().optional(),
  company: z.string().optional(),
  skills: z.array(z.string()).optional(),
});
