import db from "../config/config";
import { SkinRepository } from "../repositories/skin.repository";

export class SkinService {
	private skinRepository: SkinRepository;

	constructor(skinRepository: SkinRepository) {
		this.skinRepository = skinRepository;
	}

	getAll(): any[] {
		return this.skinRepository.getAllSkinsWithHero();
	}
}
