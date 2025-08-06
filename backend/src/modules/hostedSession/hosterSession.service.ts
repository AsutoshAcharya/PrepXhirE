import { Dependencies } from "../../container";
import { McqRoundDto } from "./hostedSession.schema";

class HostedSessionService {
  private readonly mcqModel;
  private readonly hostedSessionModel;
  constructor({ mcqModel, hostedSessionModel }: Dependencies) {
    this.mcqModel = mcqModel;
    this.hostedSessionModel = hostedSessionModel;
  }

  public async hostSession(mcqRoundDto: McqRoundDto) {}
}

export default HostedSessionService;
