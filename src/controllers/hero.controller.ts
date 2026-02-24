import { Request, Response } from "express";
import { HeroService } from "../services/hero.service";

export class HeroController {
	private heroService: HeroService;

	constructor(heroService: HeroService) {
		this.heroService = heroService;
	}

	getHeroByName = (req: Request, res: Response): void => {
		const name = req.params.name;

		if (!name || typeof name !== "string") {
			res
				.status(400)
				.json({ error: "Name parameter is required and must be a string" });
			return;
		}
		const hero = this.heroService.getHeroByName(name);

		if (hero) {
			res.json(hero);
		} else {
			res.status(404).json({ error: "Hero not found" });
		}
	};

	getAllHeroes(req: Request, res: Response): void {
		const heroes = this.heroService.getAllHeroes();
		res.json(heroes);
	}

	postHero(req: Request, res: Response): void {
		const hero = req.body;
		if (!hero.name) {
			res.status(400).json({ error: "Name is required" });
			return;
		}
		this.heroService.postHero(hero);
		res.status(201).json({ message: "Hero created successfully" });
	}

	postHeroesBulk(req: Request, res: Response): void {
		const heroes = req.body;
		if (!Array.isArray(heroes)) {
			res.status(400).json({ error: "An array of heroes is required" });
			return;
		}
		for (const hero of heroes) {
			if (!hero.name) {
				res.status(400).json({ error: "Each hero must have a name" });
				return;
			}
			this.heroService.postHero(hero);
		}
		res.status(201).json({ message: "Heroes created successfully" });
	}
}
