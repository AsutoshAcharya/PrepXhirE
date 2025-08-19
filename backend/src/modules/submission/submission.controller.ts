import { Response } from "express";
import { Dependencies } from "../../container";
import { CustomRequest } from "../../types/type";
import ResponseBuilder from "../../utils/ResponseBuilder";
import Some from "../../utils/Some";
import { isValidObjectId } from "mongoose";

class SubmissionController {
  private readonly submissionService;
  private readonly rb;
  constructor({ submissionService }: Dependencies) {
    this.submissionService = submissionService;
    this.rb = new ResponseBuilder({ type: "submission" });
  }

  public getUserSumbission = async (req: CustomRequest, res: Response) => {
    if (!req.user) return this.rb.unauthorized().send(res);
    const candidateId = Some.String(req.params.id);

    if (!candidateId)
      return this.rb.badRequest("Missing candidateId").send(res);

    if (!isValidObjectId(candidateId))
      return this.rb.badRequest("Invalid candidateId").send(res);

    const { startDate, endDate } = req.query; //yyyy-mm-dd

    const userSubmissionResult = await this.submissionService.getUserSubmission(
      {
        candidateId: Some.MongoId(candidateId),
        startDate: Some.String(startDate),
        endDate: Some.String(endDate),
      }
    );

    if (!userSubmissionResult.success)
      return this.rb.serverError(userSubmissionResult.message).send(res);

    return this.rb
      .success({
        message: "Candidate submissions fetched successfully",
        data: userSubmissionResult.data,
      })
      .send(res);
  };
}

export default SubmissionController;
