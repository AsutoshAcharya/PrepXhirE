// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { Dependencies } from "../../container";
import AuthService from "./auth.service";

export default class AuthController {
  private readonly authService;

  constructor({ authService }: Dependencies) {
    this.authService = authService;
  }

  public register(req: Request, res: Response) {
    this.authService.register();
  }

  public logIn(req: Request, res: Response) {}

  // public isMe(req: Request, res: Response): Promise<void> {

  // }
}
