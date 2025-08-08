import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";

class InterviewController {
  private readonly interviewService;
  private readonly aiService;

  constructor({ interviewService, aiService }: Dependencies) {
    this.interviewService = interviewService;
    this.aiService = aiService;
  }

  public startInterview = async (req: CustomRequest, res: Response) => {};
}

export default InterviewController;
