import { HeroRepository } from "../repositories/hero.repository";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export class ScrapingService {
	private heroRepository: HeroRepository;

	constructor(heroRepository: HeroRepository) {
		this.heroRepository = heroRepository;
	}

	async scrapeShop(): Promise<any[]> {
		console.log("🕵️‍♂️ [Scraping] Lancement du navigateur furtif...");
		let browser;

		try {
			browser = await puppeteer.launch({
				headless: true,
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});

			const page = await browser.newPage();
			console.log("⏳ [Scraping] Navigation vers la boutique Blizzard...");

			await page.goto("https://eu.shop.battle.net/fr-fr/family/overwatch", {
				waitUntil: "networkidle2",
				timeout: 60000,
			});

			console.log("🔍 [Scraping] Extraction des données dans le navigateur...");

			const rawSkins = await page.evaluate(() => {
				const extractedData: any[] = [];
				const elements = document.querySelectorAll("storefront-browsing-card");

				elements.forEach((element) => {
					const headingElement = element.querySelector('div[slot="heading"]');
					const descElement = element.querySelector('div[slot="description"]');
					const linkElement = element.querySelector('a[href*="/items/"]');

					if (!headingElement || !descElement || !linkElement) return;

					const description = descElement.textContent?.trim() || "";

					if (
						description.toLowerCase().includes("pack") ||
						description.toLowerCase().includes("lot")
					) {
						return;
					}

					const skinName = headingElement.textContent?.trim() || "";

					let heroName = "";
					const descParts = description.split("|");
					if (descParts.length >= 3) {
						heroName = descParts[descParts.length - 1]?.trim() || "";
					}
					if (!heroName) return;

					let itemCode = null;
					const href = linkElement.getAttribute("href") || "";
					const match = href.match(/\/items\/(\d+)/);
					if (match && match[1]) {
						itemCode = match[1];
					}

					const priceElement = element.querySelector(
						"storefront-price",
					) as HTMLElement;
					const priceText = priceElement?.innerText?.trim() || "0";
					const price = parseInt(priceText.replace(/\D/g, "")) || 0;

					extractedData.push({
						name: skinName,
						price: price,
						code: itemCode,
						heroName: heroName,
					});
				});

				return extractedData;
			});

			const finalSkins: any[] = [];

			for (const skin of rawSkins) {
				const heroDb = this.heroRepository.getHeroByName(skin.heroName);

				finalSkins.push({
					name: skin.name,
					price: skin.price,
					code: skin.code,
					heroId: heroDb ? heroDb.id : null, // Si le héros existe, on prend son ID, sinon null
				});
			}

			console.log(
				`✅ [Scraping] Terminé ! ${finalSkins.length} skins formatés.`,
			);
			return finalSkins;
		} catch (error) {
			console.error("❌ [Scraping] Erreur avec Puppeteer :", error);
			return [];
		} finally {
			if (browser) {
				await browser.close();
				console.log("🚪 [Scraping] Navigateur fermé.");
			}
		}
	}
}
