import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(authRoutes);

export default app;
