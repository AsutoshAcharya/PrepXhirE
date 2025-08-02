import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest, GenerateMcqDto, InsertDto } from "../../types/type";
import McqService from "./mcq.service";
import { CreateMcqDto, createMcqSchema } from "./mcq.schema";
import ResponseBuilder from "../../utils/ResponseBuilder";
import { Difficulty, QuestionSource } from "../../models/mcq.model";
import Some from "../../utils/Some";
import { Types } from "mongoose";
import { JobTitle, UserRole } from "../../models/user.model";

class McqController {
  private readonly mcqService: McqService;
  private readonly responseBuilder;
  private readonly aiService;
  constructor({ mcqService, aiService }: Dependencies) {
    this.mcqService = mcqService;
    this.aiService = aiService;

    this.responseBuilder = new ResponseBuilder({ type: "mcq" });
  }

  public createMcq = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.responseBuilder.unauthorized().send(res);

    const mcqs = Some.Array(req.body?.mcqs);

    if (mcqs.length === 0) {
      return this.responseBuilder.badRequest("No MCQs provided").send(res);
    }

    const parsedMcqs: Array<InsertDto> = [];
    for (const mcq of mcqs) {
      const result = createMcqSchema.safeParse(mcq);
      if (!result.success) {
        // console.log(result.error);
        return this.responseBuilder
          .badRequest("Invalid mcq question")
          .send(res);
      }
      parsedMcqs.push({
        ...result.data,
        createdById: req.user._id,
        source: QuestionSource.interviewer,
      });
    }

    const serviceResult = await this.mcqService.addBulkMcqs(parsedMcqs);

    if (!serviceResult.success) {
      return this.responseBuilder.badRequest(serviceResult.message).send(res);
    }

    return this.responseBuilder
      .success({
        message: "MCQs created successfully",
        data: serviceResult.data,
      })
      .send(res);
  };
  public generateMcq = async (req: CustomRequest, res: Response) => {
    const topics = [
      "Conflict Resolution",
      "Negotiation",
      "Teamwork & Collaboration",
    ];

    if (!req.user) throw new Error("User not found");
    const role = UserRole.Interviewer;

    const generateMcqDto: GenerateMcqDto = {
      jobTitle: JobTitle.HRAnalyst,
      difficulty: Difficulty.easy,
      topics,
      role,
      createdById: req.user._id,
      questionCount: 1,
    };

    const serviceResult =
      await this.aiService.generateMcqQuestions(generateMcqDto);

    if (serviceResult.success) {
      return this.responseBuilder
        .success({
          message: "Questions Generated",
          data: serviceResult.data,
        })
        .send(res);
    }
    return this.responseBuilder.serverError(serviceResult.message).send(res);
  };

  public deleteMcqById = async (req: CustomRequest, res: Response) => {
    const id = Some.String(req.params.id);
    if (!req.user) return this.responseBuilder.unauthorized().send(res);
    if (!id) return this.responseBuilder.badRequest("Missing mcq id").send(res);

    const serviceResult = await this.mcqService.deleteMcqById(id, req.user._id);

    if (serviceResult.success)
      return this.responseBuilder
        .success({
          message: "Question deleted successfully",
          data: serviceResult.data,
        })
        .send(res);

    return this.responseBuilder.serverError(serviceResult.message).send(res);
  };

  public updateMcqById = async (req: CustomRequest, res: Response) => {
    const id = Some.String(req.params.id);
    const mcq = Some.Object(req.body);
    if (!req.user) return this.responseBuilder.unauthorized().send(res);
    if (!id) return this.responseBuilder.badRequest("Missing mcq id").send(res);
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
        return this.responseBuilder
          .success({
            message: "Mcq updated successfully",
            data: serviceResult.data,
          })
          .send(res);

      return this.responseBuilder.serverError(serviceResult.message).send(res);
    }
    return this.responseBuilder.serverError("Invalid mcq data").send(res);
  };
}

export default McqController;
