import { Request, Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";
import McqService from "./mcq.service";
import { createMcqSchema } from "./mcq.schema";
import ResponseBuilder from "../../utils/ResponseBuilder";

class McqController {
  private readonly mcqService: McqService;
  private readonly responseBuilder;
  constructor({ mcqService }: Dependencies) {
    this.mcqService = mcqService;
    this.responseBuilder = new ResponseBuilder({ type: "mcq" });
  }

  public createMcq = (req: CustomRequest, res: Response) => {
    const result = createMcqSchema.safeParse(req.body);
  };
}

export default McqController;
