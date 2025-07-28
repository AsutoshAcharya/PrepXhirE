import { asClass, asValue, AwilixContainer, createContainer } from "awilix";
import { User as UserModel } from "../models/user.model";
import { Model } from "mongoose";
import AuthService from "../modules/auth/auth.service";
import AuthController from "../modules/auth/auth.controller";
import { IUserDocument } from "../models/user.model";

export interface Dependencies {
  userModel: Model<IUserDocument>;
  authService: AuthService;
  authController: AuthController;
}

const container: AwilixContainer<Dependencies> = createContainer();

container.register({
  userModel: asValue(UserModel),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
});

export default container;
