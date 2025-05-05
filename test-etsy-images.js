// Test script for the enhanced Etsy scraper with image extraction
import scrapeEtsyProductEnhanced from './src/app/lib/enhanced-etsy-scraper.js';

const testEtsyImageScraper = async () => {
  try {
    // Replace with an actual Etsy product URL you want to test
    const url = "https://www.etsy.com/in-en/listing/1733145883/natural-royal-blue-sapphire-41-carats";

    console.log("Testing enhanced Etsy scraper with image extraction...");
    console.log(`URL: ${url}`);

    const productDetails = await scrapeEtsyProductEnhanced(url);

    console.log("Product Images:");
    if (productDetails.productImages && productDetails.productImages.length > 0) {
      productDetails.productImages.forEach((img, index) => {
        console.log(`Image ${index + 1}: ${img}`);
      });
      console.log(`Total images extracted: ${productDetails.productImages.length}`);
    } else {
      console.log("No product images found");
    }

    // Log a sample of other product details
    console.log("\nSample Product Details:");
    const sampleKeys = Object.keys(productDetails).slice(0, 5);
    sampleKeys.forEach(key => {
      console.log(`${key}: ${productDetails[key]}`);
    });
    
    console.log(`\nTotal details extracted: ${Object.keys(productDetails).length}`);
  } catch (error) {
    console.error("Error testing Etsy image scraper:", error);
  }
};

testEtsyImageScraper();
