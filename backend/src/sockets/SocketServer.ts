import { Server } from "socket.io";
import dotenv from "dotenv";
import { Dependencies } from "../container";
import { CustomSocket } from "../types/type";
dotenv.config();

class SocketServer {
  private readonly io;
  private readonly port;
  private readonly authenticator;

  constructor({ authenticator }: Dependencies) {
    this.authenticator = authenticator;

    this.port = Number(process.env.PORT) || 8800;
    this.io = new Server(this.port);

    // this.setupMiddlewres();
    this.listenConnection();
  }

  private setupMiddlewres() {
    this.io.use(this.authenticator.verifySocketToken);
  }

  private listenConnection() {
    this.io.on("connection", (socket: CustomSocket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketServer;
