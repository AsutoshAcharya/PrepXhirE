// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { Dependencies } from "../../container";
import AuthService from "./auth.service";

export default class AuthController {
  private readonly authService: AuthService;

  constructor({ authService }: Dependencies) {
    this.authService = authService;

    //we can use bind or direct arrow function

    // this.logIn = this.logIn.bind(this);
    // this.register = this.register.bind(this);
  }

  public register = (req: Request, res: Response) => {
    this.authService.register();
  };

  public logIn = (req: Request, res: Response) => {};

  // public isMe(req: Request, res: Response): Promise<void> {

  // }
}
