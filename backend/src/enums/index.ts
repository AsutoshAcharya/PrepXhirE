export enum CollectionNames {
  Users = "users",
  McqQuestions = "mcqquestions",
  Submissions = "submissions",
  HostedSession = "hostedSession",
  McqRound = "mcqRound",
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
