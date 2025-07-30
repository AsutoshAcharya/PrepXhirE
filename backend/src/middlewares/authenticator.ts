import { NextFunction, Response } from "express";
import ResponseBuilder from "../utils/ResponseBuilder";
import jwt from "jsonwebtoken";
import Some from "../utils/Some";
import { CustomRequest, JwtDecodeData } from "../types/type";
import { User } from "../models/user.model";

function authenticator(req: CustomRequest, res: Response, next: NextFunction) {
  const rb = new ResponseBuilder({ type: "auth" });

  try {
    // console.log(req.headers);
    const token = Some.String(req.headers["token"]);
    const userId = Some.String(req.headers["user"]);
    console.log(token, userId);
    if (!token || !userId) {
      const responseBuilder = rb.unauthorized().build();
      return res.status(responseBuilder.status).send(responseBuilder);
    }
    jwt.verify(token, process.env.JWT as string, async (err, decodeData) => {
      if (err) throw new Error();
      console.log(decodeData);
      const { id } = decodeData as JwtDecodeData;
      const user = await User.findById(id);
      console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        const responseBuilder = rb.notFound().build();
        res.status(responseBuilder.status).json(responseBuilder);
      }
    });
  } catch (error) {
    const responseBuilder = rb.unauthorized().build();
    res.status(responseBuilder.status).send(responseBuilder);
  }
}

export default authenticator;
