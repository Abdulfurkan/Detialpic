import { scrapeProductDetails } from './src/app/lib/scraper.js';

const testEbayScraper = async () => {
  try {
    const url = "https://www.ebay.com/itm/396160248226?_skw=silver+pink+ruby+ring&itmmeta=01JRB3ZBG1ZEA94NCJSKQWJQ45&hash=item5c3cfda9a2:g:PJoAAOSwScNnmmcf&itmprp=enc%3AAQAKAAAA0FkggFvd1GGDu0w3yXCmi1fVuS2jfdIuOZsbd1GfAKYik%2BoRUHnDQKmbWj%2Bx0BsoYLW4vsnZMQdGGaef3i7NTfYmo8sBY1VJdZWAR%2Ff0n8XI0VP5Fj3bWOGaIXlJTNGK2tXnsazShQlP2QCQuxSFZLEVfF9swLs40HSq2MtGbKFwpinUXJrzsaNTgyD9wUyFvzoLVRrivjGMQsWLrhzrv3U%2F3fXaMkxCO9p%2F8gtKpa81omLLBcphIC48i966NgPIBTS1k1PRwtLxyhxMhIPSOwQ%3D%7Ctkp%3ABk9SR5q4_ePCZQ";
    
    console.log("Testing eBay scraper with the provided URL...");
    const productDetails = await scrapeProductDetails(url, 0); // 0 for eBay
    
    console.log("Product Details:");
    console.log(JSON.stringify(productDetails, null, 2));
    
    console.log(`Total details extracted: ${Object.keys(productDetails).length}`);
  } catch (error) {
    console.error("Error testing eBay scraper:", error);
  }
};

testEbayScraper();
