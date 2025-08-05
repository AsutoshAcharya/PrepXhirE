import { model, Schema, InferSchemaType, Types } from "mongoose";
import { JobTitle, UserRole } from "../enums";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Candidate,
    },

    jobTitle: {
      type: String,
      enum: Object.values(JobTitle),
      required: true,
    },

    avatarUrl: { type: String, required: false },
    bio: { type: String, required: false },
    company: { type: String, required: false },
    skills: [String],
  },
  { timestamps: true }
);

export type UserSchemaType = InferSchemaType<typeof userSchema>;

export interface IUserDocument extends UserSchemaType {
  _id: Types.ObjectId;
}

export const User = model<IUserDocument>("User", userSchema);
