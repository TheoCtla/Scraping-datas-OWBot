import { Router } from "express";
import { SkinController } from "../controllers/skin.controller";
import { SkinRepository } from "../repositories/skin.repository";
import { SkinService } from "../services/skin.service";
import db from "../config/config";

const skinRouter = Router();
const skinController = new SkinController(
	new SkinService(new SkinRepository(db)),
);

skinRouter.get("/", (req, res) => skinController.getAll(req, res));

export default skinRouter;
