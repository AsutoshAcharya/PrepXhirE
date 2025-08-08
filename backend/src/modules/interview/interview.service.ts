import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { InterviewUser } from "../../enums";
import {
  insertInterviewDto,
  ServiceResult,
  UpsertConversationDto,
} from "../../types/type";
import ErrorUtils from "../../utils/ErrorUtils";
import { IInterviewDocument } from "../../models/interview.model";
import moment from "moment";

class InterviewService {
  private readonly interviewModel;
  constructor({ interviewModel }: Dependencies) {
    this.interviewModel = interviewModel;
  }

  public async insertInterviewData(
    interviewDto: insertInterviewDto
  ): Promise<ServiceResult<IInterviewDocument>> {
    try {
      const result = await this.interviewModel.insertOne({
        candidateId: interviewDto.candidateId,
        sessionId: interviewDto?.sessionId,
        interviewerId: interviewDto?.interviewerId,
        conversation: [
          {
            question: {
              user: interviewDto.user,
              message: interviewDto.message,
            },
          },
        ],
        // currentQuestionIndex, default is 0 so not required
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(
          error,
          "Error inserting interview data"
        ),
      };
    }
  }

  public async getInterviewById(
    id: Types.ObjectId
  ): Promise<ServiceResult<IInterviewDocument>> {
    try {
      const interviewData = await this.interviewModel.findById(id);
      if (interviewData)
        return {
          success: true,
          data: interviewData,
        };
      return {
        success: false,
        message: "Interview data not found",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(
          error,
          "Error getting interview data"
        ),
      };
    }
  }

  public async updateConversation(
    updateCovnersationDto: UpsertConversationDto
  ): Promise<ServiceResult<IInterviewDocument>> {
    const { id, message } = updateCovnersationDto;

    try {
      if (
        [InterviewUser.Ai, InterviewUser.Interviewer].includes(message.user)
      ) {
        const insertedAiConversation =
          await this.interviewModel.findByIdAndUpdate(
            id,
            {
              $push: {
                conversation: {
                  question: {
                    message: message.message,
                    user: message.user,
                  },
                },
              },
              $inc: {
                currentQuestionIndex: 1,
              },
            },
            { new: true }
          );

        if (insertedAiConversation)
          return {
            success: true,
            data: insertedAiConversation,
          };

        return {
          success: false,
          message: "Error inserting ai conver sation",
        };
      } else if (message.user === InterviewUser.User) {
        const interview = await this.interviewModel.findById(id);

        if (interview) {
          const lastIndex = interview.conversation.length - 1;
          interview.conversation[lastIndex].answer = {
            message: message.message,
            user: message.user,
            timestamp: moment.utc().toDate(),
          };

          const insertedUserResponse = await interview.save();

          if (insertedUserResponse) {
            return {
              success: true,
              data: insertedUserResponse,
            };
          }

          return {
            success: false,
            message: "Error inserting user response",
          };
        }
        return {
          success: false,
          message: "Interview not found",
        };
      }

      return {
        success: false,
        message: "Something went wrong",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(
          error,
          "Error getting interview data"
        ),
      };
    }
  }
}

export default InterviewService;
