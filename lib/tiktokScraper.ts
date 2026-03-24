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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      console.error(`Failed to fetch TikTok URL: ${url}, status: ${res.status}`);
      return null;
    }

    const html = await res.text();

    // Look for __UNIVERSAL_DATA_FOR_REHYDRATION__ (Current most reliable format)
    const universalMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
    if (universalMatch) {
      try {
        const data = JSON.parse(universalMatch[1]);
        
        // Use a recursive search to find any object that looks like stats
        let foundStats: any = null;
        const findStatsDeep = (obj: any): void => {
          if (foundStats || !obj || typeof obj !== 'object') return;
          if (obj.playCount !== undefined && obj.diggCount !== undefined) {
            foundStats = obj;
            return;
          }
          for (const key in obj) {
            findStatsDeep(obj[key]);
            if (foundStats) return;
          }
        };

        findStatsDeep(data.__DEFAULT_SCOPE__);

        if (foundStats) {
          return {
            views: parseInt(foundStats.playCount || 0, 10),
            likes: parseInt(foundStats.diggCount || 0, 10),
            comments: parseInt(foundStats.commentCount || 0, 10),
            bookmarks: parseInt(foundStats.collectCount || 0, 10),
            shares: parseInt(foundStats.shareCount || 0, 10)
          };
        }
      } catch (e) {
        console.error("Failed to parse UNIVERSAL_DATA");
      }
    }

    // Fallback: Look for SIGI_STATE (older format)
    const sigiMatch = html.match(/window\["SIGI_STATE"\]=(.*?);window/);
    if (sigiMatch) {
      try {
        const data = JSON.parse(sigiMatch[1]);
        const videoId = Object.keys(data.ItemModule)[0];
        const stats = data.ItemModule[videoId].stats;
        if (stats) {
          return {
            views: parseInt(stats.playCount || 0, 10),
            likes: parseInt(stats.diggCount || 0, 10),
            comments: parseInt(stats.commentCount || 0, 10),
            bookmarks: parseInt(stats.collectCount || 0, 10),
            shares: parseInt(stats.shareCount || 0, 10)
          };
        }
      } catch (e) {
        console.error("Failed to parse SIGI_STATE");
      }
    }

    console.error("Could not find stats in HTML for URL:", url);
    return null;
  } catch (error) {
    console.error("Error scraping TikTok stats:", error);
    return null;
  }
}
