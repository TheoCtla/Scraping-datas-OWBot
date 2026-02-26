import "dotenv/config";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

async function runGitHubScraper() {
	if (!API_URL || !API_KEY) {
		console.error("❌ API_URL ou API_KEY manquant !");
		process.exit(1);
	}

	console.log("🌐 [1/4] Récupération des héros...");
	let heroesMap = new Map<string, number>();
	try {
		const heroesRes = await fetch(`${API_URL}/api/heroes`);
		if (!heroesRes.ok) throw new Error(`HTTP Error ${heroesRes.status}`);
		const heroes = await heroesRes.json();
		for (const hero of heroes) {
			heroesMap.set(hero.name.toLowerCase(), hero.id);
		}
		console.log(`✅ ${heroesMap.size} héros chargés.`);
	} catch (error) {
		console.error("❌ Impossible de récupérer les héros :", error);
		process.exit(1);
	}

	console.log("🕵️‍♂️ [2/4] Lancement de Puppeteer...");
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	let rawSkins: any[] = [];
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto("https://eu.shop.battle.net/fr-fr/family/overwatch", { waitUntil: "networkidle2" });

		console.log("⏱️ Attente du chargement...");
		await page.waitForSelector("storefront-browsing-card", { timeout: 30000 });

		console.log("📜 Défilement de la page pour charger tous les skins et les prix...");
		await page.evaluate(async () => {
			await new Promise<void>((resolve) => {
				let totalHeight = 0;
				const distance = 300;
				const timer = setInterval(() => {
					window.scrollBy(0, distance);
					totalHeight += distance;
					if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
						clearInterval(timer);
						resolve();
					}
				}, 200);
			});
		});

		// PAUSE CRUCIALE : Laisse le temps à Blizzard d'afficher les prix après le scroll
		console.log("⏳ Pause de 5s pour laisser les prix apparaître...");
		await new Promise(r => setTimeout(r, 5000));

		console.log("🔍 Extraction des données...");

		rawSkins = await page.evaluate(() => {
			const extractedData: any[] = [];
			const elements = document.querySelectorAll("storefront-browsing-card");

			elements.forEach((element) => {
				const headingElement = element.querySelector('div[slot="heading"]');
				const descElement = element.querySelector('div[slot="description"]');
				const linkElement = element.querySelector('a[href*="/items/"]');

				if (!headingElement || !descElement || !linkElement) return;

				const description = descElement.textContent?.trim() || "";
				if (description.toLowerCase().includes("pack") || description.toLowerCase().includes("lot") || description.toLowerCase().includes("bundle")) {
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

				// Extraction du prix simple et directe
				const priceElement = element.querySelector("storefront-price");
				let priceText = "0";

				if (priceElement) {
					priceText = (priceElement as HTMLElement).innerText?.trim() || "0";
					// Si le innerText échoue, on regarde directement dans le Shadow DOM
					if (priceText === "0" && priceElement.shadowRoot) {
						priceText = priceElement.shadowRoot.textContent?.trim() || "0";
					}
				}

				const price = parseInt(priceText.replace(/\D/g, "")) || 0;

				if (itemCode) {
					extractedData.push({
						name: skinName,
						price: price,
						code: itemCode,
						heroName: heroName,
					});
				}
			});

			return extractedData;
		});

		console.log(`✅ ${rawSkins.length} skins trouvés sur la boutique.`);
	} catch (error) {
		console.error("❌ Erreur pendant le scraping :", error);
	} finally {
		await browser.close();
	}

	console.log("🚀 [3/4] Envoi des données vers l'API Render...");
	let addedCount = 0;
	let updatedCount = 0;
	let skippedCount = 0;

	for (const skin of rawSkins) {
		const heroId = heroesMap.get(skin.heroName.toLowerCase());
		if (!heroId) {
			skippedCount++;
			continue;
		}

		try {
			const checkRes = await fetch(`${API_URL}/api/skins/${skin.code}`);
			if (checkRes.status === 200) {
				const patchRes = await fetch(`${API_URL}/api/skins/${skin.code}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
					body: JSON.stringify({ price: skin.price, is_active: 1 })
				});
				if (patchRes.ok) {
					console.log(`🔵 Mis à jour : ${skin.name} - Prix: ${skin.price}`);
					updatedCount++;
				}
			} else if (checkRes.status === 404) {
				const postRes = await fetch(`${API_URL}/api/skins`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
					body: JSON.stringify({ id_hero: heroId, name: skin.name, code: skin.code, price: skin.price })
				});
				if (postRes.status === 201) {
					console.log(`🟢 Ajouté : ${skin.name} - Prix: ${skin.price}`);
					addedCount++;
				}
			}
		} catch (err) {
			console.error(`❌ Erreur pour ${skin.name}`);
		}
	}

	console.log(`\n🎉 [4/4] Bilan : ${addedCount} créés, ${updatedCount} mis à jour, ${skippedCount} ignorés.`);
	process.exit(0);
}

runGitHubScraper();
