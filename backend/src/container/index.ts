import { asClass, asValue, AwilixContainer, createContainer } from "awilix";
import { Model } from "mongoose";

//middlewares
import Authenticator from "../middlewares/authenticator";

//comtrollers
import McqController from "../modules/mcq/mcq.controller";
import AuthController from "../modules/auth/auth.controller";

//services
import AiService from "../modules/ai/ai.service";
import AuthService from "../modules/auth/auth.service";
import McqService from "../modules/mcq/mcq.service";

//models
import { User as UserModel, IUserDocument } from "../models/user.model";
import { McqQuestion as McqModel, IMcqDocument } from "../models/mcq.model";
import {
  ISubmissionDocument,
  Submission as SubmissionModel,
} from "../models/submission.model";

export interface Dependencies {
  authenticator: Authenticator;

  authController: AuthController;
  mcqController: McqController;

  authService: AuthService;
  mcqService: McqService;
  aiService: AiService;

  userModel: Model<IUserDocument>;
  mcqModel: Model<IMcqDocument>;
  submissionModel: Model<ISubmissionDocument>;
}

const container: AwilixContainer<Dependencies> = createContainer();

container.register({
  authenticator: asClass(Authenticator).singleton(),

  authController: asClass(AuthController).singleton(),
  mcqController: asClass(McqController).singleton(),

  authService: asClass(AuthService).singleton(),
  mcqService: asClass(McqService).singleton(),
  aiService: asClass(AiService).singleton(),

  userModel: asValue(UserModel),
  mcqModel: asValue(McqModel),
  submissionModel: asValue(SubmissionModel),
});

export default container;
