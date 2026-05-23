import { Router } from "express";
import { login, signup } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
