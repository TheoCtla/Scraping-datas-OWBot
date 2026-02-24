import { HeroRepository } from "../repositories/hero.repository";

export class HeroService {
	private heroRepository: HeroRepository;

	constructor(heroRepository: HeroRepository) {
		this.heroRepository = heroRepository;
	}

	getHeroByName(name: string): any {
		return this.heroRepository.getHeroByName(name);
	}

	getAllHeroes(): any[] {
		return this.heroRepository.getAllHeroes();
	}

	postHero(hero: { name: string }): void {
		this.heroRepository.postHero(hero);
	}
}
