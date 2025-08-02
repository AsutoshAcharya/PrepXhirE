import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { InsertDto, ServiceResult } from "../../types/type";
import { JobTitle } from "../../models/user.model";
import { IMcqDocument } from "../../models/mcq.model";
import Some from "../../utils/Some";
import ErrorUtils from "../../utils/ErrorUtils";

class McqService {
  private readonly mcqModel;
  constructor({ mcqModel }: Dependencies) {
    this.mcqModel = mcqModel;
  }

  public async addBulkMcqs(
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
        message: ErrorUtils.getErrorMessage(error, "Error creating MCQs"),
      };
    }
  }

  public async getMcqsByJobTitle(
    jobTitle: JobTitle,
    getCreatedById: boolean = false
  ): Promise<ServiceResult<Array<IMcqDocument>>> {
    try {
      const mcqs = await this.mcqModel.find(
        { jobTitle: jobTitle, deletedById: null },
        getCreatedById ? { createdById: 1 } : { createdById: 0 }
      );
      return {
        success: true,
        data: mcqs,
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error getting MCQs"),
      };
    }
  }

  public async deleteMcqById(
    id: string,
    deletedById: Types.ObjectId
  ): Promise<ServiceResult<string>> {
    try {
      const updated = await this.mcqModel.findByIdAndUpdate(
        id,
        { deletedById: deletedById },
        { new: true }
      );
      if (updated)
        return {
          success: true,
          data: id,
        };
      return {
        success: false,
        message: "Question not found",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error deleting mcq"),
      };
    }
  }

  public async updateMcqById(
    id: string,
    data: Partial<InsertDto>
  ): Promise<ServiceResult<IMcqDocument>> {
    try {
      const updated = await this.mcqModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (updated)
        return {
          success: true,
          data: updated,
        };
      return {
        success: false,
        message: "Question not found",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error updating mcq"),
      };
    }
  }
}

export default McqService;
