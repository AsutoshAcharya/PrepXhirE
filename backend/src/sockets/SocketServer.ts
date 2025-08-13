import { Server } from "socket.io";
import dotenv from "dotenv";
import { Dependencies } from "../container";
import { CustomSocket } from "../types/type";
import { Server as HttpServer } from "http";
import { SocketRooms } from "../enums";
import { Types } from "mongoose";
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

    this.setupMiddlewres();
    this.listenConnection();
  }

  private setupMiddlewres() {
    this.io.use(this.authenticator.verifySocketToken);
  }

  public listenInterviewRoomJoins(socket: CustomSocket) {
    socket.on(
      SocketRooms.joinInterviewRoom,
      ({}: {
        candidateId: Types.ObjectId;
        interviewId: Types.ObjectId;
        sessionId?: Types.ObjectId;
        interviewerId?: Types.ObjectId;
      }) => {}
    );
  }

  private listenConnection() {
    this.io.on("connection", (socket: CustomSocket) => {
      console.log(`User connected: ${socket.id}`);

      //user sends this event

      socket.on("message", (data) => {
        console.log(data);
      });

      this.listenInterviewRoomJoins(socket);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketServer;
