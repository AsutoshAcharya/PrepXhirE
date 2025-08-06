import { Dependencies } from "../../container";
import { IHostedSessionDocument } from "../../models/hostedSession.model";
import { SessionDto, ServiceResult } from "../../types/type";
import ErrorUtils from "../../utils/ErrorUtils";

class HostedSessionService {
  private readonly mcqRoundModel;
  private readonly hostedSessionModel;
  constructor({ mcqRoundModel, hostedSessionModel }: Dependencies) {
    this.mcqRoundModel = mcqRoundModel;
    this.hostedSessionModel = hostedSessionModel;
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
        hostedSessionDto,
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
}

export default HostedSessionService;
