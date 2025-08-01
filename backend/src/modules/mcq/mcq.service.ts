import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { InsertDto, ServiceResult } from "../../types/type";
import { JobTitle } from "../../models/user.model";
import { IMcqDocument } from "../../models/mcq.model";
import Some from "../../utils/Some";

class McqService {
  private readonly mcqModel;
  constructor({ mcqModel }: Dependencies) {
    this.mcqModel = mcqModel;
  }

  async addBulkMcqs(
    mcqs: Array<InsertDto>
  ): Promise<ServiceResult<Array<IMcqDocument>>> {
    try {
      const insertedMcqs = (await this.mcqModel.insertMany(
        mcqs
      )) as Array<IMcqDocument>;
      // console.log(insertedMcqs);
      return {
        success: true,
        data: insertedMcqs,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating MCQs",
      };
    }
  }

  async getMcqsByJobTitle(
    jobTitle: JobTitle,
    getCreatedById: boolean = false
  ): Promise<ServiceResult<Array<IMcqDocument>>> {
    try {
      const mcqs = await this.mcqModel.find(
        { jobTitle: jobTitle },
        getCreatedById ? { createdById: 1 } : { createdById: 0 }
      );
      return {
        success: true,
        data: mcqs,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error getting MCQs",
      };
    }
  }
}

export default McqService;
