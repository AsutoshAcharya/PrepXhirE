import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { InterviewUser } from "../../enums";
import {
  insertInterviewDto,
  ServiceResult,
  UpdateConversationDto,
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
    updateConversationDto: UpdateConversationDto
  ): Promise<ServiceResult<IInterviewDocument>> {
    const { id, userMessage, interviewerMessage, aiFeedback } =
      updateConversationDto;

    try {
      const interview = await this.interviewModel.findById(id);

      if (!interview) {
        return {
          success: false,
          message: "Interview not found",
        };
      }

      const lastIndex = interview.conversation.length - 1;

      if (interview.conversation[lastIndex]) {
        interview.conversation[lastIndex].answer = {
          message: userMessage.message,
          user: userMessage.user,
          timestamp: moment.utc().toDate(),
        };

        if (aiFeedback)
          interview.conversation[lastIndex].aiFeedback = aiFeedback;
      } else {
        return {
          success: false,
          message: "No previous question found to attach the user's answer.",
        };
      }

      interview.conversation.push({
        question: {
          message: interviewerMessage.message,
          user: interviewerMessage.user,
          timestamp: moment.utc().toDate(),
        },
      });

      interview.currentQuestionIndex += 1;

      const updatedInterview = await interview.save();

      if (updatedInterview)
        return {
          success: true,
          data: updatedInterview,
        };

      return {
        success: false,
        message: "Error updating interview conversation",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(
          error,
          "Error updating interview conversation"
        ),
      };
    }
  }
}

export default InterviewService;
