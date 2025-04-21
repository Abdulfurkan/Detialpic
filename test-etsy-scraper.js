// Test script for the enhanced Etsy scraper
import { scrapeProductDetails } from './src/app/lib/scraper.js';

const testEtsyScraper = async () => {
  try {
    // Replace with an actual Etsy product URL you want to test
    const url = "https://www.etsy.com/in-en/listing/1733145883/natural-royal-blue-sapphire-41-carats?ls=r&ref=hp_rv-1&frs=1&sts=1&content_source=a1daa0ee174c84d179bc403541ebca86eed32a0e%253A1733145883&logging_key=a1daa0ee174c84d179bc403541ebca86eed32a0e%3A1733145883";

    console.log("Testing enhanced Etsy scraper with the provided URL...");
    console.log(`URL: ${url}`);

    const productDetails = await scrapeProductDetails(url, 1); // 1 for Etsy

    console.log("Product Details:");
    console.log(JSON.stringify(productDetails, null, 2));

    console.log(`Total details extracted: ${Object.keys(productDetails).length}`);
  } catch (error) {
    console.error("Error testing Etsy scraper:", error);
  }
};

testEtsyScraper();
