import React, { useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item component
const SortableRow = ({ id, keyName, value, bgColor, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: bgColor,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex border border-gray-200">
      <div className="p-3 border-r border-gray-200 font-medium w-2/5">
        {keyName}
      </div>
      <div className="p-3 relative w-3/5">
        <div className="flex justify-between items-center">
          <div className="pr-16">{value}</div>
          <div className="controls-container absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <button
              onClick={() => onRemove(id)}
              className="remove-button hide-for-download flex items-center justify-center w-6 h-6 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
              title="Remove item"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <div
              {...attributes}
              {...listeners}
              className="drag-handle hide-for-download flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full cursor-grab active:cursor-grabbing transition-colors duration-200"
              title="Drag to reorder"
              aria-label="Drag to reorder"
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImagePreview = ({ productDetails, detailsOrder, setDetailsOrder, setSelectedDetails, colorScheme, productImages = [], showProductImages = true }) => {
  // Step 1: Add state for image placement
  // Possible values: 'top' (default), 'left'
  const [imagePlacement, setImagePlacement] = useState('top');
  const previewRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [processedDetails, setProcessedDetails] = useState({});
  const [orderedKeys, setOrderedKeys] = useState([]);
  const [removedItem, setRemovedItem] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [imageSize, setImageSize] = useState(100); // Default image size 100%

  const [imageLayout, setImageLayout] = useState('horizontal'); // 'horizontal', 'square', 'vertical'
  const [imageFit, setImageFit] = useState('contain'); // 'contain' or 'cover'

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Process the product details to combine Cut and Grade
  useEffect(() => {
    if (!productDetails || Object.keys(productDetails).length === 0) {
      setProcessedDetails({});
      setOrderedKeys([]);
      return;
    }

    const processed = { ...productDetails };

    // Rename Gemstone Type to Gemstone Name if it exists
    if (processed['Gemstone Type']) {
      processed['Gemstone Name'] = processed['Gemstone Type'];
      delete processed['Gemstone Type'];
    }
    // Also check for Gem Type
    else if (processed['Gem Type']) {
      processed['Gemstone Name'] = processed['Gem Type'];
      delete processed['Gem Type'];
    }

    // Rename Grade to Cut Grade
    if (processed['Grade'] && !processed['Cut Grade']) {
      processed['Cut Grade'] = processed['Grade'];
      delete processed['Grade'];
    }

    // Handle Size and Dimensions - if both exist, remove Dimensions
    const hasSize = Object.keys(processed).some(key =>
      key.toLowerCase() === 'size'
    );

    const hasDimensions = Object.keys(processed).some(key =>
      key.toLowerCase() === 'dimensions'
    );

    if (hasSize && hasDimensions) {
      // If both Size and Dimensions exist, remove Dimensions
      const dimensionsKey = Object.keys(processed).find(key =>
        key.toLowerCase() === 'dimensions'
      );
      if (dimensionsKey) {
        delete processed[dimensionsKey];
      }
    }

    // If Size exists, also remove Item Length, Item Width, and Item Depth
    if (hasSize) {
      const dimensionFieldsToRemove = Object.keys(processed).filter(key =>
        key.includes('Length') || key.includes('Width') || key.includes('Depth') ||
        key.includes('length') || key.includes('width') || key.includes('depth')
      );

      dimensionFieldsToRemove.forEach(key => delete processed[key]);
    }
    // Combine dimensions if they exist (only if Size doesn't exist)
    else {
      const dimensionKeys = Object.keys(processed).filter(key =>
        key.includes('Length') || key.includes('Width') || key.includes('Depth') ||
        key.includes('length') || key.includes('width') || key.includes('depth')
      );

      if (dimensionKeys.length > 1) {
        const dimensions = dimensionKeys.map(key => `${key}: ${processed[key]}`).join(', ');
        processed['Dimensions'] = dimensions;

        // Remove individual dimension fields
        dimensionKeys.forEach(key => delete processed[key]);
      }
    }

    setProcessedDetails(processed);

    // Use the provided detailsOrder if available, otherwise use the keys from processed details
    if (detailsOrder && detailsOrder.length > 0) {
      // Filter out any keys that don't exist in the processed details
      const validOrderedKeys = detailsOrder.filter(key => processed[key] !== undefined);

      // Add any keys that are in processed but not in detailsOrder
      const missingKeys = Object.keys(processed).filter(key => !validOrderedKeys.includes(key));

      setOrderedKeys([...validOrderedKeys, ...missingKeys]);
    } else {
      // Default ordering - prioritize Gemstone Name if it exists
      const keys = Object.keys(processed);
      const gemstoneNameIndex = keys.findIndex(key => key === 'Gemstone Name');

      if (gemstoneNameIndex !== -1) {
        const gemstoneNameKey = keys.splice(gemstoneNameIndex, 1)[0];
        setOrderedKeys([gemstoneNameKey, ...keys]);
      } else {
        setOrderedKeys(keys);
      }
    }
  }, [productDetails, detailsOrder]);

  // Handle removing an item
  const handleRemoveItem = (key) => {
    // Store the removed item for potential undo
    setRemovedItem({
      key,
      value: processedDetails[key],
      index: orderedKeys.indexOf(key)
    });

    // Update the ordered keys
    setOrderedKeys(prev => prev.filter(k => k !== key));

    // Update the selected details in the parent component
    // Only remove from selectedDetails, not from the original productDetails
    setSelectedDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[key];
      return newDetails;
    });

    // Update the details order in the parent component
    // This only affects the order, not the available items in the list
    setDetailsOrder(prev => prev.filter(k => k !== key));

    // Show the undo option
    setShowUndo(true);

    // Auto-hide the undo option after 5 seconds
    setTimeout(() => {
      setShowUndo(false);
      setRemovedItem(null);
    }, 5000);
  };

  // Handle undoing a removal
  const handleUndoRemove = () => {
    if (!removedItem) return;

    // Restore the item to its original position
    const newOrderedKeys = [...orderedKeys];
    newOrderedKeys.splice(removedItem.index, 0, removedItem.key);
    setOrderedKeys(newOrderedKeys);

    // Update the selected details in the parent component
    setSelectedDetails(prev => ({
      ...prev,
      [removedItem.key]: removedItem.value
    }));

    // Update the details order in the parent component
    const newDetailsOrder = [...detailsOrder];
    newDetailsOrder.splice(removedItem.index, 0, removedItem.key);
    setDetailsOrder(newDetailsOrder);

    // Hide the undo option
    setShowUndo(false);
    setRemovedItem(null);
  };

  const handleDownload = async () => {
  // Hide drag and delete icons before generating image
  const toHide = document.querySelectorAll('.hide-for-download');
  toHide.forEach(el => el.style.visibility = 'hidden');

    if (!previewRef.current) {
      console.error('Preview reference is not available');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Starting image generation...');

      // Add a small delay to ensure the DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Log dimensions for debugging
      const { width, height } = previewRef.current.getBoundingClientRect();
      console.log(`Preview dimensions: ${width}x${height}`);

      // Check if the preview has content
      if (width === 0 || height === 0) {
        throw new Error('Preview container has zero dimensions');
      }

      // Generate the image with more options
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        quality: 0.95,
        pixelRatio: 2, // Higher resolution
        width: Math.max(width, 10), // Ensure minimum width
        height: Math.max(height, 10), // Ensure minimum height
        skipAutoScale: true,
        canvasWidth: width * 2, // Double for better quality
        canvasHeight: height * 2, // Double for better quality
        filter: (node) => {
          // Filter out any resize controls that might be inside the container
          const result = !node.classList || !node.classList.contains('resize-control');
          return result;
        }
      });

      console.log('Image generated successfully');

      // Validate the dataUrl
      if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
        throw new Error('Generated image data is invalid');
      }

      // Create a download link
      const link = document.createElement('a');
      link.download = 'product-details.png';
      link.href = dataUrl;
      link.click();

      // Show success message briefly
      setDownloadSuccess(true);
      // Restore drag and delete icons after generating image
      toHide.forEach(el => el.style.visibility = '');
      setTimeout(() => {
        setDownloadSuccess(false);
      // Restore drag and delete icons after download fails or after timeout
      toHide.forEach(el => el.style.visibility = '');
      }, 3000);
    } catch (error) {
      console.error('Error generating image:', error);

      // More detailed error logging
      if (error.message) {
        console.error('Error message:', error.message);
      }

      if (error.stack) {
        console.error('Error stack:', error.stack);
      }

      // Try fallback method if the first method fails
      try {
        console.log('Attempting fallback image generation method...');
        const dataUrl = await htmlToImage.toCanvas(previewRef.current)
          .then(canvas => canvas.toDataURL('image/png'));

        const link = document.createElement('a');
        link.download = 'product-details.png';
        link.href = dataUrl;
        link.click();

        setDownloadSuccess(true);
      // Restore drag and delete icons after generating image
      toHide.forEach(el => el.style.visibility = '');
        setTimeout(() => {
          setDownloadSuccess(false);
      // Restore drag and delete icons after download fails or after timeout
      toHide.forEach(el => el.style.visibility = '');
        }, 3000);

        console.log('Fallback method succeeded');
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setOrderedKeys((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Update the details order in the parent component
        setDetailsOrder(newOrder);

        return newOrder;
      });
    }
  };

  if (!productDetails || Object.keys(productDetails).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center transition-all duration-300 hover:shadow-lg">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p className="text-gray-500 text-center mt-4">
            Enter a product URL and customize details to see a preview here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Step 2: Placement controls (top/left) */}
      <div className="flex items-center mb-4 space-x-3">
        <span className="text-gray-700 font-medium mr-2">Image Placement:</span>
        <button
          onClick={() => setImagePlacement('top')}
          className={`p-2 rounded border flex items-center justify-center transition-colors duration-200 ${imagePlacement === 'top' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-100'}`}
          title="Place images above details"
          aria-label="Top placement"
        >
          {/* Top icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="6" rx="1.5" fill={imagePlacement === 'top' ? '#2563eb' : '#e5e7eb'} stroke="currentColor" />
            <rect x="4" y="12" width="16" height="8" rx="1.5" fill="#fff" stroke="currentColor" />
          </svg>
        </button>
        <button
          onClick={() => setImagePlacement('left')}
          className={`p-2 rounded border flex items-center justify-center transition-colors duration-200 ${imagePlacement === 'left' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-100'}`}
          title="Place images left of details"
          aria-label="Left placement"
        >
          {/* Left icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="6" height="16" rx="1.5" fill={imagePlacement === 'left' ? '#2563eb' : '#e5e7eb'} stroke="currentColor" />
            <rect x="12" y="4" width="8" height="16" rx="1.5" fill="#fff" stroke="currentColor" />
          </svg>
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
        </svg>
        Image Preview
      </h2>

      {showUndo && removedItem && (
        <div className="mb-4 flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-md text-sm">
          <span className="text-blue-700">
            <span className="font-medium">{removedItem.key}</span> removed
          </span>
          <button
            onClick={handleUndoRemove}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Undo
          </button>
        </div>
      )}

      <div className="mb-4 border rounded-lg overflow-hidden shadow-sm hover:shadow transition-all duration-300">
        <div
          ref={previewRef}
          className="w-full"
          style={{
            fontFamily: 'Arial, sans-serif',
            color: colorScheme.textColor,
          }}
        >
          {/* Product Images Section & Product Details Placement */}
          {showProductImages && productImages.length > 0 && imagePlacement === 'left' ? (
            <div className="flex flex-col md:flex-row gap-1 mb-2">
              {/* Images on the left */}
              <div className="md:w-1/3 w-full flex flex-col items-center">
                <div
                  className={`w-full border border-gray-200 bg-white overflow-hidden h-full`}
                  style={{
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="flex flex-col h-full">
                    {productImages.slice(0, 2).map((image, index) => (
                      <div
                        key={index}
                        className="overflow-hidden flex items-center justify-center w-full"
                        style={{
                          height: index === 0 ? '60%' : '40%',
                          flex: index === 0 ? '1 0 60%' : '1 0 40%'
                        }}
                      >
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className={`transition-all duration-300 ${imageFit === 'contain' ? 'object-contain' : 'object-cover'} w-full h-full`}
                          style={{
                            transform: `scale(${imageSize / 100})`,
                            transformOrigin: 'center center',
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Product Details Table on the right */}
              <div className="md:w-2/3 w-full">
                <div className="border border-collapse overflow-hidden rounded-md">
                  {/* Header */}
                  <div
                    className="text-center p-3 font-bold text-lg w-full"
                    style={{ backgroundColor: colorScheme.headerBg, color: colorScheme.textColor }}
                  >
                    Product Details
                  </div>

                  {/* Sortable Content */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={orderedKeys}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="w-full">
                        {orderedKeys.map((key, index) => (
                          <SortableRow
                            key={key}
                            id={key}
                            keyName={key}
                            value={processedDetails[key]}
                            bgColor={index % 2 === 0 ? colorScheme.rowBg : colorScheme.altRowBg}
                            onRemove={handleRemoveItem}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          ) : (
            <>
              {showProductImages && productImages.length > 0 && (
                <div className="mb-2 relative">
                  {/* Image container with fixed aspect ratio based on selected layout */}
                  <div
                    className={`w-full border border-gray-200 bg-white overflow-hidden`}
                    style={{
                      aspectRatio: imageLayout === 'horizontal' ? '16/9' : imageLayout === 'square' ? '1/1' : '9/16',
                      maxHeight: imageLayout === 'horizontal' ? '300px' : imageLayout === 'square' ? '400px' : '500px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2 h-full">
                      {productImages.slice(0, 2).map((image, index) => (
                        <div key={index} className="overflow-hidden flex items-center justify-center h-full">
                          <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className={`transition-all duration-300 ${imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              transform: `scale(${imageSize / 100})`,
                              transformOrigin: 'center center'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="border border-collapse overflow-hidden rounded-md">
                {/* Header */}
                <div
                  className="text-center p-3 font-bold text-lg w-full"
                  style={{ backgroundColor: colorScheme.headerBg, color: colorScheme.textColor }}
                >
                  Product Details
                </div>

                {/* Sortable Content */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedKeys}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="w-full">
                      {orderedKeys.map((key, index) => (
                        <SortableRow
                          key={key}
                          id={key}
                          keyName={key}
                          value={processedDetails[key]}
                          bgColor={index % 2 === 0 ? colorScheme.rowBg : colorScheme.altRowBg}
                          onRemove={handleRemoveItem}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isGenerating || orderedKeys.length === 0}
        className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
          ${(isGenerating || orderedKeys.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}
          ${downloadSuccess ? 'bg-green-500' : ''}`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Image...
          </span>
        ) : downloadSuccess ? (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Image Downloaded!
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download Image
          </span>
        )}

      </button>
      {orderedKeys.length === 0 && (
        <p className="mt-3 text-sm text-center text-red-500">
          No details selected. Please select details from the customize panel.
        </p>
      )}
    </div>
  );
}

export default ImagePreview;
