import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";

class HostedSessionController {
  private readonly rb;
  constructor({}: Dependencies) {
    this.rb = new ResponseBuilder({
      type: "hosted-session",
    });
  }
  public hostSession(req: CustomRequest, res: Response) {
    return this.rb
      .success({
        message: "hosted-session",
      })
      .send(res);
  }
}

export default HostedSessionController;
