import { NextResponse } from 'next/server';
import { scrapeProductDetails } from '../../lib/vercel-scraper';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, platform } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (platform !== 0 && platform !== 1 && platform !== 2) {
      return NextResponse.json(
        { error: 'Invalid platform. Use 0 for eBay, 1 for Etsy, or 2 for eBay Feedback' },
        { status: 400 }
      );
    }

    try {
      // Get product details from the scraper
      const productDetails = await scrapeProductDetails(url, platform);
      
      // For eBay, add a direct image extraction method as a backup
      if (platform === 0 && url.includes('ebay.com') && (!productDetails.productImages || productDetails.productImages.length === 0)) {
        console.log('Attempting direct image extraction for eBay as backup');
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          const $ = cheerio.load(response.data);
          const productImages = [];
          
          // Try all image selectors
          const allImages = $('img').toArray();
          for (const img of allImages) {
            const src = $(img).attr('src');
            if (src && src.includes('ebayimg.com') && src.includes('.jpg') && !src.includes('spinner') && !src.includes('icon')) {
              const fullSizeImg = src.replace(/s-l\d+\.jpg/, 's-l1600.jpg');
              productImages.push(fullSizeImg);
              console.log(`Direct extraction found image: ${fullSizeImg}`);
              
              if (productImages.length >= 2) break;
            }
          }
          
          if (productImages.length > 0) {
            productDetails.productImages = productImages;
            console.log(`Added ${productImages.length} images from direct extraction`);
          }
        } catch (imageError) {
          console.error('Error in direct image extraction:', imageError);
        }
      }

      // Even if we get empty results, return what we have to avoid errors
      // The client can handle empty or partial results
      if (!productDetails || Object.keys(productDetails).length === 0) {
        console.log('No product details found, returning fallback data');
        
        // Extract product name from URL for fallback
        const urlParts = url.split('/');
        const productSlug = urlParts[urlParts.length - 1].split('?')[0];
        const productName = productSlug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        // Return fallback data instead of error
        return NextResponse.json({
          'Product Name': productName || 'Product',
          'Note': 'Limited product details available. This is fallback data.',
          'URL': url
        });
      }

      return NextResponse.json(productDetails);
    } catch (error) {
      console.error('Scraping error:', error);
      
      // Instead of returning an error, return fallback data
      // Extract product name from URL for fallback
      const urlParts = url.split('/');
      const productSlug = urlParts[urlParts.length - 1].split('?')[0];
      const productName = productSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      return NextResponse.json({
        'Product Name': productName || 'Product',
        'Error': error.message || 'Failed to scrape product details',
        'Note': 'Error occurred during scraping. This is fallback data.',
        'URL': url
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
