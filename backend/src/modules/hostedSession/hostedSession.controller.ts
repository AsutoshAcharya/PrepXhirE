import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";
import { hostedSessionSchema } from "./hostedSession.schema";

class HostedSessionController {
  private readonly rb;
  constructor({}: Dependencies) {
    this.rb = new ResponseBuilder({
      type: "hosted-session",
    });
  }
  public hostSession = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);

    const result = hostedSessionSchema.safeParse(req.body);

    if (!result.success) {
      return this.rb.badRequest("Invalid payload data").send(res);
    }
  };
}

export default HostedSessionController;
