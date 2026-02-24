import { Router } from "express";
import { ScrapingController } from "../controllers/scraping.controller";
import { HeroRepository } from "../repositories/hero.repository";
import { ScrapingService } from "../services/scraping.service";

import db from "../config/config";

const scrapingRouter = Router();

const scrapingController = new ScrapingController(
	new ScrapingService(new HeroRepository(db)),
);

scrapingRouter.get("/shop", (req, res) =>
	scrapingController.scrapeShop(req, res),
);

export default scrapingRouter;
