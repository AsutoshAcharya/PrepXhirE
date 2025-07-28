import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to mongoDb");
  } catch (error) {
    console.log("Connection error");
    console.log(error);
  }
};
export default connectToDb;
