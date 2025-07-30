import { asClass, asValue, AwilixContainer, createContainer } from "awilix";
import { User as UserModel } from "../models/user.model";

import { McqQuestion as McqModel } from "../models/mcq.model";

import { Model } from "mongoose";
import AuthService from "../modules/auth/auth.service";
import AuthController from "../modules/auth/auth.controller";
import { IUserDocument } from "../models/user.model";
import ResponseBuilder from "../utils/ResponseBuilder";
import { IMcqDocument } from "../models/mcq.model";

export interface Dependencies {
  userModel: Model<IUserDocument>;
  mcqModel: Model<IMcqDocument>;
  authService: AuthService;
  authController: AuthController;
}

const container: AwilixContainer<Dependencies> = createContainer();

container.register({
  userModel: asValue(UserModel),
  mcqModel: asValue(McqModel),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
});

export default container;
