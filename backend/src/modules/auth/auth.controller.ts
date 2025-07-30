import { Request, Response } from "express";
import { Dependencies } from "../../container";
import { loginSchema, registerSchema } from "./auth.schema";
import ResponseBuilder from "../../utils/ResponseBuilder";
export default class AuthController {
  private readonly authService;
  private readonly responseBuilder;

  constructor({ authService }: Dependencies) {
    this.authService = authService;
    this.responseBuilder = new ResponseBuilder({ type: "auth" });
  }

  public register = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return this.responseBuilder.badRequest("Invalid payload").send(res);
    }

    const serviceResult = await this.authService.register(result.data);

    if (!serviceResult.success) {
      return this.responseBuilder.conflict(serviceResult.message).send(res);
    }

    return this.responseBuilder
      .success({
        message: "User registered successfully",
        data: serviceResult.data,
      })
      .send(res);
  };

  public logIn = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return this.responseBuilder.badRequest("Invalid login details").send(res);
    }

    const serviceResult = await this.authService.logIn(result.data);

    if (!serviceResult.success) {
      return this.responseBuilder.badRequest(serviceResult.message).send(res);
    }

    return this.responseBuilder
      .success({
        message: "Login successfully",
        data: serviceResult.data,
      })
      .send(res);
  };
}
