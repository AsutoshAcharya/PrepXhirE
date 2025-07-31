import { asClass, asValue, AwilixContainer, createContainer } from "awilix";
import { User as UserModel } from "../models/user.model";

import { McqQuestion as McqModel } from "../models/mcq.model";

import { Model } from "mongoose";
import AuthService from "../modules/auth/auth.service";
import AuthController from "../modules/auth/auth.controller";
import { IUserDocument } from "../models/user.model";
import { IMcqDocument } from "../models/mcq.model";
import McqService from "../modules/mcq/mcq.service";
import McqController from "../modules/mcq/mcq.controller";
import Authenticator from "../middlewares/authenticator";
import AiService from "../modules/ai/ai.service";

export interface Dependencies {
  authenticator: Authenticator;
  userModel: Model<IUserDocument>;
  mcqModel: Model<IMcqDocument>;
  authService: AuthService;
  authController: AuthController;
  mcqService: McqService;
  mcqController: McqController;
  aiService: AiService;
}

const container: AwilixContainer<Dependencies> = createContainer();

container.register({
  authenticator: asClass(Authenticator).singleton(),
  userModel: asValue(UserModel),
  mcqModel: asValue(McqModel),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
  mcqService: asClass(McqService).singleton(),
  mcqController: asClass(McqController).singleton(),
  aiService: asClass(AiService).singleton(),
});

export default container;
