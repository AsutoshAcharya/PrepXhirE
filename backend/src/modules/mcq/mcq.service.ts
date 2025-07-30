import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { InsertDto, ServiceResult } from "../../types/type";

class McqService {
  private readonly mcqModel;
  constructor({ mcqModel }: Dependencies) {
    this.mcqModel = mcqModel;
  }

  async addBulkMcqs(
    mcqs: Array<InsertDto>
  ): Promise<ServiceResult<Array<Types.ObjectId>>> {
    try {
      const insertedMcqs = await this.mcqModel.insertMany(mcqs);
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
