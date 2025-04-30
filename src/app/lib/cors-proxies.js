/**
 * A collection of CORS proxies with fallback mechanism
 */

// List of available CORS proxies
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors.bridged.cc/'
];

/**
 * Fetches a URL through multiple CORS proxies with fallback
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - The response data
 */
export const fetchWithCorsProxy = async (url, options = {}) => {
  // Encode the URL for proxies that require it
  const encodedUrl = encodeURIComponent(url);
  let lastError = null;
  
  // Try each proxy in sequence until one works
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy.includes('?') ? 
        `${proxy}${encodedUrl}` : 
        `${proxy}${url}`;
      
      console.log(`Trying proxy: ${proxy} for URL: ${url}`);
      
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Proxy returned status ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Proxy ${proxy} failed:`, error);
      lastError = error;
      // Continue to the next proxy
    }
  }
  
  // If all proxies fail, throw the last error
  throw new Error(`All CORS proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

export default fetchWithCorsProxy;
