import { Types } from "mongoose";
import { Dependencies } from "../../container";
import { IHostedSessionDocument } from "../../models/hostedSession.model";
import { SessionDto, ServiceResult, SessionCandidate } from "../../types/type";
import ErrorUtils from "../../utils/ErrorUtils";
import { CandidateStatus } from "../../enums";
import toMongoObjectId from "../../utils/toMongoObjectId";
import { IMcqDocument } from "../../models/mcq.model";
import pick from "../../utils/pick";

class HostedSessionService {
  private readonly mcqRoundModel;
  private readonly hostedSessionModel;
  private readonly mcqModel;
  private readonly mcqService;
  constructor({
    mcqRoundModel,
    hostedSessionModel,
    mcqModel,
    mcqService,
  }: Dependencies) {
    this.mcqRoundModel = mcqRoundModel;

    this.hostedSessionModel = hostedSessionModel;

    this.mcqModel = mcqModel;
    this.mcqService = mcqService;
  }

  public async hostSession({
    mcqRoundDto, //may or may not be available interviewer can later select specific rounds for now its required
    hostedSessionDto,
  }: SessionDto): Promise<ServiceResult<IHostedSessionDocument>> {
    let mcqRoundId;
    try {
      const mcqRoundInsertResult =
        await this.mcqRoundModel.insertOne(mcqRoundDto);

      if (!mcqRoundInsertResult || !mcqRoundInsertResult._id) {
        return {
          success: false,
          message: "Error adding MCQ round",
        };
      }
      mcqRoundId = mcqRoundInsertResult._id;

      const hostedSession = await this.hostedSessionModel.insertOne({
        ...hostedSessionDto,
        questionSet: {
          mcqRoundId: mcqRoundInsertResult._id,
        },
      });

      if (!hostedSession || !hostedSession._id) {
        await this.mcqRoundModel.deleteOne(mcqRoundInsertResult._id);
        return {
          success: false,
          message: "Error hosting session",
        };
      }

      return {
        success: true,
        data: hostedSession,
      };
    } catch (error) {
      if (mcqRoundId) await this.mcqRoundModel.deleteOne(mcqRoundId);
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error hosting session"),
      };
    }
  }

  public async getPublicSessions(
    limit: number,
    offset: number
  ): Promise<ServiceResult<Array<IHostedSessionDocument>>> {
    try {
      const sessions = await this.hostedSessionModel
        .find({ isPublic: true }, { access: 0 })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      return {
        success: true,
        data: sessions,
      };
    } catch (error) {
      console.log("Hosting error", error);
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(
          error,
          "Error getting public sessions"
        ),
      };
    }
  }

  public async getSessionsByInterviewerId(
    interviewerId: Types.ObjectId
  ): Promise<ServiceResult<Array<IHostedSessionDocument>>> {
    try {
      const sessions = await this.hostedSessionModel
        .find({ interviewerId })
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: sessions,
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(
          error,
          "Error getting own sessions"
        ),
      };
    }
  }

  public async joinSession(
    sessionId: Types.ObjectId,
    candidateId: Types.ObjectId
  ): Promise<
    ServiceResult<{
      session: Partial<IHostedSessionDocument>;
      mcqQuestions: Array<Partial<IMcqDocument>>;
    }>
  > {
    try {
      const interviewSession = await this.hostedSessionModel.findOne({
        _id: sessionId,
      });

      if (!interviewSession) {
        return {
          success: false,
          message: "Session not found",
        };
      }

      const candidateIndex = interviewSession.candidates.findIndex(
        (c) => String(c.candidateId) === String(candidateId)
      );

      if (candidateIndex === -1) {
        interviewSession.candidates.push({
          candidateId,
          status: CandidateStatus.In_Progress,
        });
      } else {
        if (
          interviewSession.candidates[candidateIndex].status !==
          CandidateStatus.Invited
        )
          return {
            success: false,
            message: "You have already joined this session",
          };
        interviewSession.candidates[candidateIndex].status =
          CandidateStatus.In_Progress;
      }

      const updatedInterviewSession = await interviewSession.save();

      if (!updatedInterviewSession) {
        return {
          success: false,
          message: "Error updating session",
        };
      }

      const mcqRoundData = await this.mcqRoundModel.findOne({
        _id: updatedInterviewSession.questionSet?.mcqRoundId,
      });

      //later have to update it when adding other rounds
      if (!mcqRoundData) {
        return {
          success: false,
          message: "Error getting mcq round questions",
        };
      }

      const questionIds = mcqRoundData.questionIds.map((id) =>
        toMongoObjectId(id)
      );
      const mcqServiceResult =
        await this.mcqService.getBulkMcqsByIds(questionIds);

      if (mcqServiceResult.success) {
        return {
          success: true,
          data: {
            session: updatedInterviewSession,
            mcqQuestions: mcqServiceResult.data.map((mcq) =>
              pick(mcq, "_id", "difficulty", "createdAt", "question", "options")
            ),
          },
        };
      }

      return {
        success: false,
        message: "Error getting mcqs",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Failed to join session"),
      };
    }
  }

  public async getSessionById(
    id: Types.ObjectId
  ): Promise<ServiceResult<IHostedSessionDocument>> {
    try {
      const session = await this.hostedSessionModel.findOne(id);
      if (session)
        return {
          success: true,
          data: session,
        };
      return {
        success: false,
        message: "Session not found",
      };
    } catch (error) {
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error getting session"),
      };
    }
  }
}

export default HostedSessionService;
