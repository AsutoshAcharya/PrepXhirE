import { model, Schema, InferSchemaType, Types } from "mongoose";

export enum JobTitle {
  FrontendDeveloper = "frontend_developer",
  BackendDeveloper = "backend_developer",
  FullstackDeveloper = "fullstack_developer",
  DevOpsEngineer = "devops_engineer",
  DataScientist = "data_scientist",
  MachineLearningEngineer = "ml_engineer",
  MobileDeveloper = "mobile_developer",
  QAEngineer = "qa_engineer",
  ProductManager = "product_manager",
  UIUXDesigner = "ui_ux_designer",
  SystemAdministrator = "system_administrator",
  HRAnalyst = "hr_analyst",
}

export enum UserRole {
  Admin = "admin",
  Interviewer = "interviewer",
  Candidate = "candidate",
}

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
