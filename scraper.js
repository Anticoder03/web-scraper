import axios from "axios";
import cheerio from "cheerio";
import { Parser } from "json2csv";
import JSZip from "jszip";

export async function scrapeAndZip(START_URL) {
  const visited = new Set();
  const results = [];

  async function scrapePage(url) {
    if (visited.has(url)) return;
    visited.add(url);

    const base = new URL(url);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $("*").each((_, el) => {
      const text = $(el).text().trim();
      let img = $(el).find("img").attr("src");

      if (img) img = new URL(img, base.origin).href;

      if (text || img) {
        results.push({
          page: url,
          text: text || "",
          image: img || ""
        });
      }
    });

    // follow children pages
    const links = $("a[href]")
      .map((_, a) => $(a).attr("href"))
      .get()
      .filter(h => h && !h.startsWith("#"));

    for (let link of links) {
      link = new URL(link, base.origin).href;
      if (link.startsWith(base.origin)) {
        await scrapePage(link);
      }
    }
  }

  await scrapePage(START_URL);

  // Convert to files
  const jsonOutput = JSON.stringify(results, null, 2);
  const parser = new Parser();
  const csvOutput = parser.parse(results);

  // Create ZIP
  const zip = new JSZip();
  zip.file("output.json", jsonOutput);
  zip.file("output.csv", csvOutput);

  return await zip.generateAsync({ type: "nodebuffer" });
}
