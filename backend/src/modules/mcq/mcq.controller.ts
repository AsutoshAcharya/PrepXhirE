import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest, InsertDto } from "../../types/type";
import McqService from "./mcq.service";
import { CreateMcqDto, createMcqSchema } from "./mcq.schema";
import ResponseBuilder from "../../utils/ResponseBuilder";
import { Difficulty, QuestionSource } from "../../models/mcq.model";
import Some from "../../utils/Some";
import { Types } from "mongoose";
import { JobTitle } from "../../models/user.model";

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
    if (!req.user) {
      return this.responseBuilder.unauthorized().send(res);
    }

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
    const topics = ["React.js", "HTML", "CSS", "JavaScript", "TypeScript"];
    const serviceResult = await this.aiService.generateMcqQuestions(
      JobTitle.FrontendDeveloper,
      Difficulty.medium,
      topics
    );
    if (serviceResult.success) {
      return this.responseBuilder
        .success({
          message: "Questions Generated",
          data: serviceResult.data,
        })
        .send(res);
    } else {
      return this.responseBuilder.serverError(serviceResult.message).send(res);
    }
  };
}

export default McqController;
