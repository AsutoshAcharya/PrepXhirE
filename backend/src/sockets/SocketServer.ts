import { Server } from "socket.io";
import dotenv from "dotenv";
import { Dependencies } from "../container";
import { CustomSocket } from "../types/type";
import { Server as HttpServer } from "http";
dotenv.config();

class SocketServer {
  public io: Server;
  private readonly authenticator;

  constructor({ authenticator }: Dependencies) {
    this.authenticator = authenticator;
    this.io = new Server();
  }

  public init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    // this.setupMiddlewres();
    this.listenConnection();
  }

  private setupMiddlewres() {
    this.io.use(this.authenticator.verifySocketToken);
  }

  private listenConnection() {
    this.io.on("connection", (socket: CustomSocket) => {
      console.log(`User connected: ${socket.id}`);

      //user sends this event

      socket.on("message", (data) => {
        console.log(data);
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketServer;
