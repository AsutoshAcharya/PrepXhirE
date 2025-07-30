import { Request, Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest, InsertDto } from "../../types/type";
import McqService from "./mcq.service";
import { CreateMcqDto, createMcqSchema } from "./mcq.schema";
import ResponseBuilder from "../../utils/ResponseBuilder";
import { QuestionSource } from "../../models/mcq.model";
import Some from "../../utils/Some";
import { Types } from "mongoose";

class McqController {
  private readonly mcqService: McqService;
  private readonly responseBuilder;
  constructor({ mcqService }: Dependencies) {
    this.mcqService = mcqService;
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
}

export default McqController;
