'use client';

import { useState } from 'react';
import Header from './components/Header';
import UrlForm from './components/UrlForm';
import ProductDetails from './components/ProductDetails';
import ImagePreview from './components/ImagePreview';
import FeedbackPreview from './components/FeedbackPreview';
import AdSense from './components/AdSense';
import gemstoneColors from './lib/gemstoneColors';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [detailsOrder, setDetailsOrder] = useState([]); // New state for tracking order
  const [feedbackData, setFeedbackData] = useState(null);
  const [colorScheme, setColorScheme] = useState({
    headerBg: gemstoneColors.default.headerBg,
    rowBg: gemstoneColors.default.rowBg,
    altRowBg: gemstoneColors.default.altRowBg,
    textColor: gemstoneColors.default.textColor
  });

  const handleUrlSubmit = async (submittedUrl) => {
    setIsLoading(true);
    setError('');
    setProductDetails(null);
    setSelectedDetails({});
    setDetailsOrder([]); // Reset order when submitting a new URL
    setFeedbackData(null);

    try {
      // Determine the platform for the API call
      let platformForApi = activeTab;
      if (activeTab === 1) {
        platformForApi = 2; // Use 2 for eBay Feedback
      }

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: submittedUrl, platform: platformForApi }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape details');
      }

      if (Object.keys(data).length === 0) {
        throw new Error('No details found');
      }

      // Handle eBay Feedback data differently
      if (activeTab === 1) {
        setFeedbackData(data);
        return;
      }

      // Process product details for eBay and Etsy tabs
      // Post-process data to combine Cut and Grade fields
      const processedData = { ...data };
      if (processedData['Cut'] && processedData['Grade']) {
        processedData['Cut Grade'] = processedData['Grade'];
        delete processedData['Cut'];
        delete processedData['Grade'];
      }

      // Rename Gemstone Type to Gemstone Name if it exists
      if (processedData['Gemstone Type']) {
        processedData['Gemstone Name'] = processedData['Gemstone Type'];
        delete processedData['Gemstone Type'];
      }
      // Also check for Gem Type
      else if (processedData['Gem Type']) {
        processedData['Gemstone Name'] = processedData['Gem Type'];
        delete processedData['Gem Type'];
      }

      setProductDetails(processedData);

      // Fields to exclude from default selection
      const excludedFields = [
        'Product name',
        'Product Name',
        'Price',
        'Condition',
        'Brand',
        'Personalize',
        'Personalization Instructions',
        'Wholesale',
        'Seller Notes',
        'Vintage',
        'Country/Region of Manufacture',
        'Country/Region of Origin',
        'Handmade',
        'Made to Order',
        'Seller',
        'Shop',
        'Gemstone Effect',
        'UPC',
        'Certification',
        'Certificate Number',
        'Number of pieces',
        'Number of Pieces',
        'Cut',
        'Gemstone Form',
        'Gemstone Creation',
        'Quantity',
        'SKU',
        'CustomeLabel',
        'Custom Label',
        'CustomLabel',
        'Product ID',
        'Item ID',
        'Transparency',
        'Hardness',
        'Clarity',
        'Gemstone Clarity Grade',
        'Length',
        'Width',
        'Height',
        'Depth'
      ];

      // If both Gemstone Name and Gemstone Type exist, exclude Gemstone Type from default view
      if (processedData['Gemstone Name'] && processedData['Gemstone Type']) {
        excludedFields.push('Gemstone Type');
      }

      // If both Color and Gemstone Color exist, exclude Gemstone Color from default view
      if (processedData['Color'] && processedData['Gemstone Color']) {
        excludedFields.push('Gemstone Color');
      }

      // If both Treatment and Gemstone Treatment exist, exclude Gemstone Treatment from default view
      if (processedData['Treatment'] && processedData['Gemstone Treatment']) {
        excludedFields.push('Gemstone Treatment');
      }

      // Handle Size and Dimensions - explicitly check for both fields
      const hasSize = 'Size' in processedData;
      const hasDimensions = 'Dimensions' in processedData;

      // If both exist, exclude Dimensions
      if (hasSize && hasDimensions) {
        excludedFields.push('Dimensions');
      }
      // If only Dimensions exists (no Size), don't exclude it
      else if (!hasSize && hasDimensions) {
        // Do nothing, keep Dimensions visible
      }
      // If only Size exists, don't exclude it
      else if (hasSize && !hasDimensions) {
        // Do nothing, keep Size visible
      }

      // If Size exists, also exclude Item Length, Item Width, and Item Depth from default selection
      if (hasSize) {
        Object.keys(processedData).forEach(key => {
          if (key.includes('Length') || key.includes('Width') || key.includes('Depth') ||
            key.includes('length') || key.includes('width') || key.includes('depth')) {
            if (!excludedFields.includes(key)) {
              excludedFields.push(key);
            }
          }
        });
      }

      console.log('Has Size:', hasSize);
      console.log('Has Dimensions:', hasDimensions);
      console.log('Excluded Fields:', excludedFields);

      // Create a filtered selection of details excluding the specified fields
      const filteredDetails = Object.entries(processedData).reduce((acc, [key, value]) => {
        if (!excludedFields.includes(key)) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('Selected Details:', filteredDetails);

      // Set the initial order of details
      setDetailsOrder(Object.keys(filteredDetails));

      // Ensure Dimensions is in the product details but not in selected details when Size exists
      if (hasSize && 'Dimensions' in processedData && !('Dimensions' in filteredDetails)) {
        // This ensures Dimensions is available in the customization list but not selected by default
        console.log('Ensuring Dimensions is available for customization but not selected by default');
      }

      setSelectedDetails(filteredDetails); // Set only the filtered details
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while scraping details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 py-8">
        {/* Top ad placement - above the content */}
        <AdSense
          slot="1234567890"
          format="horizontal"
          style={{ display: 'block', textAlign: 'center' }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-5">
            <div className="space-y-6">
              {activeTab !== 1 ? (
                <UrlForm
                  onSubmit={handleUrlSubmit}
                  isLoading={isLoading}
                  platform={activeTab}
                />
              ) : (
                <div className="w-full bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                      </svg>
                      eBay Feedback Tool
                    </span>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Enter an eBay seller feedback URL to generate a professional feedback summary image. This tool helps showcase seller reputation and customer reviews.
                  </p>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (url.trim()) {
                      handleUrlSubmit(url.trim());
                    }
                  }} className="space-y-4">
                    <div className="relative">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.ebay.com/str/sellername?_tab=feedback"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all duration-200 pl-10 text-gray-900 font-medium"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                      </div>
                      {url && (
                        <button
                          type="button"
                          onClick={() => setUrl('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-green-500"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Generate Feedback Image
                        </>
                      )}
                    </button>
                  </form>

                  {/* eBay Review tab ad placement */}
                  <div className="mt-6">
                    <AdSense
                      slot="6789054321"
                      format="rectangle"
                      style={{ display: 'block' }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 1 && productDetails && (
                <ProductDetails
                  productDetails={productDetails}
                  selectedDetails={selectedDetails}
                  setSelectedDetails={setSelectedDetails}
                  detailsOrder={detailsOrder}
                  setDetailsOrder={setDetailsOrder}
                  colorScheme={colorScheme}
                  setColorScheme={setColorScheme}
                />
              )}

              {/* In-content ad placement */}
              <AdSense
                slot="0987654321"
                format="rectangle"
                style={{ display: 'block', marginTop: '2rem' }}
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="sticky top-24">
              {activeTab !== 1 ? (
                <ImagePreview
                  productDetails={selectedDetails}
                  detailsOrder={detailsOrder}
                  setDetailsOrder={setDetailsOrder}
                  setSelectedDetails={setSelectedDetails}
                  colorScheme={colorScheme}
                />
              ) : (
                feedbackData && <FeedbackPreview feedbackData={feedbackData} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ad placement - before footer */}
      <div className="mt-12">
        <AdSense
          slot="5432167890"
          format="horizontal"
          style={{ display: 'block', textAlign: 'center' }}
        />
      </div>

      <footer className="mt-12 bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            {new Date().getFullYear()} DetailCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
