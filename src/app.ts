import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { issuesRouter } from "./modules/issues/issues.routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigins.includes("*") ? true : env.corsOrigins
  })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.use(notFound);
app.use(errorHandler);
