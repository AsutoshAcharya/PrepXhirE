export enum CollectionNames {
  Users = "users",
  McqQuestions = "mcqquestions",
  Submissions = "submissions",
  HostedSession = "hostedSession",
  McqRound = "mcqRound",
  AiInterview = "aiinterview",
}

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

export enum CandidateStatus {
  Invited = "invited",
  In_Progress = "in_progress",
  Completed = "completed",
  Disqualified = "disqualified",
  Shortlisted = "shortlisted",
}

export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export enum QuestionSource {
  Ai = "ai",
  Interviewer = "interviewer",
}

export enum Mode {
  Hosted = "hosted",
  Practice = "practice",
}

export enum RoundType {
  Mcq = "mcq",
  Coding = "coding",
  Interview = "interview",
}

export enum InterviewUser {
  User = "user",
  Ai = "ai",
  Interviewer = "interviewer",
}

export enum Event {
  Connection = "connection",
  Disconnect = "disconnect",
  JoinInterviewRoom = "joinInterviewRoom",
  InterviewMessage = "interviewMessage",
  Error = "error",
}
