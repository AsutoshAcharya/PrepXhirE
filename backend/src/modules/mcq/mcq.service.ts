import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { IMcqDocument, QuestionSource } from "../../models/mcq.model";
import { ServiceResult } from "../../types/type";
import { CreateMcqDto } from "./mcq.schema";

class McqService {
  private readonly mcqModel;
  constructor({ mcqModel }: Dependencies) {
    this.mcqModel = mcqModel;
  }

  async addBulkMcqs(
    mcqs: Array<CreateMcqDto>,
    source: QuestionSource,
    userId: Types.ObjectId
  ): Promise<ServiceResult<Array<Types.ObjectId>>> {
    try {
      const insertData = mcqs.map((mcq) => ({
        jobTitle: mcq.jobTitle,
        difficulty: mcq.difficulty,
        question: mcq.question,
        options: mcq.options,
        correctIndex: mcq.correctIndex,
        explanation: mcq.explanation,
        source,
        ...(userId && { createdById: userId }),
      }));

      const insertedMcqs = await this.mcqModel.insertMany(insertData);

      const ids = insertedMcqs.map((doc) => doc._id);

      return {
        success: true,
        data: ids,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating MCQs",
      };
    }
  }
}

export default McqService;
