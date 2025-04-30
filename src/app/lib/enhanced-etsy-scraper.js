/**
 * Enhanced Etsy scraper that uses CORS proxies and extracts information from title and description
 */

import * as cheerio from 'cheerio';
import { fetchWithCorsProxy } from './cors-proxies';
import { extractProductInfo } from './etsy-extractor';

/**
 * Scrape product details from an Etsy product page using CORS proxies
 * @param {string} url - The Etsy product URL
 * @returns {Promise<Object>} - Object containing product details
 */
export const scrapeEtsyProductEnhanced = async (url) => {
  try {
    // Validate URL is from Etsy
    if (!url.includes('etsy.com')) {
      throw new Error('Not a valid Etsy URL');
    }

    console.log(`Scraping Etsy product with enhanced scraper: ${url}`);
    
    // Define excluded keywords for filtering non-product details
    const excludedKeywords = [
      'ship', 'shipping', 'delivery', 'handpicked', 'handmade', 'shop', 
      'return', 'policy', 'policies', 'processing', 'time', 'custom', 'order',
      'gift', 'wrapping', 'about', 'us', 'seller', 'store', 'made in', 'made by',
      'tracking', 'package', 'dispatch', 'business', 'wholesale', 'discount',
      'feedback', 'review', 'rating', 'contact', 'message', 'question', 'ask',
      'international', 'domestic', 'local', 'pickup', 'collection'
    ];
    
    // Define product-specific keywords to include
    const productKeywords = [
      'gemstone', 'gem', 'stone', 'material', 'metal', 'gold', 'silver', 'platinum',
      'diamond', 'ruby', 'sapphire', 'emerald', 'opal', 'jade', 'pearl', 'crystal',
      'carat', 'weight', 'color', 'clarity', 'cut', 'shape', 'size', 'dimension',
      'length', 'width', 'height', 'diameter', 'thickness', 'style', 'design',
      'pattern', 'finish', 'polish', 'treatment', 'grade', 'quality', 'purity',
      'karat', 'transparency', 'product', 'type', 'category', 'collection',
      'setting', 'mount', 'band', 'chain', 'clasp', 'back', 'closure'
    ];
    
    // Helper function to check if a key is related to product details
    const isProductDetail = (key) => {
      key = key.toLowerCase();
      
      // Critical gemstone attributes - always include these regardless of other filters
      const criticalGemstoneAttributes = [
        'gemstone', 'gem', 'stone', 'type', 'color', 'size', 'shape', 'cut',
        'carat', 'weight', 'quality', 'grade', 'clarity', 'origin', 'country',
        'region', 'manufacture', 'transparency', 'treatment', 'natural', 'synthetic',
        'dimension', 'mm', 'inch', 'quantity', 'piece', 'pc', 'pcs', 'lot'
      ];
      
      // First check if it's a critical gemstone attribute
      for (const critical of criticalGemstoneAttributes) {
        if (key.includes(critical)) {
          return true;
        }
      }
      
      // Check if key contains any excluded keywords
      for (const excluded of excludedKeywords) {
        if (key.includes(excluded)) {
          return false;
        }
      }
      
      // If key contains any product keywords, it's definitely a product detail
      for (const product of productKeywords) {
        if (key.includes(product)) {
          return true;
        }
      }
      
      // For keys that don't match either list, use a whitelist approach
      // Common product detail keys that might not contain product keywords
      const commonProductKeys = [
        'name', 'product', 'style', 'code', 'item', 'model', 'sku', 'upc', 
        'brand', 'manufacturer', 'origin', 'color', 'finish', 'material',
        'composition', 'feature', 'specification', 'detail', 'description'
      ];
      
      for (const common of commonProductKeys) {
        if (key.includes(common)) {
          return true;
        }
      }
      
      // Default to excluding if we're not sure
      return false;
    };
    
    // Try to fetch the page content using multiple methods
    let html = '';
    let fetchError = null;
    
    // Method 1: Try direct fetch first (may work in some environments)
    try {
      console.log('Trying direct fetch...');
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      
      if (response.ok) {
        html = await response.text();
        console.log('Direct fetch successful');
      }
    } catch (error) {
      console.log('Direct fetch failed:', error.message);
      fetchError = error;
    }
    
    // Method 2: If direct fetch fails, try CORS proxy
    if (!html) {
      try {
        console.log('Trying CORS proxy...');
        html = await fetchWithCorsProxy(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        });
        console.log('CORS proxy fetch successful');
      } catch (error) {
        console.log('CORS proxy fetch failed:', error.message);
        fetchError = error;
      }
    }
    
    // If both methods fail, try a fallback approach with mock data
    if (!html) {
      console.log('All fetch methods failed, using fallback approach');
      
      // Extract product name from URL
      const urlParts = url.split('/');
      const productSlug = urlParts[urlParts.length - 1].split('?')[0];
      const productName = productSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // Create fallback product details based on URL
      return {
        'Product Name': productName || 'Etsy Product',
        'Note': 'Product details could not be fetched. This is fallback data.',
        'URL': url
      };
    }

    const $ = cheerio.load(html);
    let productDetails = {};

    // Get product title
    const title = $('h1[data-product-title="true"]').text().trim();
    if (title) {
      productDetails['Product Name'] = title;
    }
    
    // Get product price
    const price = $('[data-selector="price-only"]').text().trim();
    if (price) {
      productDetails['Price'] = price;
    }
    
    // Extract from Highlights section - ONLY product-related highlights
    console.log('Extracting product-related highlights');
    $('.wt-content-toggle__body ul li').each((i, element) => {
      const text = $(element).text().trim();
      
      // Skip shipping and shop information
      if (text.includes('Ships from') || text.includes('Handpicked by')) {
        return;
      }
      
      // Handle "Materials: [type]: [value]" pattern - this is product-specific
      if (text.includes('Materials:')) {
        const materialParts = text.split(':');
        if (materialParts.length >= 3) {
          const materialType = materialParts[1].trim();
          const materialValue = materialParts[2].trim();
          
          // Only add if it's a product detail
          if (isProductDetail(materialType)) {
            productDetails[materialType] = materialValue;
          }
        } else if (materialParts.length === 2) {
          productDetails['Materials'] = materialParts[1].trim();
        }
        return;
      }
      
      // Handle "[Label]: [Value]" pattern
      const colonSplit = text.split(':');
      if (colonSplit.length === 2) {
        const key = colonSplit[0].trim();
        const value = colonSplit[1].trim();
        
        // Only add if it's a product detail
        if (key && value && isProductDetail(key)) {
          productDetails[key] = value;
        }
        return;
      }
    });
    
    // Extract from Item Details section - FOCUS PRIMARILY HERE
    console.log('Extracting from Item Details section');
    
    // Look for the Item Details section header and extract all following key-value pairs
    let itemDetailsSection = null;
    
    // Find the Item Details section
    $('h2, .wt-text-title-01, .wt-text-title-02, .wt-text-title-03').each((i, element) => {
      const headerText = $(element).text().trim();
      if (headerText.toLowerCase().includes('item details')) {
        itemDetailsSection = $(element).parent();
        return false; // Break the loop
      }
    });
    
    if (itemDetailsSection) {
      // Process all text in the item details section
      const itemDetailsText = itemDetailsSection.text();
      const lines = itemDetailsText.split('\n');
      
      // Process each line looking for "Label - Value" pattern
      lines.forEach(line => {
        line = line.trim();
        if (!line || line.toLowerCase() === 'item details') return;
        
        // Match "Label - Value" pattern
        const dashSplit = line.split('-');
        if (dashSplit.length >= 2) {
          const key = dashSplit[0].trim();
          // Join the rest in case there are multiple dashes in the value
          const value = dashSplit.slice(1).join('-').trim();
          
          // Only add if it's a product detail
          if (key && value && isProductDetail(key)) {
            productDetails[key] = value;
          }
        }
      });
    }
    
    // Alternative approach: look for patterns directly in the DOM
    $('.wt-display-block').each((i, element) => {
      const text = $(element).text().trim();
      
      // Match "Label -> Value" pattern (arrow format)
      const arrowMatch = text.match(/([^->]+)\s*->\s*(.+)/);
      if (arrowMatch) {
        const key = arrowMatch[1].trim();
        const value = arrowMatch[2].trim();
        
        // Only add if it's a product detail
        if (key && value && !productDetails[key] && isProductDetail(key)) {
          productDetails[key] = value;
        }
        return;
      }
      
      // Match "Label - Value" pattern (dash format)
      const dashMatch = text.match(/([^-]+)\s*-\s*(.+)/);
      if (dashMatch) {
        const key = dashMatch[1].trim();
        const value = dashMatch[2].trim();
        
        // Only add if it's a product detail
        if (key && value && !productDetails[key] && isProductDetail(key)) {
          productDetails[key] = value;
        }
      }
    });
    
    // Specific approach for description with arrow format
    // This targets the format seen in the example: "Gemstone Type -> Ethiopian Opal"
    console.log('Specifically targeting gemstone attributes with arrow format');
    
    // Try multiple selectors to find the description or product details section
    const descriptionSelectors = [
      'div.wt-mb-xs-2',
      'div.wt-content-toggle__body',
      'div.wt-text-body-01',
      'div.wt-display-block',
      'div.wt-display-inline-block',
      'p',
      'div'
    ];
    
    let foundArrowFormat = false;
    
    // Try each selector until we find content with arrow format
    for (const selector of descriptionSelectors) {
      $(selector).each((i, element) => {
        const text = $(element).text().trim();
        if (!text || text.length < 10) return; // Skip very short text blocks
        
        // Check if this text block contains arrow format patterns
        if (text.includes('->')) {
          console.log('Found text with arrow format');
          const lines = text.split('\n');
          
          lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Match "Label -> Value" pattern
            const arrowMatch = line.match(/([^->]+)\s*->\s*(.+)/);
            if (arrowMatch) {
              const key = arrowMatch[1].trim();
              const value = arrowMatch[2].trim();
              
              // These are critical gemstone attributes, so add them regardless of filtering
              productDetails[key] = value;
              foundArrowFormat = true;
            }
          });
        }
      });
      
      // If we found arrow format content, no need to continue with other selectors
      if (foundArrowFormat) break;
    }
    
    // Directly target specific critical gemstone attributes that might be missed
    const criticalAttributes = [
      'Gemstone Type', 'Gemstone Color', 'Size', 'Shape', 'Quantity',
      'Origin', 'Country/Region of Manufacture', 'Quality'
    ];
    
    // Ensure we have these critical attributes by searching the entire page content
    const pageText = $('body').text();
    criticalAttributes.forEach(attr => {
      if (!productDetails[attr]) {
        // Look for the attribute in arrow format
        const regex = new RegExp(`${attr}\\s*->\\s*(.+?)(?=\\n|\\r|$|\\s{2,}|[A-Z][a-z]+\\s*->)`, 'i');
        const match = pageText.match(regex);
        
        if (match && match[1]) {
          productDetails[attr] = match[1].trim();
          console.log(`Found critical attribute: ${attr} = ${match[1].trim()}`);
        }
      }
    });
    
    // If we still don't have gemstone attributes, try a more aggressive approach
    if (!productDetails['Gemstone Type'] && !productDetails['Gemstone Color']) {
      console.log('Using aggressive approach to find gemstone attributes');
      
      // Look for patterns like "Gemstone Type -> value" anywhere in the page
      $('*').each((i, element) => {
        const text = $(element).text().trim();
        if (!text || text.length < 10 || text.length > 500) return; // Skip very short or very long text
        
        criticalAttributes.forEach(attr => {
          if (!productDetails[attr] && text.includes(attr) && text.includes('->')){  
            const regex = new RegExp(`${attr}\\s*->\\s*(.+?)(?=\\n|\\r|$|\\s{2,}|[A-Z][a-z]+\\s*->)`, 'i');
            const match = text.match(regex);
            
            if (match && match[1]) {
              productDetails[attr] = match[1].trim();
              console.log(`Found critical attribute with aggressive approach: ${attr} = ${match[1].trim()}`);
            }
          }
        });
      });
    }
    
    // Get product description for fallback extraction
    let description = '';
    
    // If we still don't have all critical attributes, try to extract them from the description
    const missingCriticalAttributes = criticalAttributes.filter(attr => !productDetails[attr]);
    
    if (missingCriticalAttributes.length > 0) {
      console.log(`Still missing ${missingCriticalAttributes.length} critical attributes, trying description extraction`);
      
      // Try different selectors for description
      const contentSelectors = [
        '.wt-mb-xs-2 .wt-content-toggle__body', // Common description container
        '.wt-text-body-01.wt-break-word', // Alternative description container
        '[data-id="description-text"]', // Another description container
        '.wt-display-inline-block.wt-text-body-01', // Yet another description container
        'p', // Paragraphs
        'div.wt-mb-xs-2', // Common container
        'div.wt-content-toggle__body' // Another common container
      ];
      
      for (const selector of contentSelectors) {
        const elements = $(selector);
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 50) { // Only consider substantial text blocks
            description = text;
            
            // Try to find missing attributes in this text
            missingCriticalAttributes.forEach(attr => {
              // Try arrow format
              const arrowRegex = new RegExp(`${attr}\\s*->\\s*([^\\n\\r]+)`, 'i');
              const arrowMatch = text.match(arrowRegex);
              
              if (arrowMatch && arrowMatch[1]) {
                productDetails[attr] = arrowMatch[1].trim();
                console.log(`Found missing attribute in description: ${attr} = ${arrowMatch[1].trim()}`);
              }
              
              // Also try dash format
              const dashRegex = new RegExp(`${attr}\\s*-\\s*([^\\n\\r]+)`, 'i');
              const dashMatch = text.match(dashRegex);
              
              if (dashMatch && dashMatch[1] && !productDetails[attr]) {
                productDetails[attr] = dashMatch[1].trim();
                console.log(`Found missing attribute in description (dash format): ${attr} = ${dashMatch[1].trim()}`);
              }
            });
          }
        });
      }
    }

    // If we have a title and description, use our enhanced extraction
    if (title && description) {
      console.log('Using enhanced extraction from title and description');
      
      // Extract information from title and description
      const extractedDetails = extractProductInfo(title, description);
      
      // Merge the extracted details with any structured data we found
      // Prioritize structured data over extracted data for overlapping keys
      productDetails = {
        ...extractedDetails,
        ...productDetails,
        'Product Name': title // Always use the actual title
      };
    }

    return productDetails;
  } catch (error) {
    console.error('Error scraping Etsy product:', error);
    throw error;
  }
};

export default scrapeEtsyProductEnhanced;
