import { Types } from "mongoose";

function toMongoObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

export default toMongoObjectId;
