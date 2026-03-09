async function testTikTokScrape() {
  const url = "https://www.tiktok.com/@tiktok/video/7108933211516701994";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const html = await res.text();
    console.log("Status:", res.status);

    // Look for SIGI_STATE or __UNIVERSAL_DATA_FOR_REHYDRATION__
    const sigiMatch = html.match(/window\["SIGI_STATE"\]=(.*?);window/);
    if (sigiMatch) {
      console.log("Found SIGI_STATE!");
      const data = JSON.parse(sigiMatch[1]);
      const videoId = Object.keys(data.ItemModule)[0];
      const stats = data.ItemModule[videoId].stats;
      console.log("Stats:", stats);
      return;
    }

    const universalMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
    if (universalMatch) {
      console.log("Found UNIVERSAL_DATA!");
      const data = JSON.parse(universalMatch[1]);
      const stats = data.__DEFAULT_SCOPE__["webapp.video-detail"].itemInfo.itemStruct.stats;
      console.log("Stats:", stats);
      return;
    }

    console.log("Could not find stats in HTML. Length:", html.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
testTikTokScrape();
