import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Serverless-friendly scraper that uses Axios and Cheerio instead of Puppeteer
 * This is optimized for Vercel deployment
 */

/**
 * Scrape product details from an eBay product page
 * @param {string} url - The eBay product URL
 * @returns {Promise<Object>} - Object containing product details
 */
export const scrapeEbayProduct = async (url) => {
  try {
    // Validate URL is from eBay
    if (!url.includes('ebay.com')) {
      throw new Error('Not a valid eBay URL');
    }

    console.log(`Scraping eBay product: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.ebay.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const productDetails = {};

    // Get product title
    const title = $('h1.x-item-title__mainTitle span.ux-textspans').text().trim();
    if (title) {
      productDetails['Product Name'] = title;
    }

    // Get product price
    const price = $('.x-price-primary .ux-textspans').text().trim();
    if (price) {
      productDetails['Price'] = price;
    }

    // Get item condition
    const condition = $('.x-item-condition-value .ux-textspans').text().trim();
    if (condition) {
      productDetails['Condition'] = condition;
    }

    // Method 1: Target the specific item specifics section in the new eBay layout
    $('.ux-layout-section-evo__item').each((i, section) => {
      const sectionTitle = $(section).find('.ux-layout-section-evo__title').text().trim();

      if (sectionTitle.includes('Item specifics') || sectionTitle.includes('About this item')) {
        // Process each row in the item specifics table
        $(section).find('.ux-layout-section-evo__row').each((j, row) => {
          const labelElement = $(row).find('.ux-labels-values__labels');
          const valueElement = $(row).find('.ux-labels-values__values');

          if (labelElement.length && valueElement.length) {
            const label = labelElement.text().trim();
            const value = valueElement.text().trim();

            if (label && value) {
              productDetails[label] = value;
            }
          }
        });
      }
    });

    // Method 2: For the specific URL provided, target the item specifics directly
    if (Object.keys(productDetails).length <= 3) {
      $('.x-about-this-item .ux-labels-values__labels-content').each((i, label) => {
        const labelText = $(label).text().trim();
        const valueText = $(label).closest('.ux-labels-values').find('.ux-labels-values__values-content').text().trim();

        if (labelText && valueText) {
          productDetails[labelText] = valueText;
        }
      });
    }

    // Method 3: Alternative approach for newer eBay pages
    if (Object.keys(productDetails).length <= 3) {
      $('div[data-testid="x-about-this-item-section"] .ux-layout-section-evo__row').each((i, row) => {
        const label = $(row).find('div:first-child').text().trim();
        const value = $(row).find('div:last-child').text().trim();

        if (label && value) {
          productDetails[label] = value;
        }
      });
    }

    // Method 4: Direct selector for specific eBay structure
    if (Object.keys(productDetails).length <= 3) {
      // This targets the exact structure seen in the provided URL
      $('div.ux-layout-section__row').each((i, row) => {
        // Find all spans within this row
        const spans = $(row).find('span');

        if (spans.length >= 2) {
          let label = '';
          let value = '';

          // Extract label and value from spans
          spans.each((j, span) => {
            const text = $(span).text().trim();
            if (j === 0) {
              label = text;
            } else if (j === 1) {
              value = text;
            }
          });

          if (label && value) {
            productDetails[label] = value;
          }
        }
      });
    }

    // Method 5: Parse the item specifics table directly
    if (Object.keys(productDetails).length <= 3) {
      // Find tables that might contain item specifics
      $('.ux-layout-section-evo__content table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
          const cells = $(row).find('td');

          if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();

            if (label && value) {
              productDetails[label] = value;
            }
          }
        });
      });
    }

    // Method 6: Last resort - extract all key-value pairs from the page
    if (Object.keys(productDetails).length <= 3) {
      // This is a more aggressive approach to find any possible item specifics
      const html = $('body').html();
      const itemSpecificsMatch = html.match(/"itemAttributes":\s*(\[.*?\])/);

      if (itemSpecificsMatch && itemSpecificsMatch[1]) {
        try {
          const itemAttributes = JSON.parse(itemSpecificsMatch[1]);

          itemAttributes.forEach(attr => {
            if (attr.name && attr.value) {
              productDetails[attr.name] = attr.value;
            }
          });
        } catch (e) {
          console.error("Error parsing item attributes from JSON:", e);
        }
      }
    }

    // Clean up the product details
    const cleanedDetails = {};

    // Process each key-value pair
    Object.entries(productDetails).forEach(([key, value]) => {
      // Handle special cases
      if (key.includes('Main Stone') && key !== 'Main Stone') {
        const parts = key.split('Main Stone');
        const firstKey = parts[0].trim();
        const secondKey = 'Main Stone' + parts[1].trim();

        if (firstKey && value.includes(firstKey)) {
          const parts = value.split(firstKey);
          if (parts.length > 1) {
            cleanedDetails[firstKey] = parts[0].trim();
            cleanedDetails[secondKey] = parts[1].trim();
          }
        }
      } else {
        cleanedDetails[key] = value;
      }
    });

    return Object.keys(cleanedDetails).length > 0 ? cleanedDetails : productDetails;
  } catch (error) {
    console.error('Error scraping eBay product:', error);
    throw error;
  }
};

/**
 * Scrape product details from an Etsy product page
 * @param {string} url - The Etsy product URL
 * @returns {Promise<Object>} - Object containing product details
 */
export const scrapeEtsyProduct = async (url) => {
  try {
    // Validate URL is from Etsy
    if (!url.includes('etsy.com')) {
      throw new Error('Not a valid Etsy URL');
    }

    console.log(`Scraping Etsy product: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const productDetails = {};

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

    // Get shop name
    const shop = $('.shop-name-and-title-container .wt-text-body-01 a').text().trim();
    if (shop) {
      productDetails['Shop'] = shop;
    }

    // Extract product details from the item details section
    $('.wt-display-flex-xs.wt-flex-wrap li').each((i, element) => {
      const label = $(element).find('.wt-text-caption.wt-text-gray').text().trim();
      const value = $(element).find('.wt-display-inline-block').text().trim();
      
      if (label && value) {
        productDetails[label] = value;
      }
    });

    // Extract from product attributes section
    $('.wt-product-attributes li').each((i, element) => {
      const label = $(element).find('.wt-text-caption').text().trim();
      const value = $(element).find('.wt-text-body-01').text().trim();
      
      if (label && value) {
        productDetails[label] = value;
      }
    });

    return productDetails;
  } catch (error) {
    console.error('Error scraping Etsy product:', error);
    throw error;
  }
};

/**
 * Scrape eBay seller feedback
 * @param {string} url - The eBay seller feedback URL
 * @returns {Promise<Object>} - Object containing feedback data
 */
export const scrapeEbayFeedback = async (url) => {
  try {
    // Validate URL is from eBay
    if (!url.includes('ebay.com')) {
      throw new Error('Not a valid eBay URL');
    }

    console.log(`Scraping eBay feedback: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.ebay.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const feedbackData = {
      sellerName: '',
      feedbackScore: '',
      positiveFeedbackPercent: '',
      memberSince: '',
      feedbackRatings: {
        positive: { past1Month: '', past6Months: '', past12Months: '', lifetime: '' },
        neutral: { past1Month: '', past6Months: '', past12Months: '', lifetime: '' },
        negative: { past1Month: '', past6Months: '', past12Months: '', lifetime: '' },
      },
      recentFeedback: []
    };

    // Extract seller name
    feedbackData.sellerName = $('.str-seller-card__seller-id').text().trim();

    // Extract feedback score
    feedbackData.feedbackScore = $('.str-seller-card__feedback-score').text().trim();

    // Extract positive feedback percentage
    const positivePercent = $('.str-seller-card__feedback-percentage').text().trim();
    feedbackData.positiveFeedbackPercent = positivePercent;

    // Extract member since date
    const memberSinceText = $('.str-seller-card__member-info').text().trim();
    const memberSinceMatch = memberSinceText.match(/Member since: (.+)/);
    if (memberSinceMatch && memberSinceMatch[1]) {
      feedbackData.memberSince = memberSinceMatch[1].trim();
    }

    // Extract feedback ratings table
    $('.str-feedback-table tr').each((i, row) => {
      if (i === 0) return; // Skip header row

      const columns = $(row).find('td');
      const rowType = $(columns[0]).text().trim().toLowerCase();
      
      if (rowType.includes('positive')) {
        feedbackData.feedbackRatings.positive.past1Month = $(columns[1]).text().trim();
        feedbackData.feedbackRatings.positive.past6Months = $(columns[2]).text().trim();
        feedbackData.feedbackRatings.positive.past12Months = $(columns[3]).text().trim();
        feedbackData.feedbackRatings.positive.lifetime = $(columns[4]).text().trim();
      } else if (rowType.includes('neutral')) {
        feedbackData.feedbackRatings.neutral.past1Month = $(columns[1]).text().trim();
        feedbackData.feedbackRatings.neutral.past6Months = $(columns[2]).text().trim();
        feedbackData.feedbackRatings.neutral.past12Months = $(columns[3]).text().trim();
        feedbackData.feedbackRatings.neutral.lifetime = $(columns[4]).text().trim();
      } else if (rowType.includes('negative')) {
        feedbackData.feedbackRatings.negative.past1Month = $(columns[1]).text().trim();
        feedbackData.feedbackRatings.negative.past6Months = $(columns[2]).text().trim();
        feedbackData.feedbackRatings.negative.past12Months = $(columns[3]).text().trim();
        feedbackData.feedbackRatings.negative.lifetime = $(columns[4]).text().trim();
      }
    });

    // Extract recent feedback
    $('.str-feedback-list__item').each((i, item) => {
      if (i >= 5) return; // Limit to 5 recent feedback items

      const feedbackType = $(item).find('.str-feedback-list__item-type').text().trim();
      const feedbackText = $(item).find('.str-feedback-list__comment').text().trim();
      const buyerInfo = $(item).find('.str-feedback-list__user').text().trim();
      const feedbackDate = $(item).find('.str-feedback-list__item-date').text().trim();

      feedbackData.recentFeedback.push({
        type: feedbackType,
        text: feedbackText,
        buyer: buyerInfo,
        date: feedbackDate
      });
    });

    return feedbackData;
  } catch (error) {
    console.error('Error scraping eBay feedback:', error);
    throw error;
  }
};

/**
 * Main scraper function that determines which platform to scrape
 * @param {string} url - The product URL
 * @param {number} platform - Platform identifier (0 for eBay, 1 for Etsy, 2 for eBay Feedback)
 * @returns {Promise<Object>} - Object containing scraped data
 */
export const scrapeProductDetails = async (url, platform) => {
  switch (platform) {
    case 0:
      return scrapeEbayProduct(url);
    case 1:
      return scrapeEtsyProduct(url);
    case 2:
      return scrapeEbayFeedback(url);
    default:
      throw new Error('Invalid platform. Use 0 for eBay, 1 for Etsy, or 2 for eBay Feedback');
  }
};
