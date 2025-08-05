import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { ISubmissionDocument } from "../../models/submission.model";
import {
  InsertSubmissionDto,
  ServiceResult,
  SubmissionQuestionsResult,
} from "../../types/type";
import ErrorUtils from "../../utils/ErrorUtils";
const mcqQuestionsCollection = "mcqquestions";

class SubmissionService {
  private readonly submissionModel;
  private readonly mcqModel;

  constructor({ submissionModel, mcqModel }: Dependencies) {
    this.submissionModel = submissionModel;
    this.mcqModel = mcqModel;
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

  public async deleteSubmission(id: string): Promise<ServiceResult<string>> {
    try {
      const deletedSubmission =
        await this.submissionModel.findByIdAndDelete(id);
      if (deletedSubmission)
        return {
          success: true,
          data: id,
        };
      return {
        success: false,
        message: "Submission not found",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error deleting submission"),
      };
    }
  }

  public async getMcqsFromSubmission(
    id: Types.ObjectId
  ): Promise<ServiceResult<SubmissionQuestionsResult>> {
    try {
      const submission =
        await this.submissionModel.aggregate<SubmissionQuestionsResult>([
          { $match: { _id: id } },
          { $unwind: "$mcqData.responses" },
          {
            $lookup: {
              from: mcqQuestionsCollection,
              localField: "mcqData.responses.questionId",
              foreignField: "_id",
              as: "question",
            },
          },
          { $unwind: "$question" },
          {
            $project: {
              "question.correctIndex": 0,
              "question.explanation": 0,
            },
          },

          {
            $group: {
              _id: "$_id",
              questions: { $addToSet: "$question" },
            },
          },
        ]);
      // console.log(submission);
      if (submission.length > 0) {
        return {
          success: true,
          data: submission[0],
        };
      }
      return {
        success: false,
        message: "Error getting questions",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error getting questions"),
      };
    }
  }
}

export default SubmissionService;
