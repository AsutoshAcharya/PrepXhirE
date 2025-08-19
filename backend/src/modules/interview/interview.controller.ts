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
  private readonly hostedSessionService;
  constructor({
    interviewService,
    aiService,
    socketServer,
    submissionService,
    hostedSessionService,
  }: Dependencies) {
    this.interviewService = interviewService;
    this.aiService = aiService;
    this.rb = new ResponseBuilder({ type: "interview" });
    this.socketServer = socketServer;
    this.submissionService = submissionService;
    this.hostedSessionService = hostedSessionService;
  }

  public test = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    // console.log(this.socketServer.io);
    this.socketServer.io.emit("serverResponse", "Hello");
    return this.rb.success({ message: "Socket test" }).send(res);
  };

  public startInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const { sessionId } = req.body;

    if (sessionId && !isValidObjectId(sessionId))
      return this.rb.badRequest("Invalid session id").send(res);

    let jobTitle = Some.String(req.user?.jobTitle) as JobTitle;
    let skills = req.user.skills;

    let interviewerId;

    if (sessionId) {
      const sessionResult = await this.hostedSessionService.getSessionById(
        toMongoObjectId(sessionId)
      );

      if (sessionResult.success) {
        if (
          !sessionResult.data.candidates.some(
            (c) => String(c.candidateId) === String(req.user?._id)
          )
        )
          return this.rb.badRequest("You can not join this session").send(res);

        jobTitle = sessionResult.data.jobTitle;
        skills = sessionResult.data.requiredSkills;
        interviewerId = sessionResult.data.interviewerId;
      } else this.rb.serverError(sessionResult.message).send(res);
    }

    const aiServiceResult = await this.aiService.startInterview({
      candidateId: req.user._id,
      jobTitle: jobTitle,
      candidateSkills: skills,
      ...(sessionId && { sessionId: toMongoObjectId(sessionId) }),
      ...(interviewerId && { interviewerId }),
    });

    if (!aiServiceResult.success)
      return this.rb.serverError(aiServiceResult.message).send(res);

    return this.rb
      .success({
        message: "Interview started",
        data: aiServiceResult.data,
      })
      .send(res);
  };

  public onGoingInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const interviewId = Some.String(req.params.interviewId);
    if (!interviewId || !isValidObjectId(interviewId))
      return this.rb.badRequest("Invalid interviewId").send(res);

    const parsed = onGoingInterviewSchema.safeParse(req.body);
    if (!parsed.success)
      return this.rb
        .badRequest(parsed.error?.message || "Invalid payload")
        .send(res);

    const { userResponse, jobTitle, skills } = parsed.data;
    const input = {
      userResponse,
      jobTitle: jobTitle || req.user.jobTitle,
      candidateSkills: skills || req.user.skills,
    };

    const aiResult = await this.aiService.onGoingInterview({
      interviewId: toMongoObjectId(interviewId),
      candidateId: req.user._id,
      ...input,
    });

    if (!aiResult.success)
      return this.rb.serverError(aiResult.message).send(res);

    return this.rb
      .success({
        message: "Ai Response",
        data: aiResult,
      })
      .send(res);
  };

  //submission
  public endInterview = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const interviewId = Some.String(req.params.interviewId);
    if (!interviewId || !isValidObjectId(interviewId))
      return this.rb.badRequest("Invalid interviewId").send(res);

    const parsed = interviewSubmitSchema.safeParse(req.body);
    if (!parsed.success) return this.rb.badRequest("Invalid payload").send(res);

    const { sessionId, timeTaken, mode } = parsed.data;

    const endedAt = moment.utc();
    const startedAt = endedAt.clone().subtract(timeTaken, "minutes");

    const interviewResult = await this.interviewService.getInterviewById(
      toMongoObjectId(interviewId)
    );

    if (!interviewResult.success)
      return this.rb.serverError(interviewResult.message).send(res);

    const aiFeedbackResult = await this.aiService.getInterviewFeedback({
      ...pick(req.user, "jobTitle", "skills"),
      interviewData: interviewResult.data,
    });

    if (!aiFeedbackResult.success)
      return this.rb.serverError(aiFeedbackResult.message).send(res);

    const submissionData: InsertSubmissionDto = {
      ...(sessionId && { sessionId: toMongoObjectId(sessionId) }),
      candidateId: req.user._id,
      mode,
      roundType: RoundType.Interview,
      startedAt: startedAt.toDate(),
      endedAt: endedAt.toDate(),
      interviewData: {
        interviewId: toMongoObjectId(interviewId),
        score: aiFeedbackResult.data.score,
        overallAiFeedback: aiFeedbackResult.data.overallAiFeedback,
      },
    };

    const insertResult =
      await this.submissionService.insertSubmission(submissionData);

    if (!insertResult.success)
      return this.rb.serverError(insertResult.message).send(res);

    return this.rb
      .success({
        message: "Submission Successful",
        data: insertResult.data,
      })
      .send(res);
  };
}

export default InterviewController;
