import { asClass, asValue, AwilixContainer, createContainer } from "awilix";
import { Model } from "mongoose";

//middlewares
import Authenticator from "../middlewares/authenticator";
import SocketServer from "../sockets/SocketServer";

//comtrollers
import McqController from "../modules/mcq/mcq.controller";
import AuthController from "../modules/auth/auth.controller";
import HostedSessionController from "../modules/hostedSession/hostedSession.controller";
import InterviewController from "../modules/interview/interview.controller";
import SubmissionController from "../modules/submission/submission.controller";

//services
import AiService from "../modules/ai/ai.service";
import AuthService from "../modules/auth/auth.service";
import McqService from "../modules/mcq/mcq.service";
import HostedSessionService from "../modules/hostedSession/hosterSession.service";
import SubmissionService from "../modules/submission/submission.service";
import InterviewService from "../modules/interview/interview.service";

//models
import { UserModel, IUserDocument } from "../models/user.model";
import {
  McqQuestionModel as McqModel,
  IMcqDocument,
} from "../models/mcq.model";
import {
  ISubmissionDocument,
  SubmissionModel,
} from "../models/submission.model";
import {
  HostedSessionModel,
  IHostedSessionDocument,
} from "../models/hostedSession.model";
import { McqRoundModel, IMcqRoundDocument } from "../models/mcqRound.model";
import { InterviewModel, IInterviewDocument } from "../models/interview.model";

export interface Dependencies {
  authenticator: Authenticator;
  socketServer: SocketServer;

  authController: AuthController;
  mcqController: McqController;
  hostedSessionController: HostedSessionController;
  interviewController: InterviewController;
  submissionController: SubmissionController;

  authService: AuthService;
  mcqService: McqService;
  aiService: AiService;
  submissionService: SubmissionService;
  hostedSessionService: HostedSessionService;
  interviewService: InterviewService;

  userModel: Model<IUserDocument>;
  mcqModel: Model<IMcqDocument>;
  submissionModel: Model<ISubmissionDocument>;
  hostedSessionModel: Model<IHostedSessionDocument>;
  mcqRoundModel: Model<IMcqRoundDocument>;
  interviewModel: Model<IInterviewDocument>;
}

const container: AwilixContainer<Dependencies> = createContainer();

container.register({
  authenticator: asClass(Authenticator).singleton(),
  socketServer: asClass(SocketServer).singleton(),

  authController: asClass(AuthController).singleton(),
  mcqController: asClass(McqController).singleton(),
  hostedSessionController: asClass(HostedSessionController).singleton(),
  interviewController: asClass(InterviewController).singleton(),
  submissionController: asClass(SubmissionController).singleton(),

  authService: asClass(AuthService).singleton(),
  mcqService: asClass(McqService).singleton(),
  aiService: asClass(AiService).singleton(),
  submissionService: asClass(SubmissionService).singleton(),
  hostedSessionService: asClass(HostedSessionService).singleton(),
  interviewService: asClass(InterviewService).singleton(),

  userModel: asValue(UserModel),
  mcqModel: asValue(McqModel),
  submissionModel: asValue(SubmissionModel),
  hostedSessionModel: asValue(HostedSessionModel),
  mcqRoundModel: asValue(McqRoundModel),
  interviewModel: asValue(InterviewModel),
});

export default container;
