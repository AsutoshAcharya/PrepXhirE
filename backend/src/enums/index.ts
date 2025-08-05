export enum CollectionNames {
  Users = "users",
  McqQuestions = "mcqquestions",
  Submissions = "submissions",
  HostedSession = "hostedSession",
  McqRound = "mcqRound",
}

export enum CandidateStatus {
  INVITED = "invited",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  DISQUALIFIED = "disqualified",
  SHORTLISTED = "shortlisted",
}

export enum Difficulty {
  easy = "easy",
  medium = "medium",
  hard = "hard",
}

export enum QuestionSource {
  ai = "ai",
  interviewer = "interviewer",
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
