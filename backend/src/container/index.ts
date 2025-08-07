import { asClass, asValue, AwilixContainer, createContainer } from "awilix";
import { Model } from "mongoose";

//middlewares
import Authenticator from "../middlewares/authenticator";

//comtrollers
import McqController from "../modules/mcq/mcq.controller";
import AuthController from "../modules/auth/auth.controller";
import HostedSessionController from "../modules/hostedSession/hostedSession.controller";

//services
import AiService from "../modules/ai/ai.service";
import AuthService from "../modules/auth/auth.service";
import McqService from "../modules/mcq/mcq.service";
import HostedSessionService from "../modules/hostedSession/hosterSession.service";
import SubmissionService from "../modules/submission/submission.service";

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

  authController: AuthController;
  mcqController: McqController;
  hostedSessionController: HostedSessionController;

  authService: AuthService;
  mcqService: McqService;
  aiService: AiService;
  submissionService: SubmissionService;
  hostedSessionService: HostedSessionService;

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

  authController: asClass(AuthController).singleton(),
  mcqController: asClass(McqController).singleton(),
  hostedSessionController: asClass(HostedSessionController).singleton(),

  authService: asClass(AuthService).singleton(),
  mcqService: asClass(McqService).singleton(),
  aiService: asClass(AiService).singleton(),
  submissionService: asClass(SubmissionService).singleton(),
  hostedSessionService: asClass(HostedSessionService).singleton(),

  userModel: asValue(UserModel),
  mcqModel: asValue(McqModel),
  submissionModel: asValue(SubmissionModel),
  hostedSessionModel: asValue(HostedSessionModel),
  mcqRoundModel: asValue(McqRoundModel),
  interviewModel: asValue(InterviewModel),
});

export default container;
