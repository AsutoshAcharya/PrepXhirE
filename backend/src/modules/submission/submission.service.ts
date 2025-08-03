import { Dependencies } from "../../container";
import { ISubmissionDocument } from "../../models/submission.model";
import { InsertSubmissionDto, ServiceResult } from "../../types/type";
import ErrorUtils from "../../utils/ErrorUtils";

class SubmissionService {
  private readonly submissionModel;
  constructor({ submissionModel }: Dependencies) {
    this.submissionModel = submissionModel;
  }

  public async insertBulkSubmission(
    data: Array<InsertSubmissionDto>
  ): Promise<ServiceResult<Array<ISubmissionDocument>>> {
    try {
      const submissions = await this.submissionModel.insertMany(data);
      if (submissions.length > 0) {
        return {
          success: true,
          data: submissions as Array<ISubmissionDocument>,
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
