import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest, HostedSessionDto, McqRoundDto } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";
import { hostedSessionSchema } from "./hostedSession.schema";
import Some from "../../utils/Some";
import toMongoObjectId from "../../utils/toMongoObjectId";
import moment from "moment";
import { CandidateStatus } from "../../enums";

class HostedSessionController {
  private readonly rb;
  private readonly hostedSessionService;
  constructor({ hostedSessionService }: Dependencies) {
    this.hostedSessionService = hostedSessionService;
    this.rb = new ResponseBuilder({
      type: "hosted-session",
    });
  }
  public hostSession = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const result = hostedSessionSchema.safeParse(req.body);

    if (!result.success) {
      return this.rb.badRequest("Invalid payload data").send(res);
    }
    if (result.data.mcq) {
      const { roundTime, questionIds } = result.data.mcq;
      const mcqRoundData: McqRoundDto = {
        roundTime,
        questionIds: Some.Array(questionIds).map(toMongoObjectId),
      };

      const {
        title,
        jobTitle,
        jobLocation,
        jobDescription,
        requiredSkills,
        organizationName,
        isPublic,
        rounds: { mcq, coding, interview },
        expireDate,
        candidates,
        access,
      } = result.data;

      const hostedSessionData: HostedSessionDto = {
        interviewerId: req.user._id,
        title,
        jobTitle,
        jobLocation,
        jobDescription,
        requiredSkills,
        organizationName,
        isPublic,
        rounds: {
          mcq: Some.Boolean(mcq),
          coding: Some.Boolean(coding),
          interview: Some.Boolean(interview),
        },
        ...(expireDate && { expireDate: moment(expireDate).utc().toDate() }),
        candidates: candidates.map((c) => ({
          candidateId: toMongoObjectId(c),
          status: CandidateStatus.Invited,
        })),
        ...(access && {
          access: {
            inviteCode: Some.String(access?.inviteCode),
            ...(access.maxCandidates && {
              maxCandidates: Some.Number(access?.maxCandidates),
            }),
          },
        }),
      };

      const hoserdSessionSserviceResult =
        await this.hostedSessionService.hostSession({
          mcqRoundDto: mcqRoundData,
          hostedSessionDto: hostedSessionData,
        });

      if (hoserdSessionSserviceResult.success) {
        return this.rb
          .success({
            message: "Interview Hosted Successfully",
            data: hoserdSessionSserviceResult.data,
          })
          .send(res);
      }

      return this.rb.serverError(hoserdSessionSserviceResult.message).send(res);
    }
  };

  public getPublicSessions = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    const { limit, offset } = req.query;

    if (!limit || !offset)
      return this.rb.badRequest("Missing limit, Offset").send(res);

    const hostedSessionServiceResult =
      await this.hostedSessionService.getPublicSessions(
        Some.Number(limit),
        Some.Number(offset)
      );

    if (hostedSessionServiceResult.success)
      return this.rb
        .success({
          message: "Fetched Public Sessions",
          data: hostedSessionServiceResult.data,
        })
        .send(res);

    return this.rb.serverError(hostedSessionServiceResult.message).send(res);
  };

  public getOwnHostedSessions = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const interviewerId = Some.String(req.params.interviewerId);
    if (!interviewerId)
      return this.rb.badRequest("Missing interviewerId").send(res);

    const hostedSessionServiceResult =
      await this.hostedSessionService.getSessionsByInterviewerId(
        toMongoObjectId(interviewerId)
      );

    if (hostedSessionServiceResult.success)
      return this.rb
        .success({
          message: "Fetched personal sessions",
          data: hostedSessionServiceResult.data,
        })
        .send(res);

    return this.rb.serverError(hostedSessionServiceResult.message).send(res);
  };
}

export default HostedSessionController;
