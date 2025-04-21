import React, { useState } from 'react';

const UrlForm = ({ onSubmit, isLoading, platform }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  // Platform-specific text content
  const platformContent = {
    ebay: {
      title: "Enter eBay Product URL",
      description: "Paste an eBay jewelry listing URL to generate a professional product details image. Our tool will extract all specifications and create a customizable image for your marketing.",
      placeholder: "https://www.ebay.com/itm/...",
      buttonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      iconColor: "text-blue-600"
    },
    etsy: {
      title: "Enter Etsy Product URL",
      description: "Paste an Etsy handmade item URL to generate a beautiful product details image. Perfect for showcasing your craftsmanship and materials in a professional format.",
      placeholder: "https://www.etsy.com/listing/...",
      buttonColor: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
      iconColor: "text-orange-600"
    }
  };

  const content = platform === 0 ? platformContent.ebay : platformContent.etsy;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        {platform === 0 ? (
          <span className="flex items-center">
            <svg className={`w-5 h-5 mr-2 ${content.iconColor}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"></path>
            </svg>
            {content.title}
          </span>
        ) : (
          <span className="flex items-center">
            <svg className={`w-5 h-5 mr-2 ${content.iconColor}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"></path>
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
            </svg>
            {content.title}
          </span>
        )}
      </h2>
      <p className="text-gray-600 mb-4">{content.description}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={content.placeholder}
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
          className={`w-full ${content.buttonColor} text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50`}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Generate Image
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UrlForm;
