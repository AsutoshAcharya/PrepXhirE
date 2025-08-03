import { Dependencies } from "../../container";
import { ISubmissionDocument } from "../../models/submission.model";
import { InsertSubmissionDto, ServiceResult } from "../../types/type";
import ErrorUtils from "../../utils/ErrorUtils";

class SubmissionService {
  private readonly submissionModel;
  constructor({ submissionModel }: Dependencies) {
    this.submissionModel = submissionModel;
  }

  public async insertSubmission(
    data: InsertSubmissionDto
  ): Promise<ServiceResult<ISubmissionDocument>> {
    try {
      const submission = await this.submissionModel.insertOne(data);

      if (submission) {
        return {
          success: true,
          data: submission,
        };
      }

      return {
        success: false,
        message: "Error adding submissions",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error adding submissions"),
      };
    }
  }
}

export default SubmissionService;
