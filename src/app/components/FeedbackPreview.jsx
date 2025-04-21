import React from 'react';
import { toPng } from 'html-to-image';

const FeedbackPreview = ({ feedbackData }) => {
  const downloadImage = () => {
    const element = document.getElementById('feedback-preview');
    if (!element) return;

    toPng(element, { quality: 0.95 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'ebay-feedback.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error generating image:', err);
      });
  };

  if (!feedbackData) return null;

  const { ratings, detailedRatings, feedbackComments } = feedbackData;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Feedback Preview</h2>

      <div
        id="feedback-preview"
        className="bg-white p-6 rounded-lg border border-gray-200 mb-4"
        style={{ 
          width: '100%',
          maxWidth: '100%',
          minHeight: '500px',
          aspectRatio: '16/9'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header Section with Title */}
          <div className="mb-4 border-b border-gray-200 pb-2">
            <h3 className="text-xl font-bold text-gray-800">eBay Seller Feedback Summary</h3>
          </div>

          {/* Main Content - Horizontal Layout */}
          <div className="flex flex-row flex-1 gap-4 flex-wrap md:flex-nowrap">
            {/* Left Column - Ratings */}
            <div className="w-full md:w-1/3 flex flex-col">
              {/* Feedback Ratings Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Feedback ratings</h3>
                <p className="text-sm text-gray-600 mb-2">Last 12 months</p>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="font-bold text-green-600 text-xl">{ratings.positive}</div>
                    <div className="text-sm text-gray-700">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-600 text-xl">{ratings.neutral}</div>
                    <div className="text-sm text-gray-700">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600 text-xl">{ratings.negative}</div>
                    <div className="text-sm text-gray-700">Negative</div>
                  </div>
                </div>
              </div>

              {/* Detailed Seller Ratings Section */}
              <div className="mb-6 pt-2">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Detailed seller ratings</h3>
                <p className="text-sm text-gray-600 mb-4">Average for the last 12 months</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Accurate description</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(detailedRatings.accurateDescription / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800">{detailedRatings.accurateDescription.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Reasonable shipping cost</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(detailedRatings.shippingCost / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800">{detailedRatings.shippingCost.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Shipping speed</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(detailedRatings.shippingSpeed / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800">{detailedRatings.shippingSpeed.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Communication</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(detailedRatings.communication / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800">{detailedRatings.communication.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feedback Comments */}
            <div className="w-full md:w-2/3 border-l-0 md:border-l border-gray-200 md:pl-4 mt-4 md:mt-0">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Seller feedback ({ratings.positive + ratings.neutral + ratings.negative})
              </h3>

              <div className="space-y-3">
                {feedbackComments.slice(0, 5).map((comment, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-center mb-1">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${comment.rating === 'positive' ? 'bg-green-100 text-green-600' :
                          comment.rating === 'neutral' ? 'bg-gray-100 text-gray-600' :
                            'bg-red-100 text-red-600'
                        }`}>
                        {comment.rating === 'positive' ? '+' :
                          comment.rating === 'neutral' ? '0' : '-'}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{comment.user}</span>
                      <span className="text-xs text-gray-500 ml-2">({comment.date})</span>
                      {comment.verified && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadImage}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Download Feedback Image
      </button>
    </div>
  );
};

export default FeedbackPreview;
