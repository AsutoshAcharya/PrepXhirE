import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import authRoutes from "./modules/auth/auth.routes";
import dotenv from "dotenv";
import connectToDb from "./config/db";

dotenv.config();

class App {
  private app: Express;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8800;

    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private setupRoutes() {
    this.app.use(authRoutes);
  }

  public async run() {
    await connectToDb().then(async () => {
      const myDb = mongoose.connection.useDb("mydb", { useCache: true });
      const students = await myDb.collection("students").find({}).toArray();
      console.log("Student", students);
      this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
    });
  }
}

export default App;
