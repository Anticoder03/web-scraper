import axios from "axios";
import cheerio from "cheerio";
import { Parser } from "json2csv";
import JSZip from "jszip";

// Configuration for Vercel serverless functions
const MAX_PAGES = 5; // Limit pages to prevent timeout (Vercel has 10s timeout on Hobby)
const MAX_REQUEST_TIME = 8000; // 8 seconds max (leave 2s buffer for processing)
const REQUEST_TIMEOUT = 5000; // 5 seconds per request

export async function scrapeAndZip(START_URL) {
  const startTime = Date.now();
  const visited = new Set();
  const results = [];
  let pageCount = 0;

  // Timeout check helper
  function checkTimeout() {
    if (Date.now() - startTime > MAX_REQUEST_TIME) {
      throw new Error("Request timeout - scraping took too long");
    }
  }

  async function scrapePage(url) {
    // Check timeout before processing
    checkTimeout();

    // Limit number of pages
    if (pageCount >= MAX_PAGES) {
      return;
    }

    if (visited.has(url)) return;
    visited.add(url);
    pageCount++;

    try {
      const base = new URL(url);

      // Add timeout to axios request
      const { data } = await axios.get(url, {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(data);

      // Extract text and images more efficiently
      const pageText = $("body").text().trim().replace(/\s+/g, " ");
      const images = [];
      
      $("img[src]").each((_, img) => {
        let imgSrc = $(img).attr("src");
        if (imgSrc) {
          try {
            imgSrc = new URL(imgSrc, base.origin).href;
            images.push(imgSrc);
          } catch (e) {
            // Skip invalid URLs
          }
        }
      });

      // Add page data
      if (pageText || images.length > 0) {
        results.push({
          page: url,
          text: pageText.substring(0, 10000) || "", // Limit text length
          image: images[0] || "" // Store first image only to keep data manageable
        });
      }

      // Only follow children pages if we haven't reached the limit
      if (pageCount < MAX_PAGES) {
        const links = $("a[href]")
          .map((_, a) => $(a).attr("href"))
          .get()
          .filter(h => h && !h.startsWith("#") && !h.startsWith("mailto:") && !h.startsWith("tel:"));

        // Process links with limit
        const linksToFollow = links.slice(0, 10); // Limit links per page
        
        for (let link of linksToFollow) {
          if (pageCount >= MAX_PAGES) break;
          
          try {
            link = new URL(link, base.origin).href;
            if (link.startsWith(base.origin) && !visited.has(link)) {
              await scrapePage(link);
            }
          } catch (e) {
            // Skip invalid URLs
            continue;
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      // Continue with other pages even if one fails
      results.push({
        page: url,
        text: `Error: ${error.message}`,
        image: ""
      });
    }
  }

  try {
    await scrapePage(START_URL);
  } catch (error) {
    // If we have some results, return them; otherwise throw
    if (results.length === 0) {
      throw error;
    }
  }

  // Ensure we have at least one result
  if (results.length === 0) {
    throw new Error("No data scraped from the URL");
  }

  // Convert to files
  const jsonOutput = JSON.stringify(results, null, 2);
  
  let csvOutput;
  try {
    const parser = new Parser();
    csvOutput = parser.parse(results);
  } catch (csvError) {
    console.error("CSV parsing error:", csvError);
    // Fallback: create a simple CSV manually
    if (results.length > 0) {
      const headers = Object.keys(results[0]).join(",");
      const rows = results.map(row => 
        Object.values(row).map(val => {
          const str = String(val || "");
          // Escape quotes and wrap in quotes if contains comma or newline
          if (str.includes(",") || str.includes("\n") || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      );
      csvOutput = [headers, ...rows].join("\n");
    } else {
      csvOutput = "page,text,image\n";
    }
  }

  // Create ZIP
  const zip = new JSZip();
  zip.file("output.json", jsonOutput);
  zip.file("output.csv", csvOutput);

  return await zip.generateAsync({ type: "nodebuffer" });
}
