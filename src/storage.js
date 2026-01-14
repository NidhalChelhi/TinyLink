// In-memory storage for URLs
class URLStorage {
  constructor() {
    this.urls = new Map(); // shortCode -> { originalUrl, createdAt, clicks }
  }

  save(shortCode, originalUrl) {
    this.urls.set(shortCode, {
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
    });
    return true;
  }

  get(shortCode) {
    return this.urls.get(shortCode);
  }

  incrementClicks(shortCode) {
    const urlData = this.urls.get(shortCode);
    if (urlData) {
      urlData.clicks++;
      return true;
    }
    return false;
  }

  exists(shortCode) {
    return this.urls.has(shortCode);
  }

  getAll() {
    return Array.from(this.urls.entries()).map(([code, data]) => ({
      shortCode: code,
      ...data,
    }));
  }
}

module.exports = new URLStorage();
