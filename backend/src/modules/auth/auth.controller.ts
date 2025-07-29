// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { Dependencies } from "../../container";

import ResponseBuilder from "../../utils/ResponseBuilder";

export default class AuthController {
  private readonly authService;
  private readonly responseBuilder;
  constructor({ authService }: Dependencies) {
    this.authService = authService;
    this.responseBuilder = new ResponseBuilder({ type: "auth" });
    //we can use bind or direct arrow function

    // this.logIn = this.logIn.bind(this);
    // this.register = this.register.bind(this);
  }

  public register = (req: Request, res: Response) => {
    const resp = this.responseBuilder
      .success({ message: "Registered successfully" })
      .build();
    // console.log(resp);
    res.status(resp.status).json(resp);
  };

  public logIn = (req: Request, res: Response) => {};

  // public isMe(req: Request, res: Response): Promise<void> {

  // }
}
