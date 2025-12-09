// lib/sitemap-cache.ts
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'sitemap-homestays.json');

export interface CachedHomestay {
  id: number;
  name: string;
  address: string;
  status: string;
  updatedAt: string;
}

/**
 * Sitemap cache for storing homestay data incrementally
 * This allows admin to sync homestays gradually through the UI
 */
class SitemapCache {
  private ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  /**
   * Add or update homestays in the cache
   */
  upsertHomestays(homestays: CachedHomestay[]): void {
    try {
      this.ensureCacheDir();

      // Read existing cache
      const existing = this.getAllHomestays();
      const existingMap = new Map(existing.map(h => [h.id, h]));

      // Merge new homestays
      homestays.forEach(h => {
        existingMap.set(h.id, h);
      });

      // Write back to file
      const updated = Array.from(existingMap.values());
      fs.writeFileSync(CACHE_FILE, JSON.stringify(updated, null, 2), 'utf-8');

      console.log(`[SitemapCache] Updated cache with ${homestays.length} homestays. Total: ${updated.length}`);
    } catch (error) {
      console.error('[SitemapCache] Error upserting homestays:', error);
    }
  }

  /**
   * Get all cached homestays
   */
  getAllHomestays(): CachedHomestay[] {
    try {
      if (!fs.existsSync(CACHE_FILE)) {
        return [];
      }

      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      const data = JSON.parse(content);

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[SitemapCache] Error reading cache:', error);
      return [];
    }
  }

  /**
   * Get only APPROVED homestays
   */
  getApprovedHomestays(): CachedHomestay[] {
    return this.getAllHomestays().filter(h => h.status === 'APPROVED');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const all = this.getAllHomestays();
    const approved = all.filter(h => h.status === 'APPROVED');

    return {
      total: all.length,
      approved: approved.length,
      lastUpdate: fs.existsSync(CACHE_FILE)
        ? fs.statSync(CACHE_FILE).mtime
        : null,
    };
  }

  /**
   * Clear the cache
   */
  clear(): void {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
        console.log('[SitemapCache] Cache cleared');
      }
    } catch (error) {
      console.error('[SitemapCache] Error clearing cache:', error);
    }
  }
}

export const sitemapCache = new SitemapCache();
