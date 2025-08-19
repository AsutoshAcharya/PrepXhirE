import { Response } from "express";
import { Dependencies } from "../../container";
import {
  AiFeedbackDto,
  CustomRequest,
  GenerateMcqDto,
  InsertDto,
  InsertSubmissionDto,
} from "../../types/type";
import McqService from "./mcq.service";
import {
  createMcqSchema,
  generateMcqQuerySchema,
  submitSchema,
} from "./mcq.schema";
import ResponseBuilder from "../../utils/ResponseBuilder";

import Some from "../../utils/Some";
import moment from "moment";

import pick from "../../utils/pick";
import { Difficulty, JobTitle, QuestionSource, RoundType } from "../../enums";

class McqController {
  private readonly mcqService: McqService;
  private readonly rb;
  private readonly aiService;
  private readonly submissionService;
  constructor({ mcqService, aiService, submissionService }: Dependencies) {
    this.mcqService = mcqService;
    this.aiService = aiService;
    this.submissionService = submissionService;

    this.rb = new ResponseBuilder({ type: "mcq" });
  }

  public createMcq = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const mcqs = Some.Array(req.body?.mcqs);

    if (mcqs.length === 0) {
      return this.rb.badRequest("No MCQs provided").send(res);
    }

    const parsedMcqs: Array<InsertDto> = [];
    for (const mcq of mcqs) {
      const result = createMcqSchema.safeParse(mcq);
      if (!result.success) {
        // console.log(result.error);
        return this.rb.badRequest("Invalid mcq question").send(res);
      }
      parsedMcqs.push({
        ...result.data,
        createdById: req.user._id,
        source: QuestionSource.Interviewer,
        questionTopic: Some.String(),
      });
    }

    const serviceResult = await this.mcqService.addBulkMcqs(parsedMcqs);

    if (!serviceResult.success) {
      return this.rb.badRequest(serviceResult.message).send(res);
    }

    return this.rb
      .success({
        message: "MCQs created successfully",
        data: serviceResult.data,
      })
      .send(res);
  };
  public generateMcq = async (req: CustomRequest, res: Response) => {
    // const topics = [
    //   "Conflict Resolution",
    //   "Negotiation",
    //   "Teamwork & Collaboration",
    // ];

    if (!req.user) return this.rb.unauthorized().send(res);
    //topics will be based on skills ,send comma separated values
    const { difficulty, jobRole, skills, questionCount } = req.query;

    const queryData = {
      difficulty: Some.String(difficulty) as Difficulty,
      jobTitle: Some.String(jobRole || req.user?.jobTitle) as JobTitle,
      skills: Some.String(skills).split(","),
      questionCount: Some.Number(questionCount),
    };
    console.log(queryData);
    const result = generateMcqQuerySchema.safeParse(queryData);
    if (!result.success) return this.rb.badRequest("Invalid queries").send(res);
    console.log(result.data);

    const generateMcqDto: GenerateMcqDto = {
      jobTitle: result.data.jobTitle,
      difficulty: result.data.difficulty,
      topics: result.data.skills,
      role: req.user.role,
      createdById: req.user._id,
      questionCount: result.data.questionCount || 5,
    };

    const serviceResult =
      await this.aiService.generateMcqQuestions(generateMcqDto);

    if (serviceResult.success) {
      return this.rb
        .success({
          message: "Questions Generated",
          data: serviceResult.data,
        })
        .send(res);
    }
    return this.rb.serverError(serviceResult.message).send(res);
  };

  public deleteMcqById = async (req: CustomRequest, res: Response) => {
    const id = Some.String(req.params.id);
    if (!req.user) return this.rb.unauthorized().send(res);
    if (!id) return this.rb.badRequest("Missing mcq id").send(res);

    const serviceResult = await this.mcqService.deleteMcqById(id, req.user._id);

    if (serviceResult.success)
      return this.rb
        .success({
          message: "Question deleted successfully",
          data: serviceResult.data,
        })
        .send(res);

    return this.rb.serverError(serviceResult.message).send(res);
  };

  public updateMcqById = async (req: CustomRequest, res: Response) => {
    const id = Some.String(req.params.id);
    const mcq = Some.Object(req.body);
    if (!req.user) return this.rb.unauthorized().send(res);
    if (!id) return this.rb.badRequest("Missing mcq id").send(res);
    const result = createMcqSchema
      .partial()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
      })
      .safeParse(mcq);

    if (result.success) {
      const serviceResult = await this.mcqService.updateMcqById(
        id,
        result.data
      );
      if (serviceResult.success)
        return this.rb
          .success({
            message: "Mcq updated successfully",
            data: serviceResult.data,
          })
          .send(res);

      return this.rb.serverError(serviceResult.message).send(res);
    }
    return this.rb.serverError("Invalid mcq data").send(res);
  };

  public submitMcq = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const result = submitSchema.safeParse(req.body);

    if (result.success) {
      const endedAt = moment.utc();
      const startedAt = endedAt
        .clone()
        .subtract(result.data.timeTaken, "minutes");

      const questionIds = result.data.responses.map((r) =>
        Some.MongoId(r.questionId)
      );
      const serviceResult = await this.mcqService.getBulkMcqsByIds(questionIds);

      if (serviceResult.success) {
        const aiFeedBackData: Array<AiFeedbackDto> = [];
        console.log(serviceResult.data, result.data.responses);
        serviceResult.data.forEach(
          ({ correctIndex, _id, question, questionTopic }) => {
            const userResponse = result.data.responses.find(
              (r) => r.questionId === _id.toString()
            );
            console.log("userResponse", userResponse);
            const selectedIndex = Some.Number(userResponse?.selectedIndex);

            aiFeedBackData.push({
              question,
              questionId: _id,
              selectedIndex,
              correctIndex: correctIndex,
              isCorrect: selectedIndex === correctIndex,
              questionTopic,
            });
          }
        );

        // console.log(aiFeedBackData);
        const aiServiceResult =
          await this.aiService.getMcqFeedBack(aiFeedBackData);
        let aiFeedBack = "";
        if (aiServiceResult.success) aiFeedBack = aiServiceResult.data;
        const parsedData = result.data;

        const insertSubmissionData: InsertSubmissionDto = {
          ...(parsedData.sessionId && {
            sessionId: Some.MongoId(parsedData.sessionId),
          }),
          candidateId: req.user._id,
          mode: parsedData.mode,
          roundType: RoundType.Mcq,
          startedAt: startedAt.toDate(),
          endedAt: endedAt.toDate(),
          mcqData: {
            score: aiFeedBackData.filter((r) => r.isCorrect).length,
            responses: aiFeedBackData.map((r) =>
              pick(r, "questionId", "selectedIndex", "isCorrect")
            ),
            aiFeedBack,
          },
        };

        const insertSubmissionServiceResult =
          await this.submissionService.insertSubmission(insertSubmissionData);

        if (insertSubmissionServiceResult.success)
          return this.rb
            .success({
              message: "Submission successful",
              data: insertSubmissionServiceResult.data,
            })
            .send(res);

        return this.rb
          .serverError(insertSubmissionServiceResult.message)
          .send(res);
      }
      return this.rb.serverError(serviceResult.message).send(res);
    }
    return this.rb.badRequest("Invalid payload").send(res);
  };

  public deleteSubmission = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    const submissionId = Some.String(req.params.id);
    const serviceResult =
      await this.submissionService.deleteSubmission(submissionId);
    if (serviceResult.success)
      return this.rb
        .success({
          message: "Submission deleted successfully",
          data: serviceResult.data,
        })
        .send(res);

    return this.rb.serverError(serviceResult.message).send(res);
  };

  public retakeMcq = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    const submissionId = Some.String(req.params.submissionId);
    if (!submissionId)
      return this.rb.badRequest("Missing submission id").send(res);

    const submissionServiceResult =
      await this.submissionService.getMcqsFromSubmission(
        Some.MongoId(submissionId)
      );
    if (submissionServiceResult.success)
      return this.rb
        .success({
          message: "Retake questions fetched successfully",
          data: submissionServiceResult.data,
        })
        .send(res);
    return this.rb.serverError(submissionServiceResult.message).send(res);
  };
}

export default McqController;
