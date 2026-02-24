import { Request, Response } from "express";
import { SkinService } from "../services/skin.service";

export class SkinController {
	private skinService: SkinService;

	constructor(skinService: SkinService) {
		this.skinService = skinService;
	}

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const message = await this.skinService.getAll();

			res.json({ message });
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			res.json({ message: `Get skin ${id}` });
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			res.status(201).json({ message: "Skin created" });
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
