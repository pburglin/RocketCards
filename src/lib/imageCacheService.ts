// Image caching service for aggressive caching of AI-generated images
// This service provides caching mechanisms to reduce API calls and improve performance
import { localImageService } from './localImageService'

class ImageCacheService {
  private cache: Map<string, string> = new Map()
  private pendingRequests: Map<string, Promise<string>> = new Map()
  private failedRequests: Map<string, number> = new Map() // URL -> timestamp of failure
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  private readonly FAILED_REQUEST_BACKOFF = 5 * 60 * 1000 // 5 minutes backoff for failed requests
  private readonly MAX_RETRY_ATTEMPTS = 3
  private readonly RETRY_DELAY_BASE = 1000 // 1 second base delay

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

  // Check if a request has failed recently and implement exponential backoff
  private isFailedRequest(url: string): boolean {
    const failureTime = this.failedRequests.get(url)
    if (!failureTime) return false
    
    const timeSinceFailure = Date.now() - failureTime
    return timeSinceFailure < this.FAILED_REQUEST_BACKOFF
  }

  // Get retry delay with exponential backoff
  private getRetryDelay(attempt: number): number {
    return Math.min(this.RETRY_DELAY_BASE * Math.pow(2, attempt), 30000) // Max 30 seconds
  }

  // Mark a request as failed with retry tracking
  private markFailedRequest(url: string, attempt: number = 1): void {
    this.failedRequests.set(url, Date.now())
    
    // Remove failed request after backoff period
    setTimeout(() => {
      this.failedRequests.delete(url)
    }, this.FAILED_REQUEST_BACKOFF)
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
    
    // Remove from failed requests if it was previously failed
    this.failedRequests.delete(url)
  }

  // Preload images in background with better error handling and retry logic
  public preloadImage(url: string, attempt: number = 1): Promise<boolean> {
    return new Promise((resolve) => {
      // Skip if this request has failed recently
      if (this.isFailedRequest(url) && attempt === 1) {
        resolve(false)
        return
      }
      
      const img = new Image()
      
      // Set timeout for image loading to prevent hanging
      const timeout = setTimeout(() => {
        img.onload = null
        img.onerror = null
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          // Retry with exponential backoff
          const delay = this.getRetryDelay(attempt);
          new Promise(resolve => setTimeout(resolve, delay)).then(async () => {
            const success = await this.preloadImage(url, attempt + 1)
            resolve(success)
          })
        } else {
          this.markFailedRequest(url, attempt)
          resolve(false)
        }
      }, 10000) // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeout)
        this.cacheImage(url)
        resolve(true)
      }
      
      img.onerror = async () => {
        clearTimeout(timeout)
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          // Retry with exponential backoff
          const delay = this.getRetryDelay(attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          const success = await this.preloadImage(url, attempt + 1)
          resolve(success)
        } else {
          this.markFailedRequest(url, attempt)
          resolve(false) // Resolve with false to indicate failure
        }
      }
      
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

    // Skip if this request has failed recently
    if (this.isFailedRequest(url)) {
      throw new Error(`Image request failed recently: ${url}`)
    }

    // Create new request promise
    const requestPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const success = await this.preloadImage(url)
        this.pendingRequests.delete(url)
        
        if (success) {
          this.cacheImage(url)
          resolve(url)
        } else {
          reject(new Error(`Failed to load image: ${url}`))
        }
      } catch (error) {
        this.pendingRequests.delete(url)
        this.markFailedRequest(url)
        reject(error)
      }
    })

    this.pendingRequests.set(url, requestPromise)
    return await requestPromise
  }

  // Get card image with local fallback - checks local images first, then cache, then external
  public async getCardImageUrl(cardId: string, description: string, width: number = 256, height: number = 256): Promise<string> {
    // First check if local image exists
    const localImagePath = await localImageService.checkLocalImage(cardId)
    if (localImagePath) {
      this.cacheImage(localImagePath)
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

    // Skip if this request has failed recently
    if (this.isFailedRequest(pollinationsUrl)) {
      // Return a default fallback image or throw error
      return pollinationsUrl
    }

    // Create new request promise
    const requestPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const success = await this.preloadImage(pollinationsUrl)
        this.pendingRequests.delete(pollinationsUrl)
        
        if (success) {
          this.cacheImage(pollinationsUrl)
          resolve(pollinationsUrl)
        } else {
          // Return the URL even if preload failed, let the browser handle it
          resolve(pollinationsUrl)
        }
      } catch (error) {
        this.pendingRequests.delete(pollinationsUrl)
        this.markFailedRequest(pollinationsUrl)
        // Still return the URL as fallback
        resolve(pollinationsUrl)
      }
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
  public getCacheStats(): { size: number; pending: number; failed: number } {
    return {
      size: this.cache.size,
      pending: this.pendingRequests.size,
      failed: this.failedRequests.size
    }
  }

  // Clear all cache
  public clearAll(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    this.failedRequests.clear()
  }
  
  // Clear failed requests
  public clearFailedRequests(): void {
    this.failedRequests.clear()
  }
  
  // Get failed requests with timestamps
  public getFailedRequests(): Map<string, number> {
    return new Map(this.failedRequests)
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService()

// Auto-clear expired entries periodically
setInterval(() => {
  imageCacheService.clearExpired()
}, 60 * 60 * 1000) // Check every hour