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
    const session = await this.mcqRoundModel.db.startSession();

    try {
      session.startTransaction();
      //will have to haldle this accordingly
      const mcqRoundInsertResult = await this.mcqRoundModel.insertOne(
        mcqRoundDto,
        { session }
      );

      if (!mcqRoundInsertResult) {
        await session.abortTransaction();
        return {
          success: false,
          message: "Error adding mcq round",
        };
      }

      const hostedSession = await this.hostedSessionModel.insertOne(
        {
          ...hostedSessionDto,
          questionSet: {
            mcqRoundId: mcqRoundInsertResult._id,
          },
        },
        { session }
      );

      if (!hostedSession) {
        await session.abortTransaction();
        return {
          success: false,
          message: "Error hosting session",
        };
      }

      await session.commitTransaction();

      return {
        success: true,
        data: hostedSession,
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Error hosting session"),
      };
    } finally {
      session.endSession();
    }
  }

  public async getPublicSessions(
    limit: number,
    offset: number
  ): Promise<ServiceResult<Array<IHostedSessionDocument>>> {
    try {
      const sessions = await this.hostedSessionModel
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      return {
        success: true,
        data: sessions,
      };
    } catch (error) {
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
    const session = await this.hostedSessionModel.db.startSession();

    try {
      session.startTransaction();

      const interviewSession = await this.hostedSessionModel
        .findOne({ _id: sessionId })
        .session(session);

      if (!interviewSession) {
        await session.abortTransaction();
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
        interviewSession.candidates[candidateIndex].status =
          CandidateStatus.In_Progress;
      }

      const updatedInterviewSession = await interviewSession.save({ session });

      if (!updatedInterviewSession) {
        await session.abortTransaction();
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
        await session.abortTransaction();
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
        await session.commitTransaction();
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

      await session.abortTransaction();
      return {
        success: false,
        message: "Error getting mcqs",
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        message: ErrorUtils.getErrorMessage(error, "Failed to join session"),
      };
    } finally {
      await session.endSession();
    }
  }
}

export default HostedSessionService;
