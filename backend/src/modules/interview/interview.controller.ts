import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";
import Some from "../../utils/Some";
import { JobTitle } from "../../enums";

class InterviewController {
  private readonly interviewService;
  private readonly aiService;
  private readonly rb;
  constructor({ interviewService, aiService }: Dependencies) {
    this.interviewService = interviewService;
    this.aiService = aiService;
    this.rb = new ResponseBuilder({ type: "interview" });
  }

  public startInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const { jobTitle, skills } = req.query;

    const queryData = {
      jobTitle: Some.String(jobTitle || req.user?.jobTitle) as JobTitle,
      //   skills: Some.String(skills).split(","),
    };
    await this.aiService.startInterview({
      jobTitle: queryData.jobTitle,
      candidateSkills: req.user.skills,
    });
  };
}

export default InterviewController;
