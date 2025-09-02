// Image caching service for aggressive caching of AI-generated images
// This service provides caching mechanisms to reduce API calls and improve performance
import { localImageService } from './localImageService'

class ImageCacheService {
  private cache: Map<string, string> = new Map()
  private pendingRequests: Map<string, Promise<string>> = new Map()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  // Generate cache key from image URL
  private generateCacheKey(url: string): string {
    return btoa(url) // Base64 encode the URL for a clean cache key
  }

  // Check if image is in cache and still valid
  public isCached(url: string): boolean {
    const cacheKey = this.generateCacheKey(url)
    const cached = this.cache.get(cacheKey)
    
    if (!cached) return false
    
    // Check if cache is still valid (within 24 hours)
    try {
      const [timestamp, imageUrl] = cached.split('|')
      const age = Date.now() - parseInt(timestamp)
      return age < this.CACHE_DURATION && imageUrl === url
    } catch {
      // If parsing fails, remove invalid cache entry
      this.cache.delete(cacheKey)
      return false
    }
  }

  // Get cached image URL
  public getCachedImage(url: string): string | null {
    const cacheKey = this.generateCacheKey(url)
    const cached = this.cache.get(cacheKey)
    
    if (!cached) return null
    
    try {
      const [timestamp, imageUrl] = cached.split('|')
      const age = Date.now() - parseInt(timestamp)
      
      if (age < this.CACHE_DURATION) {
        return imageUrl
      } else {
        // Cache expired, remove it
        this.cache.delete(cacheKey)
        return null
      }
    } catch {
      // If parsing fails, remove invalid cache entry
      this.cache.delete(cacheKey)
      return null
    }
  }

  // Cache an image URL
  public cacheImage(url: string): void {
    const cacheKey = this.generateCacheKey(url)
    const cacheEntry = `${Date.now()}|${url}`
    this.cache.set(cacheKey, cacheEntry)
  }

  // Preload images in background
  public preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve() // Still resolve on error to avoid blocking
      img.src = url
    })
  }

  // Get image with caching - returns cached version if available, otherwise fetches and caches
  public async getCachedImageUrl(url: string): Promise<string> {
    // Check if already cached
    const cachedUrl = this.getCachedImage(url)
    if (cachedUrl) {
      return cachedUrl
    }

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(url)
    if (pendingRequest) {
      return await pendingRequest
    }

    // Create new request promise
    const requestPromise = new Promise<string>((resolve) => {
      // For external images, we just cache the URL itself
      // In a real implementation, you might want to cache the actual image data
      this.cacheImage(url)
      this.preloadImage(url).then(() => {
        this.pendingRequests.delete(url)
        resolve(url)
      })
    })

    this.pendingRequests.set(url, requestPromise)
    return await requestPromise
  }

  // Get card image with local fallback - checks local images first, then cache, then external
  public async getCardImageUrl(cardId: string, description: string, width: number = 256, height: number = 256): Promise<string> {
    // First check if local image exists
    const localImagePath = await localImageService.checkLocalImage(cardId)
    if (localImagePath) {
      return localImagePath
    }

    // Generate pollinations.ai URL
    const pollinationsUrl = localImageService.generatePollinationsUrl(description, width, height)
    
    // Check if already cached
    const cachedUrl = this.getCachedImage(pollinationsUrl)
    if (cachedUrl) {
      return cachedUrl
    }

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(pollinationsUrl)
    if (pendingRequest) {
      return await pendingRequest
    }

    // Create new request promise
    const requestPromise = new Promise<string>((resolve) => {
      this.cacheImage(pollinationsUrl)
      this.preloadImage(pollinationsUrl).then(() => {
        this.pendingRequests.delete(pollinationsUrl)
        resolve(pollinationsUrl)
      })
    })

    this.pendingRequests.set(pollinationsUrl, requestPromise)
    return await requestPromise
  }

  // Clear expired cache entries
  public clearExpired(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      try {
        const [timestamp] = value.split('|')
        const age = now - parseInt(timestamp)
        if (age >= this.CACHE_DURATION) {
          this.cache.delete(key)
        }
      } catch {
        // Remove invalid cache entries
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  public getCacheStats(): { size: number; pending: number } {
    return {
      size: this.cache.size,
      pending: this.pendingRequests.size
    }
  }

  // Clear all cache
  public clearAll(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService()

// Auto-clear expired entries periodically
setInterval(() => {
  imageCacheService.clearExpired()
}, 60 * 60 * 1000) // Check every hour