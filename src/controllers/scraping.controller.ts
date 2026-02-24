import { Request, Response } from "express";
import { ScrapingService } from "../services/scraping.service";

export class ScrapingController {
	private scrapingService: ScrapingService;

	constructor(scrapingService: ScrapingService) {
		this.scrapingService = scrapingService;
	}

	async scrapeShop(req: Request, res: Response): Promise<void> {
		try {
			const skins = await this.scrapingService.scrapeShop();
			res.json({ skins });
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
