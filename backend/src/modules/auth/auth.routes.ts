import { Request, Response, Router } from "express";
import container from "../../container";

// import { register, login, isMe } from "./auth.controller";
const router = Router();
const controller = container.resolve("authController");
const authenticator = container.resolve("authenticator");
router
  .post("/register", controller.register)
  .post("/login", controller.logIn)
  .get("/test", authenticator.verifyToken, (req: Request, res: Response) => {
    res.status(200).send("Verified");
  });

// router.post("/me", controller.isMe);

export default router;
