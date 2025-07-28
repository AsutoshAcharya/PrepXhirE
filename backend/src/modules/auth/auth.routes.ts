import { Router } from "express";
import container from "../../container";
// import { register, login, isMe } from "./auth.controller";
const router = Router();
const controller = container.resolve("authController");

router.post("/register", controller.register);
router.post("/login", controller.logIn);
// router.post("/me", controller.isMe);

export default router;
