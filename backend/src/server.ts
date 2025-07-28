import dotenv from "dotenv";
import app from "./app";
import connectToDb from "./config/db";
import mongoose from "mongoose";

dotenv.config();
const port = process.env.PORT || 8800;

connectToDb().then(() => {
  app.listen(port, async () => {
    // const myDb = await mongoose.connection.useDb("mydb", { useCache: true });
    // const students = await myDb.collection("students").find({}).toArray();
    // console.log(students);

    console.log(`Server running on port ${port}`);
  });
});
