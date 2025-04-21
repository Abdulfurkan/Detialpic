import { NextResponse } from 'next/server';
import { scrapeProductDetails } from '../../lib/vercel-scraper';

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
      const productDetails = await scrapeProductDetails(url, platform);

      if (!productDetails || Object.keys(productDetails).length === 0) {
        return NextResponse.json(
          { error: 'No product details found for this URL' },
          { status: 404 }
        );
      }

      return NextResponse.json(productDetails);
    } catch (error) {
      console.error('Scraping error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to scrape product details' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
