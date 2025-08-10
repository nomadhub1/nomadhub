const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract direct image URL from a webpage (Pexels, Unsplash, etc.)
 * Returns direct image URL if found, else returns original URL.
 */
async function extractDirectImageUrl(url) {
  try {
    // Only process known image hosts
    if (/pexels\.com\/photo\//.test(url)) {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      // Pexels OpenGraph image
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) return ogImage;
      // Fallback: look for main image
      const mainImg = $('img[alt][src]').first().attr('src');
      if (mainImg) return mainImg;
    }
    if (/unsplash\.com\/photos\//.test(url)) {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) return ogImage;
    }
    // Add more hosts as needed
    // If already a direct image URL, return as is
    if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)) return url;
    // Otherwise, return original URL
    return url;
  } catch (err) {
    console.error('extractDirectImageUrl error:', err);
    return url;
  }
}

module.exports = { extractDirectImageUrl };
