/**
 * Enhanced multi-source extraction utility for Etsy product pages
 * Extracts product information from multiple sections of an Etsy listing:
 * - Title
 * - Item details section
 * - Highlights section
 * - Description
 * - Bullet points
 */

import extractProductInfo from './etsy-extractor';

/**
 * Extract product details from multiple sources in an Etsy page
 * @param {Object} $ - Cheerio instance loaded with the page HTML
 * @param {string} title - Product title
 * @param {string} description - Product description (if available)
 * @returns {Object} - Combined product details from all sources
 */
const extractFromMultipleSources = ($, title, description = '') => {
  const productDetails = {};
  
  // Critical attributes we want to ensure are captured
  const criticalAttributes = [
    'Gemstone Type', 'Gemstone Name', 'Stone', 'Stone Type', 
    'Gem Type', 'Gem', 'Gemstone',
    'Origin', 'Country/Region of Origin', 'Country of Origin',
    'Treatment', 'Stone Treatment', 'Gemstone Treatment',
    'Size', 'Dimensions', 'Measurements',
    'Shape', 'Stone Shape', 'Gemstone Shape', 'Cut Shape',
    'Cut', 'Stone Cut', 'Gemstone Cut',
    'Quality', 'Grade', 'Clarity', 'Gemstone Clarity',
    'Form', 'Type', 'Category',
    'Color', 'Stone Color', 'Gemstone Color',
    'Weight', 'Carat Weight', 'Carats', 'Carat'
  ];
  
  console.log('Starting multi-source extraction for Etsy product');
  
  // Step 1: Extract from title
  console.log('Extracting from title:', title);
  const titleDetails = extractProductInfo(title, '');
  Object.assign(productDetails, titleDetails);
  
  // Step 2: Extract from Item Details section
  console.log('Extracting from Item Details section');
  const itemDetailsSection = extractItemDetailsSection($);
  Object.assign(productDetails, itemDetailsSection);
  
  // Step 3: Extract from Highlights section
  console.log('Extracting from Highlights section');
  const highlightsSection = extractHighlightsSection($);
  Object.assign(productDetails, highlightsSection);
  
  // Step 4: Extract from description if available
  if (description) {
    console.log('Extracting from description');
    const descriptionDetails = extractProductInfo('', description);
    
    // Only add description details if they don't already exist
    Object.entries(descriptionDetails).forEach(([key, value]) => {
      if (!productDetails[key]) {
        productDetails[key] = value;
      }
    });
  }
  
  // Step 5: Look for any missing critical attributes using aggressive methods
  const missingAttributes = criticalAttributes.filter(attr => {
    // Check if any variation of this attribute exists
    return !Object.keys(productDetails).some(key => 
      key.toLowerCase().includes(attr.toLowerCase()) ||
      attr.toLowerCase().includes(key.toLowerCase())
    );
  });
  
  if (missingAttributes.length > 0) {
    console.log(`Still missing ${missingAttributes.length} critical attributes, using aggressive extraction`);
    const aggressiveResults = extractAggressively($, missingAttributes);
    
    // Add any found attributes
    Object.assign(productDetails, aggressiveResults);
  }
  
  // Step 6: Normalize attribute names for consistency
  return normalizeAttributes(productDetails);
};

/**
 * Extract information from the Item Details section
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Extracted details
 */
const extractItemDetailsSection = ($) => {
  const details = {};
  
  // Try different selectors for the Item Details section
  const detailsSelectors = [
    // Common Item Details selectors
    '.wt-mb-xs-2 .wt-content-toggle__body',
    '.wt-text-body-01.wt-break-word',
    '[data-id="description-text"]',
    '.wt-display-inline-block.wt-text-body-01',
    // Item details specific selectors
    '.wt-mb-xs-2 ul li',
    '.wt-mb-xs-2 .wt-list--bullet li',
    '.wt-content-toggle__body li',
    // Structured data sections
    '.wt-display-flex.wt-flex-wrap li',
    '.wt-display-flex.wt-justify-content-space-between',
    // Fallback to any list items
    'li'
  ];
  
  // Try each selector
  for (const selector of detailsSelectors) {
    const elements = $(selector);
    
    elements.each((i, el) => {
      const text = $(el).text().trim();
      
      // Skip very short texts
      if (text.length < 3) return;
      
      // Try to extract key-value pairs
      // Pattern 1: "Key: Value"
      const colonMatch = text.match(/([^:]+):\s*(.+)/);
      if (colonMatch) {
        const key = colonMatch[1].trim();
        const value = colonMatch[2].trim();
        if (key && value && key.length < 50) { // Avoid very long keys
          details[key] = value;
        }
        return;
      }
      
      // Pattern 2: "Key - Value"
      const dashMatch = text.match(/([^-]+)\s*-\s*(.+)/);
      if (dashMatch) {
        const key = dashMatch[1].trim();
        const value = dashMatch[2].trim();
        if (key && value && key.length < 50) {
          details[key] = value;
        }
        return;
      }
      
      // Pattern 3: "Key → Value" (arrow format)
      const arrowMatch = text.match(/([^→]+)\s*→\s*(.+)/);
      if (arrowMatch) {
        const key = arrowMatch[1].trim();
        const value = arrowMatch[2].trim();
        if (key && value && key.length < 50) {
          details[key] = value;
        }
        return;
      }
    });
    
    // If we found some details, no need to try more selectors
    if (Object.keys(details).length > 0) {
      console.log(`Found ${Object.keys(details).length} details from selector: ${selector}`);
      break;
    }
  }
  
  return details;
};

/**
 * Extract information from the Highlights section
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Extracted details
 */
const extractHighlightsSection = ($) => {
  const highlights = {};
  
  // Try different selectors for the Highlights section
  const highlightsSelectors = [
    '.wt-mb-xs-2 h2:contains("Highlights") + ul li',
    '.wt-mb-xs-2 h3:contains("Highlights") + ul li',
    '.wt-content-toggle__body h2:contains("Highlights") + ul li',
    '.wt-content-toggle__body h3:contains("Highlights") + ul li',
    // Fallback to any section that might contain highlights
    'section:contains("Highlights") li',
    'div:contains("Highlights") li'
  ];
  
  // Try each selector
  for (const selector of highlightsSelectors) {
    const elements = $(selector);
    
    if (elements.length > 0) {
      console.log(`Found ${elements.length} highlights with selector: ${selector}`);
      
      elements.each((i, el) => {
        const text = $(el).text().trim();
        
        // Try to extract key-value pairs
        const colonMatch = text.match(/([^:]+):\s*(.+)/);
        if (colonMatch) {
          const key = colonMatch[1].trim();
          const value = colonMatch[2].trim();
          if (key && value) {
            highlights[key] = value;
          }
          return;
        }
        
        // If no key-value format, store as a numbered highlight
        if (text && text.length > 3) {
          highlights[`Highlight ${i+1}`] = text;
        }
      });
      
      // If we found highlights, no need to try more selectors
      if (Object.keys(highlights).length > 0) {
        break;
      }
    }
  }
  
  return highlights;
};

/**
 * Aggressively search for missing critical attributes
 * @param {Object} $ - Cheerio instance
 * @param {Array} missingAttributes - List of critical attributes still missing
 * @returns {Object} - Found attributes
 */
const extractAggressively = ($, missingAttributes) => {
  const found = {};
  
  // Search through all text on the page for patterns matching the missing attributes
  missingAttributes.forEach(attr => {
    // Try to find the attribute anywhere on the page
    $('*').each((i, element) => {
      const text = $(element).text().trim();
      
      // Skip very short or very long text
      if (!text || text.length < 5 || text.length > 500) return;
      
      // Look for patterns like "Attribute: Value" or "Attribute - Value" or "Attribute → Value"
      const patterns = [
        new RegExp(`${attr}\\s*:\\s*([^\\n\\r]+)`, 'i'),
        new RegExp(`${attr}\\s*-\\s*([^\\n\\r]+)`, 'i'),
        new RegExp(`${attr}\\s*→\\s*([^\\n\\r]+)`, 'i'),
        new RegExp(`${attr}\\s+is\\s+([^\\n\\r\\.]+)`, 'i'),
        new RegExp(`${attr}\\s*=\\s*([^\\n\\r]+)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && !found[attr]) {
          found[attr] = match[1].trim();
          console.log(`Found missing attribute with aggressive approach: ${attr} = ${match[1].trim()}`);
          return false; // Break the each loop once found
        }
      }
    });
  });
  
  return found;
};

/**
 * Normalize attribute names for consistency
 * @param {Object} details - Product details
 * @returns {Object} - Normalized product details
 */
const normalizeAttributes = (details) => {
  const normalized = { ...details };
  
  // Mapping of common variations to standard names
  const attributeMapping = {
    // Gemstone attributes
    'Gem Type': 'Gemstone Name',
    'Gemstone Type': 'Gemstone Name',
    'Stone Type': 'Gemstone Name',
    'Stone': 'Gemstone Name',
    'Gem': 'Gemstone Name',
    'Gemstone': 'Gemstone Name',
    
    // Color attributes
    'Stone Color': 'Gemstone Color',
    'Gem Color': 'Gemstone Color',
    
    // Treatment attributes
    'Stone Treatment': 'Treatment',
    'Gem Treatment': 'Treatment',
    
    // Shape attributes
    'Stone Shape': 'Shape',
    'Gem Shape': 'Shape',
    'Cut Shape': 'Shape',
    
    // Cut attributes
    'Stone Cut': 'Cut',
    'Gem Cut': 'Cut',
    
    // Weight attributes
    'Carats': 'Carat Weight',
    'Carat': 'Carat Weight',
    
    // Clarity attributes
    'Stone Clarity': 'Clarity',
    'Gem Clarity': 'Clarity',
    
    // Size attributes
    'Measurements': 'Dimensions',
    'Measurement': 'Dimensions'
  };
  
  // Apply the mapping
  Object.entries(attributeMapping).forEach(([variant, standard]) => {
    if (normalized[variant] && !normalized[standard]) {
      normalized[standard] = normalized[variant];
      delete normalized[variant];
    }
  });
  
  return normalized;
};

export { extractFromMultipleSources };
