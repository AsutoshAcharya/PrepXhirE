import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import mcqRoutes from "./modules/mcq/mcq.routes";
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
    this.app.use("/auth", authRoutes);
    this.app.use("/mcq", mcqRoutes);
  }

  public async run() {
    try {
      await connectToDb();
      this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
    } catch (error) {
      console.error("Failed to start the server:", error);
    }
  }
}

export default App;
