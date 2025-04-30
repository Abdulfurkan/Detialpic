import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { detectGemstoneColors } from '../lib/gemstoneColors';

// Helper function to determine text color based on background color
const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const ProductDetails = ({ productDetails, setSelectedDetails, selectedDetails, detailsOrder, setDetailsOrder, colorScheme, setColorScheme, productImages, showProductImages, setShowProductImages }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorSetting, setActiveColorSetting] = useState(null);
  const [detectedGemstone, setDetectedGemstone] = useState(null);
  const [processedDetails, setProcessedDetails] = useState({});

  // Process product details to combine related fields
  useEffect(() => {
    if (productDetails && Object.keys(productDetails).length > 0) {
      const processed = { ...productDetails };
      
      // Rename Grade to Cut Grade
      if (processed['Grade'] && !processed['Cut Grade']) {
        processed['Cut Grade'] = processed['Grade'];
        delete processed['Grade'];
      }
      
      // Handle Size and Dimensions consistently with ImagePreview component
      const hasSize = Object.keys(processed).some(key => 
        key.toLowerCase() === 'size'
      );
      
      // Combine dimensions if they exist (only if Size doesn't exist)
      const dimensionKeys = Object.keys(processed).filter(key => 
        key.includes('Length') || key.includes('Width') || key.includes('Depth') || 
        key.includes('length') || key.includes('width') || key.includes('depth')
      );

      if (dimensionKeys.length > 1) {
        // Always create the Dimensions field for the customization list
        const dimensions = dimensionKeys.map(key => `${key}: ${processed[key]}`).join(', ');
        processed['Dimensions'] = dimensions;
        
        // Remove individual dimension fields
        dimensionKeys.forEach(key => delete processed[key]);
      }
      
      setProcessedDetails(processed);
      
      // Initialize detailsOrder if it's empty
      if (detailsOrder.length === 0) {
        setDetailsOrder(Object.keys(processed));
      }
    } else {
      setProcessedDetails({});
    }
  }, [productDetails, setDetailsOrder, detailsOrder]);

  // Detect gemstone colors when product details change
  useEffect(() => {
    if (productDetails && Object.keys(productDetails).length > 0) {
      const gemstoneColorScheme = detectGemstoneColors(productDetails);
      
      // Only update color scheme if a gemstone was detected
      if (gemstoneColorScheme.detectedGemstone || gemstoneColorScheme.detectedMetal) {
        setColorScheme({
          headerBg: gemstoneColorScheme.headerBg,
          rowBg: gemstoneColorScheme.rowBg,
          altRowBg: gemstoneColorScheme.altRowBg,
          textColor: gemstoneColorScheme.textColor
        });
        
        setDetectedGemstone(
          gemstoneColorScheme.detectedGemstone ? 
            gemstoneColorScheme.name : 
            gemstoneColorScheme.detectedMetal ? 
              gemstoneColorScheme.name : 
              null
        );
      }
    }
  }, [productDetails, setColorScheme]);

  if (!productDetails || Object.keys(productDetails).length === 0) {
    return null;
  }

  const handleCheckboxChange = (key) => {
    setSelectedDetails(prev => {
      const newDetails = { ...prev };
      if (newDetails[key]) {
        delete newDetails[key];
      } else {
        newDetails[key] = processedDetails[key];
      }
      return newDetails;
    });
  };

  const handleColorChange = (color) => {
    if (activeColorSetting) {
      setColorScheme(prev => ({
        ...prev,
        [activeColorSetting]: color.hex
      }));
    }
  };

  const toggleColorPicker = (setting) => {
    if (activeColorSetting === setting && showColorPicker) {
      setShowColorPicker(false);
      setActiveColorSetting(null);
    } else {
      setShowColorPicker(true);
      setActiveColorSetting(setting);
    }
  };

  const colorSettings = [
    { name: 'headerBg', label: 'Header Background' },
    { name: 'rowBg', label: 'Row Background' },
    { name: 'altRowBg', label: 'Alternate Row Background' },
    { name: 'textColor', label: 'Text Color' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
        </svg>
        Customize Product Details
      </h2>

      <div className="mb-6">
        <div className="flex flex-wrap items-center mb-4">
          {detectedGemstone && (
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full mb-2 mr-2">
              <span className="font-medium">Auto-detected:</span> {detectedGemstone}
            </span>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {colorSettings.map(setting => (
              <button
                key={setting.name}
                onClick={() => toggleColorPicker(setting.name)}
                className="flex items-center px-3 py-1.5 text-sm border rounded-md transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: colorScheme[setting.name],
                  color: setting.name === 'textColor' ? '#fff' : (colorScheme[setting.name] === '#ffffff' ? '#000' : getContrastColor(colorScheme[setting.name])),
                  borderColor: 'rgba(0,0,0,0.1)'
                }}
              >
                <span className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: colorScheme[setting.name] }}></span>
                {setting.label}
              </button>
            ))}
          </div>
        </div>

        {showColorPicker && (
          <div className="relative z-10 mb-4">
            <div className="absolute top-0 left-0 shadow-lg rounded-md overflow-hidden">
              <div className="bg-white p-2 rounded-t-md border-b flex justify-between items-center">
                <span className="text-sm font-medium">
                  {colorSettings.find(s => s.name === activeColorSetting)?.label}
                </span>
                <button 
                  onClick={() => setShowColorPicker(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
              <SketchPicker
                color={colorScheme[activeColorSetting]}
                onChange={handleColorChange}
                disableAlpha={true}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
          </svg>
          Select Details to Include:
        </h3>
        
        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(processedDetails).map(key => (
              <div 
                key={key} 
                className={`flex items-center p-3 border rounded-md transition-all duration-200 
                  ${selectedDetails[key] ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <label className="flex items-center cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={!!selectedDetails[key]}
                    onChange={() => handleCheckboxChange(key)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="ml-3 flex-grow">
                    <div className="font-medium text-gray-800">{key}</div>
                    <div className="text-sm text-gray-600 truncate">{processedDetails[key]}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setSelectedDetails({})}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
          >
            Clear All
          </button>
          <button
            onClick={() => setSelectedDetails({...processedDetails})}
            className="px-4 py-2 text-sm text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
          >
            Select All
          </button>
        </div>
      </div>
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-600 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
          </svg>
          Drag the dots in the preview to reorder details
        </p>
      </div>
      
      {productImages && productImages.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
            Product Images
          </h3>
          <div className="flex items-center mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showProductImages}
                onChange={() => setShowProductImages(!showProductImages)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">Show product images</span>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {productImages.map((image, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt={`Product image ${index + 1}`} 
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '100px' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
