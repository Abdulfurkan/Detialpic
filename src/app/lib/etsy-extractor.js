/**
 * Utility functions for extracting product information from Etsy titles and descriptions
 */

// Dictionaries for product attribute extraction
const GEMSTONE_NAMES = [
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst', 'Topaz', 'Opal', 'Garnet', 
  'Aquamarine', 'Citrine', 'Peridot', 'Tanzanite', 'Turquoise', 'Moonstone', 'Jade',
  'Morganite', 'Alexandrite', 'Lapis Lazuli', 'Onyx', 'Pearl', 'Quartz', 'Agate',
  'Jasper', 'Zircon', 'Spinel', 'Tourmaline', 'Labradorite', 'Chrysoprase'
];

const METAL_TYPES = [
  'Sterling Silver', 'Silver', '925 Silver', '925', 'Gold', 'Yellow Gold', 'White Gold', 
  'Rose Gold', '14K', '14k', '18K', '18k', '10K', '10k', 'Platinum', 'Palladium',
  'Titanium', 'Stainless Steel', 'Brass', 'Copper', 'Bronze', 'Tungsten'
];

const MATERIALS = [
  'Leather', 'Cotton', 'Linen', 'Silk', 'Wool', 'Canvas', 'Wood', 'Ceramic', 'Glass',
  'Plastic', 'Acrylic', 'Resin', 'Paper', 'Cardstock', 'Vinyl', 'Felt', 'Velvet',
  'Satin', 'Polyester', 'Nylon', 'Metal', 'Stone', 'Crystal', 'Beads'
];

const COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Black', 'White',
  'Gray', 'Brown', 'Teal', 'Turquoise', 'Navy', 'Burgundy', 'Maroon', 'Gold', 'Silver',
  'Bronze', 'Copper', 'Ivory', 'Cream', 'Beige', 'Tan', 'Coral', 'Mint', 'Olive',
  'Lavender', 'Violet', 'Indigo', 'Magenta', 'Amber', 'Emerald', 'Ruby', 'Sapphire'
];

const PRODUCT_TYPES = [
  'Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant', 'Brooch', 'Anklet', 'Cufflinks',
  'Tiara', 'Crown', 'Charm', 'Bangle', 'Chain', 'Locket', 'Choker', 'Stud', 'Hoop',
  'Dangle', 'Drop', 'Chandelier', 'Clip-on', 'Leverback', 'Post', 'Huggie', 'Climber',
  'Jacket', 'Threader', 'Cuff', 'Wrap', 'Bolo', 'Collar', 'Engagement', 'Wedding',
  'Promise', 'Eternity', 'Solitaire', 'Halo', 'Cluster', 'Cocktail', 'Statement',
  'Signet', 'Band', 'Art', 'Print', 'Painting', 'Sculpture', 'Pottery', 'Decor',
  'Wall Art', 'Canvas', 'Poster', 'Photo', 'Picture', 'Frame', 'Sign', 'Plaque',
  'Ornament', 'Figurine', 'Statue', 'Doll', 'Toy', 'Game', 'Puzzle', 'Book', 'Journal',
  'Notebook', 'Planner', 'Calendar', 'Card', 'Invitation', 'Stationery', 'Pen', 'Pencil',
  'Marker', 'Crayon', 'Paint', 'Brush', 'Canvas', 'Fabric', 'Yarn', 'Thread', 'Needle',
  'Hook', 'Scissors', 'Ruler', 'Tape', 'Glue', 'Adhesive', 'Sticker', 'Label', 'Tag',
  'Ribbon', 'Bow', 'Button', 'Zipper', 'Clasp', 'Hook', 'Eye', 'Pin', 'Needle', 'Thimble',
  'Clothing', 'Shirt', 'T-shirt', 'Blouse', 'Top', 'Sweater', 'Cardigan', 'Jacket',
  'Coat', 'Vest', 'Dress', 'Skirt', 'Pants', 'Jeans', 'Shorts', 'Leggings', 'Tights',
  'Socks', 'Shoes', 'Boots', 'Sandals', 'Slippers', 'Hat', 'Cap', 'Beanie', 'Scarf',
  'Gloves', 'Mittens', 'Bag', 'Purse', 'Handbag', 'Tote', 'Backpack', 'Wallet', 'Clutch',
  'Pouch', 'Case', 'Cover', 'Sleeve', 'Holder', 'Stand', 'Rack', 'Shelf', 'Basket',
  'Box', 'Container', 'Jar', 'Bottle', 'Vase', 'Planter', 'Pot', 'Bowl', 'Plate', 'Cup',
  'Mug', 'Glass', 'Tumbler', 'Coaster', 'Placemat', 'Napkin', 'Towel', 'Blanket', 'Quilt',
  'Pillow', 'Cushion', 'Rug', 'Mat', 'Curtain', 'Blind', 'Shade', 'Lamp', 'Light', 'Candle',
  'Holder', 'Lantern', 'Clock', 'Watch', 'Timer', 'Alarm', 'Mirror', 'Furniture', 'Chair',
  'Table', 'Desk', 'Stool', 'Bench', 'Sofa', 'Couch', 'Bed', 'Headboard', 'Footboard',
  'Nightstand', 'Dresser', 'Chest', 'Cabinet', 'Bookcase', 'Bookshelf', 'Shelving'
];

// Patterns for extracting specific attributes
const SIZE_PATTERN = /(\d+(\.\d+)?\s*(mm|cm|in|inch|inches|"|ft|foot|feet|'|yard|yd|m|meter|metre))/gi;
const DIMENSION_PATTERN = /(\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?(\s*[xX×]\s*\d+(\.\d+)?)?(\s*(mm|cm|in|inch|inches|"|ft|foot|feet|'|yard|yd|m|meter|metre))?)/gi;
const WEIGHT_PATTERN = /(\d+(\.\d+)?\s*(g|gram|grams|kg|kilogram|kilograms|oz|ounce|ounces|lb|lbs|pound|pounds))/gi;
const CARAT_PATTERN = /(\d+(\.\d+)?\s*(ct|carat|carats))/gi;
const RING_SIZE_PATTERN = /(size\s*\d+(\.\d+)?)|(\d+(\.\d+)?\s*size)/gi;

/**
 * Extract product information from title and description
 * @param {string} title - Product title
 * @param {string} description - Product description
 * @returns {Object} - Extracted product details
 */
export const extractProductInfo = (title, description) => {
  const productDetails = {};
  const combinedText = `${title} ${description}`;
  
  // Extract product name (use title as is)
  productDetails['Product Name'] = title.trim();
  
  // Extract gemstone information
  const gemstone = extractFromDictionary(combinedText, GEMSTONE_NAMES);
  if (gemstone) {
    productDetails['Gemstone Name'] = gemstone;
  }
  
  // Extract metal type
  const metal = extractFromDictionary(combinedText, METAL_TYPES);
  if (metal) {
    productDetails['Metal'] = metal;
  }
  
  // Extract material
  const material = extractFromDictionary(combinedText, MATERIALS);
  if (material && material !== metal) {
    productDetails['Material'] = material;
  }
  
  // Extract product type
  const productType = extractFromDictionary(combinedText, PRODUCT_TYPES);
  if (productType) {
    productDetails['Type'] = productType;
  }
  
  // Extract color
  const color = extractFromDictionary(combinedText, COLORS);
  if (color) {
    productDetails['Color'] = color;
  }
  
  // Extract size information
  const size = extractPattern(combinedText, SIZE_PATTERN);
  if (size) {
    productDetails['Size'] = size;
  }
  
  // Extract dimensions
  const dimensions = extractPattern(combinedText, DIMENSION_PATTERN);
  if (dimensions) {
    productDetails['Dimensions'] = dimensions;
  }
  
  // Extract weight
  const weight = extractPattern(combinedText, WEIGHT_PATTERN);
  if (weight) {
    productDetails['Weight'] = weight;
  }
  
  // Extract carat weight
  const caratWeight = extractPattern(combinedText, CARAT_PATTERN);
  if (caratWeight) {
    productDetails['Carat Weight'] = caratWeight;
  }
  
  // Extract ring size
  const ringSize = extractPattern(combinedText, RING_SIZE_PATTERN);
  if (ringSize) {
    productDetails['Ring Size'] = ringSize.replace(/size/i, '').trim();
  }
  
  // Extract key-value pairs from description
  const extractedPairs = extractKeyValuePairs(description);
  Object.entries(extractedPairs).forEach(([key, value]) => {
    if (!productDetails[key]) {
      productDetails[key] = value;
    }
  });
  
  // Extract from bullet points if present
  const bulletPoints = extractBulletPoints(description);
  bulletPoints.forEach(point => {
    const colonSplit = point.split(':');
    if (colonSplit.length === 2) {
      const key = colonSplit[0].trim();
      const value = colonSplit[1].trim();
      if (key && value && !productDetails[key]) {
        productDetails[key] = value;
      }
    }
  });
  
  return productDetails;
};

/**
 * Extract a value from a dictionary of terms
 * @param {string} text - Text to search in
 * @param {Array} dictionary - Array of terms to look for
 * @returns {string|null} - Found term or null
 */
const extractFromDictionary = (text, dictionary) => {
  const lowerText = text.toLowerCase();
  
  // Sort dictionary by length (descending) to match longer terms first
  const sortedDict = [...dictionary].sort((a, b) => b.length - a.length);
  
  for (const term of sortedDict) {
    if (lowerText.includes(term.toLowerCase())) {
      return term;
    }
  }
  
  return null;
};

/**
 * Extract a pattern from text
 * @param {string} text - Text to search in
 * @param {RegExp} pattern - Regular expression pattern
 * @returns {string|null} - Matched text or null
 */
const extractPattern = (text, pattern) => {
  const matches = text.match(pattern);
  return matches ? matches[0] : null;
};

/**
 * Extract key-value pairs from text
 * @param {string} text - Text to extract from
 * @returns {Object} - Extracted key-value pairs
 */
const extractKeyValuePairs = (text) => {
  const pairs = {};
  
  // Look for patterns like "Key: Value" or "Key - Value"
  const lines = text.split(/[\n\r]+/);
  
  lines.forEach(line => {
    // Check for "Key: Value" pattern
    const colonMatch = line.match(/([^:]+):\s*(.+)/);
    if (colonMatch) {
      const key = colonMatch[1].trim();
      const value = colonMatch[2].trim();
      if (key && value) {
        pairs[key] = value;
      }
      return;
    }
    
    // Check for "Key - Value" pattern
    const dashMatch = line.match(/([^-]+)\s*-\s*(.+)/);
    if (dashMatch) {
      const key = dashMatch[1].trim();
      const value = dashMatch[2].trim();
      if (key && value) {
        pairs[key] = value;
      }
      return;
    }
  });
  
  return pairs;
};

/**
 * Extract bullet points from text
 * @param {string} text - Text to extract from
 * @returns {Array} - Array of bullet points
 */
const extractBulletPoints = (text) => {
  const bulletPoints = [];
  
  // Match bullet points with various bullet characters
  const bulletRegex = /[•\-\*\✓\✔\➤\➢\➣\➜\➝\➞\➟\➠\➡\➢\➣\➤\➥\➦\➧\➨\➩\➪\➫\➬\➭\➮\➯\➱\➲\➳\➴\➵\➶\➷\➸\➹\➺\➻\➼\➽\➾]\s*(.+)/g;
  
  let match;
  while ((match = bulletRegex.exec(text)) !== null) {
    bulletPoints.push(match[1].trim());
  }
  
  return bulletPoints;
};

export default extractProductInfo;
