import { Router } from "express";
import { HeroController } from "../controllers/hero.controller";
import { HeroRepository } from "../repositories/hero.repository";
import { HeroService } from "../services/hero.service";
import db from "../config/config";

const heroRouter = Router();

const heroController = new HeroController(
	new HeroService(new HeroRepository(db)),
);
heroRouter.get("/:name", (req, res) => heroController.getHeroByName(req, res));
heroRouter.get("/", (req, res) => heroController.getAllHeroes(req, res));
heroRouter.post("/", (req, res) => heroController.postHero(req, res));
heroRouter.post("/bulk", (req, res) => heroController.postHeroesBulk(req, res));

export default heroRouter;
