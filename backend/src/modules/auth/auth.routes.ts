import { Router } from "express";
import { register, login, isMe } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/me", isMe);

export default router;
