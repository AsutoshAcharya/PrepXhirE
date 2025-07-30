import { Dependencies } from "../../container";
import { CreateMcqDto } from "./mcq.schema";

class McqService {
  constructor({}: Dependencies) {}

  createMcq(insertData: CreateMcqDto) {}
}

export default McqService;
