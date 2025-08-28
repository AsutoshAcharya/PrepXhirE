import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import mcqRoutes from "./modules/mcq/mcq.routes";
import hostedSessionRoutes from "./modules/hostedSession/hostedSession.routes";
import interviewRoutes from "./modules/interview/interview.routes";
import submissionRoutes from "./modules/submission/submission.routes";
import connectToDb from "./config/db";
import { createServer } from "http";
import SocketServer from "./sockets/SocketServer";
import container from "./container";
import rateLimit from "express-rate-limit";
import ResponseBuilder from "./utils/ResponseBuilder";

const socketServer = container.resolve<SocketServer>("socketServer");

dotenv.config();

class App {
  private app: Express;
  private port: number;
  private httpServer;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8800;
    this.httpServer = createServer(this.app);
    socketServer.init(this.httpServer);

    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    const limiter = rateLimit({
      limit: 1000,
      windowMs: 600000,
      handler: (_req: Request, res: Response) => {
        const rb = new ResponseBuilder({ type: "rate_limit_exceeded" });
        return rb.tooManyRequests().send(res);
      },
    });
    this.app.use("/", limiter);

    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private setupRoutes() {
    this.app.use("/auth", authRoutes);
    this.app.use("/mcq", mcqRoutes);
    this.app.use("/hosted-session", hostedSessionRoutes);
    this.app.use("/interview", interviewRoutes);
    this.app.use("/submission", submissionRoutes);
  }

  public async run() {
    try {
      await connectToDb();
      this.httpServer.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
    } catch (error) {
      console.error("Failed to start the server:", error);
    }
  }
}

export default App;
