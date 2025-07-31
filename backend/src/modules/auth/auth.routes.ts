import { Router } from "express";
import container from "../../container";

const router = Router();
const controller = container.resolve("authController");
router.post("/register", controller.register).post("/login", controller.logIn);

export default router;
