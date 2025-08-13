import { Server } from "socket.io";
import dotenv from "dotenv";
import { Dependencies } from "../container";
import {
  CustomSocket,
  JoinRoomDto,
  UpdateConversationDto,
} from "../types/type";
import { Server as HttpServer } from "http";
import { Event } from "../enums";
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

  private getJoinInterviewRoomId = ({
    candidateId,
    interviewId,
    sessionId = "", //later have to handle for hosted sessions
    interviewerId = "",
  }: JoinRoomDto) => `${candidateId}${interviewId}${sessionId}${interviewerId}`;

  public sendInterviewResponse({
    joinRoomDto,
    message,
  }: {
    joinRoomDto: JoinRoomDto;
    message: Pick<UpdateConversationDto, "interviewerMessage" | "aiFeedback">;
  }) {
    const roomId = this.getJoinInterviewRoomId(joinRoomDto);
    this.io.to(roomId).emit(Event.InterviewMessage, message);
  }

  public listenInterviewRoomJoins(socket: CustomSocket) {
    socket.on(Event.JoinInterviewRoom, (joinRoomDto: JoinRoomDto) => {
      // console.log(candidateId, interviewId);
      if (!joinRoomDto.candidateId || !joinRoomDto.interviewId) {
        return socket.emit(Event.Error, {
          message: "Missing candidateId or interviewId",
        });
      }

      const roomId = this.getJoinInterviewRoomId(joinRoomDto);
      console.log(roomId);
      socket.join(roomId);
      console.log(`${joinRoomDto.candidateId} user joined room ${roomId}`);
    });
  }

  private listenConnection() {
    this.io.on(Event.Connection, (socket: CustomSocket) => {
      console.log(`User connected: ${socket.id}`);

      //user sends this event

      // socket.on("message", (data) => {
      //   console.log(data);
      // });

      this.listenInterviewRoomJoins(socket);

      socket.on(Event.Disconnect, () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketServer;
