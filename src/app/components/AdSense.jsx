'use client';

import React, { useEffect } from 'react';

const AdSense = ({ 
  client = 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your AdSense Publisher ID
  slot, 
  format = 'auto',
  responsive = true,
  style = { display: 'block' }
}) => {
  useEffect(() => {
    // Load AdSense script if it hasn't been loaded yet
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.adClient = client;
      document.head.appendChild(script);
    }

    // Push the ad to AdSense when the component mounts
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [client]);

  // Determine the className based on responsive prop
  const className = responsive ? 'adsbygoogle' : '';

  return (
    <div className="ad-container my-4 text-center">
      {/* Ad disclaimer as per Google policy */}
      <p className="text-xs text-gray-500 mb-1">Advertisement</p>
      
      <ins
        className={className}
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSense;
