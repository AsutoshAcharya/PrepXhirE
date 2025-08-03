import mongoose from "mongoose";
import { McqQuestion } from "../models/mcq.model";
import dotenv from "dotenv";
dotenv.config();
async function migrate() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const result = await McqQuestion.updateMany(
    { questionTopic: { $exists: false } },
    { $set: { questionTopic: "" } }
  );

  console.log(`Updated ${result.modifiedCount} documents`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
