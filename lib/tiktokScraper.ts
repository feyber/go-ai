export interface TikTokStats {
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
}

export async function scrapeTikTokStats(url: string): Promise<TikTokStats | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!res.ok) {
      console.error(`Failed to fetch TikTok URL: ${url}, status: ${res.status}`);
      return null;
    }

    const html = await res.text();

    // Look for SIGI_STATE (older format but sometimes still appears)
    const sigiMatch = html.match(/window\["SIGI_STATE"\]=(.*?);window/);
    if (sigiMatch) {
      try {
        const data = JSON.parse(sigiMatch[1]);
        const videoId = Object.keys(data.ItemModule)[0];
        const stats = data.ItemModule[videoId].stats;
        return {
          views: parseInt(stats.playCount || 0, 10),
          likes: parseInt(stats.diggCount || 0, 10),
          comments: parseInt(stats.commentCount || 0, 10),
          bookmarks: parseInt(stats.collectCount || 0, 10),
          shares: parseInt(stats.shareCount || 0, 10)
        };
      } catch (e) {
        console.error("Failed to parse SIGI_STATE");
      }
    }

    // Look for __UNIVERSAL_DATA_FOR_REHYDRATION__ (newer format)
    const universalMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
    if (universalMatch) {
      try {
        const data = JSON.parse(universalMatch[1]);
        // The structure can vary, typically under webapp.video-detail
        const itemInfo = data.__DEFAULT_SCOPE__["webapp.video-detail"]?.itemInfo?.itemStruct;
        if (itemInfo && itemInfo.stats) {
          const stats = itemInfo.stats;
          return {
            views: parseInt(stats.playCount || 0, 10),
            likes: parseInt(stats.diggCount || 0, 10),
            comments: parseInt(stats.commentCount || 0, 10),
            bookmarks: parseInt(stats.collectCount || 0, 10),
            shares: parseInt(stats.shareCount || 0, 10)
          };
        }
      } catch (e) {
        console.error("Failed to parse UNIVERSAL_DATA");
      }
    }

    console.error("Could not find stats in HTML for URL:", url);
    return null;
  } catch (error) {
    console.error("Error scraping TikTok stats:", error);
    return null;
  }
}
