import { scrapeAndZip } from "../scraper.js";

export default async function handler(req, res) {
  // Set timeout for Vercel serverless function
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: "Request timeout - scraping took too long" });
    }
  }, 9500); // 9.5 seconds (Vercel has 10s on Hobby plan)

  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      clearTimeout(timeout);
      return res.status(405).json({ error: "Method not allowed. Use GET." });
    }

    const url = req.query.url;

    if (!url) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Missing ?url parameter" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Only allow http and https protocols
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "URL must start with http:// or https://" });
    }

    const zipBuffer = await scrapeAndZip(url);

    clearTimeout(timeout);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=scraped_data.zip"
    );
    res.setHeader("Cache-Control", "no-cache");

    return res.send(zipBuffer);

  } catch (err) {
    clearTimeout(timeout);
    console.error("SCRAPE ERROR:", err);
    
    // Don't expose internal error details in production
    const errorMessage = err.message || "Internal Server Error";
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Failed to scrape the URL",
        message: process.env.NODE_ENV === "development" ? errorMessage : undefined
      });
    }
  }
}
