import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";
import Some from "../../utils/Some";
import { JobTitle } from "../../enums";
import { isValidObjectId } from "mongoose";
import toMongoObjectId from "../../utils/toMongoObjectId";
import { onGoingInterviewSchema } from "./interview.schema";

class InterviewController {
  private readonly interviewService;
  private readonly aiService;
  private readonly rb;
  private readonly socketServer;

  constructor({ interviewService, aiService, socketServer }: Dependencies) {
    this.interviewService = interviewService;
    this.aiService = aiService;
    this.rb = new ResponseBuilder({ type: "interview" });
    this.socketServer = socketServer;
  }

  public test = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    // console.log(this.socketServer.io);
    this.socketServer.io.emit("serverResponse", "Hello");
    return this.rb.success({ message: "Socket test" }).send(res);
  };

  public startInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const { jobTitle, skills } = req.query;

    const queryData = {
      jobTitle: Some.String(jobTitle || req.user?.jobTitle) as JobTitle,
      //   skills: Some.String(skills).split(","),
    };
    const aiServiceResult = await this.aiService.startInterview({
      candidateId: req.user._id,
      jobTitle: queryData.jobTitle,
      candidateSkills: req.user.skills,
    });
    if (aiServiceResult.success)
      return this.rb
        .success({
          message: "Interview started",
          data: aiServiceResult.data,
        })
        .send(res);

    return this.rb.serverError(aiServiceResult.message).send(res);
  };

  public onGoingInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    const interviewId = Some.String(req.params.interviewId);
    if (!interviewId || !isValidObjectId(interviewId))
      return this.rb.badRequest("Invalid interviewId").send(res);

    const result = onGoingInterviewSchema.safeParse(req.body);
    if (result.success) {
      const queryData = {
        jobTitle: Some.String(
          result.data.jobTitle || req.user?.jobTitle
        ) as JobTitle,
        //   skills: Some.String(skills).split(","),
      };

      const aiServiceResult = await this.aiService.onGoingInterview({
        interviewId: toMongoObjectId(interviewId),
        candidateId: req.user._id,
        jobTitle: queryData.jobTitle,
        candidateSkills: req.user.skills,
        userResponse: result.data.userResponse,
      });

      if (aiServiceResult.success)
        return this.rb
          .success({
            message: "Ai Response",
            data: aiServiceResult,
          })
          .send(res);

      return this.rb.serverError(aiServiceResult.message).send(res);
    }

    return this.rb
      .badRequest(result.error?.message || "Invalid payload")
      .send(res);
  };

  public endInterview = async (req: CustomRequest, res: Response) => {};
}

export default InterviewController;
