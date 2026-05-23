import { Router } from "express";
import { authenticate, requireMaintainer } from "../../middleware/auth";
import { create, findAll, findOne, remove, update } from "./issues.controller";

export const issuesRouter = Router();

issuesRouter.get("/", findAll);
issuesRouter.get("/:id", findOne);
issuesRouter.post("/", authenticate, create);
issuesRouter.patch("/:id", authenticate, update);
issuesRouter.delete("/:id", authenticate, requireMaintainer, remove);
