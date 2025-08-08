import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import mcqRoutes from "./modules/mcq/mcq.routes";
import hostedSessionRoutes from "./modules/hostedSession/hostedSession.routes";
import interviewRoutes from "./modules/interview/interview.routes";
import connectToDb from "./config/db";

dotenv.config();

// let maxToken = 10;
// setInterval(() => {
//   maxToken = 10;
//   console.log(maxToken);
// }, 60000);

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
    // this.app.use("/", (req: Request, res: Response, next: NextFunction) => {
    //   console.log(req.ip);
    //   if (maxToken === 0) return res.status(409).send("Too many requests");
    //   maxToken--;
    //   next();
    // });
  }

  private setupRoutes() {
    this.app.use("/auth", authRoutes);
    this.app.use("/mcq", mcqRoutes);
    this.app.use("/hosted-session", hostedSessionRoutes);
    this.app.use("/interview", interviewRoutes);
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
