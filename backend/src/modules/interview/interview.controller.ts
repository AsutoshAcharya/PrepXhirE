import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest, InsertSubmissionDto } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";
import Some from "../../utils/Some";
import { JobTitle, RoundType } from "../../enums";
import { isValidObjectId } from "mongoose";
import toMongoObjectId from "../../utils/toMongoObjectId";
import {
  interviewSubmitSchema,
  onGoingInterviewSchema,
} from "./interview.schema";
import moment from "moment";
import pick from "../../utils/pick";

class InterviewController {
  private readonly interviewService;
  private readonly aiService;
  private readonly rb;
  private readonly socketServer;
  private readonly submissionService;

  constructor({
    interviewService,
    aiService,
    socketServer,
    submissionService,
  }: Dependencies) {
    this.interviewService = interviewService;
    this.aiService = aiService;
    this.rb = new ResponseBuilder({ type: "interview" });
    this.socketServer = socketServer;
    this.submissionService = submissionService;
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

  //submission
  public endInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const interviewId = Some.String(req.params.interviewId);
    if (!interviewId || !isValidObjectId(interviewId))
      return this.rb.badRequest("Invalid interviewId").send(res);

    const result = interviewSubmitSchema.safeParse(req.body);

    if (!result.success) return this.rb.badRequest("Invalid payload").send(res);

    const endedAt = moment.utc();
    const startedAt = endedAt
      .clone()
      .subtract(result.data.timeTaken, "minutes");

    const interviewResult = await this.interviewService.getInterviewById(
      toMongoObjectId(interviewId)
    );

    if (interviewResult.success) {
      const aiFeedbackResult = await this.aiService.getInterviewFeedback({
        ...pick(req.user, "jobTitle", "skills"),
        interviewData: interviewResult.data,
      });
      const parsedData = result.data;

      if (aiFeedbackResult.success) {
        const insertSubmissionData: InsertSubmissionDto = {
          ...(parsedData.sessionId && {
            sessionId: toMongoObjectId(parsedData.sessionId),
          }),
          candidateId: req.user._id,
          mode: parsedData.mode,
          roundType: RoundType.Interview,
          startedAt: startedAt.toDate(),
          endedAt: endedAt.toDate(),
          interviewData: {
            interviewId: toMongoObjectId(interviewId),
            score: aiFeedbackResult.data.score,
            overallAiFeedback: aiFeedbackResult.data.overallAiFeedback,
          },
        };

        const insertSubmissionResult =
          await this.submissionService.insertSubmission(insertSubmissionData);
        if (insertSubmissionResult.success)
          return this.rb
            .success({
              message: "Submission Successful",
              data: insertSubmissionResult.data,
            })
            .send(res);

        return this.rb.serverError(insertSubmissionResult.message).send(res);
      }

      return this.rb.serverError(aiFeedbackResult.message).send(res);
    }

    return this.rb.serverError(interviewResult.message).send(res);
  };
}

export default InterviewController;
