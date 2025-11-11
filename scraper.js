const axios = require("axios");
const cheerio = require("cheerio");
const { Parser } = require("json2csv");

function toAbsolute(base, relative) {
  try { return new URL(relative, base).href; }
  catch { return relative; }
}

async function scrapePage(startUrl) {
  const visited = new Set();
  const results = [];

  async function scrape(url) {
    if (visited.has(url)) return;
    visited.add(url);

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $("*").each((_, el) => {
        const text = $(el).text().trim();
        const rawImg = $(el).find("img").attr("src");
        const image = rawImg ? toAbsolute(url, rawImg) : "";

        if (text || image) {
          results.push({ page: url, text, image });
        }
      });

      const links = $("a[href]")
        .map((_, a) => $(a).attr("href"))
        .get()
        .map(h => toAbsolute(url, h))
        .filter(h => h.startsWith(new URL(startUrl).origin));

      for (const link of links) {
        await scrape(link);
      }

    } catch (err) {
      console.log("Error scraping:", url, err.message);
    }
  }

  await scrape(startUrl);

  // Convert results to JSON & CSV
  const jsonOutput = JSON.stringify(results, null, 2);

  const parser = new Parser();
  const csvOutput = parser.parse(results);

  return { jsonOutput, csvOutput };
}

module.exports = scrapePage;
