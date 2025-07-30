import { Request, Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";

class McqController {
  constructor({}: Dependencies) {}

  public createMcq(req: CustomRequest, res: Response) {
    console.log("Question created");
    res.status(200).send("Question created");
  }
}

export default McqController;
