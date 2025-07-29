// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { Dependencies } from "../../container";

import ResponseBuilder from "../../utils/ResponseBuilder";
import { loginSchema, registerSchema } from "./auth.schema";

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
      const resp = this.responseBuilder.badRequest("Invalid payload").build();
      return res.status(resp.status).json(resp);
    }

    const serviceResult = await this.authService.register(result.data);

    if (!serviceResult.success) {
      const resp = this.responseBuilder.conflict(serviceResult.message).build();
      return res.status(resp.status).json(resp);
    }

    const resp = this.responseBuilder
      .success({
        message: "User registered successfully",
        data: serviceResult.data,
      })
      .build();

    return res.status(resp.status).json(resp);
  };

  public logIn = async (req: Request, res: Response) => {
    const parsedResult = loginSchema.safeParse(req.body);
    if (parsedResult.success) {
      const serviceResult = await this.authService.logIn(parsedResult.data);
      if (!serviceResult.success) {
        const resp = this.responseBuilder
          .badRequest(serviceResult.message)
          .build();
        return res.status(resp.status).json(resp);
      }
      const resp = this.responseBuilder
        .success({
          message: "Login successfully",
          data: serviceResult.data,
        })
        .build();
      return res.status(resp.status).json(resp);
    } else {
      const resp = this.responseBuilder
        .badRequest("Invalid login details")
        .build();
      return res.status(resp.status).json(resp);
    }
  };

  // public isMe(req: Request, res: Response): Promise<void> {

  // }
}
