// Image preloading service for efficient card image loading
// This service provides advanced preloading strategies to reduce image loading times

class ImagePreloader {
  private readonly PRELOAD_BATCH_SIZE = 6
  private readonly PRELOAD_DELAY = 50
  private readonly HIGH_PRIORITY_BATCH_SIZE = 3
  private readonly HIGH_PRIORITY_DELAY = 25
  private readonly PROGRESSIVE_LOADING_ENABLED = true
  
  // Preload images with priority levels
  public async preloadImagesWithPriority(
    images: { url: string; priority: 'high' | 'medium' | 'low'; width?: number; height?: number }[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ success: number; failed: number }> {
    // Sort by priority: high first, then medium, then low
    const sortedImages = [...images].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    
    let successCount = 0
    let failedCount = 0
    let loadedCount = 0
    const total = sortedImages.length
    
    // Process high priority images first (smaller batches, faster)
    const highPriorityImages = sortedImages.filter(img => img.priority === 'high')
    const otherImages = sortedImages.filter(img => img.priority !== 'high')
    
    // Load high priority images
    if (highPriorityImages.length > 0) {
      const highPriorityResults = await this.preloadBatchWithDelay(
        highPriorityImages,
        this.HIGH_PRIORITY_BATCH_SIZE,
        this.HIGH_PRIORITY_DELAY,
        (loaded) => {
          loadedCount = loaded
          if (onProgress) {
            onProgress(loaded, total)
          }
        }
      )
      successCount += highPriorityResults.success
      failedCount += highPriorityResults.failed
    }
    
    // Load remaining images
    if (otherImages.length > 0) {
      const otherResults = await this.preloadBatchWithDelay(
        otherImages,
        this.PRELOAD_BATCH_SIZE,
        this.PRELOAD_DELAY,
        (loaded) => {
          if (onProgress) {
            onProgress(loadedCount + loaded, total)
          }
        }
      )
      successCount += otherResults.success
      failedCount += otherResults.failed
    }
    
    return { success: successCount, failed: failedCount }
  }
  
  // Preload images in batches with delay
  private async preloadBatchWithDelay(
    images: { url: string; priority: 'high' | 'medium' | 'low'; width?: number; height?: number }[],
    batchSize: number,
    delay: number,
    onProgress?: (loaded: number) => void
  ): Promise<{ success: number; failed: number }> {
    let successCount = 0
    let failedCount = 0
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize)
      
      // Load batch concurrently
      const batchResults = await Promise.all(
        batch.map(async (image) => {
          try {
            await this.preloadImage(image.url, image.width, image.height)
            successCount++
            return true
          } catch (error) {
            failedCount++
            return false
          }
        })
      )
      
      // Report progress
      if (onProgress) {
        onProgress(i + batch.length)
      }
      
      // Delay between batches to avoid overwhelming the browser
      if (i + batchSize < images.length) {
        await this.delay(delay)
      }
    }
    
    return { success: successCount, failed: failedCount }
  }
  
  // Preload a single image with progressive loading support
  private preloadImage(url: string, width?: number, height?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Enable progressive loading if supported
      if (this.PROGRESSIVE_LOADING_ENABLED && url.includes('pollinations.ai') && width && height) {
        // First load a low-quality version
        const lowQualityUrl = this.getLowQualityUrl(url, width, height)
        const lowQualityImg = new Image()
        
        lowQualityImg.onload = () => {
          // Low quality loaded, now load full quality
          img.src = url
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load full quality image: ${url}`))
        }
        
        lowQualityImg.onerror = () => {
          // If low quality fails, try full quality directly
          img.src = url
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        }
        
        lowQualityImg.src = lowQualityUrl
      } else {
        img.src = url
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      }
    })
  }
  
  // Generate progressive image URL with lower quality for initial load
  private getProgressiveImageUrl(url: string, width: number, height: number): string {
    // For progressive loading, first load a smaller version
    const smallWidth = Math.max(64, Math.floor(width / 4))
    const smallHeight = Math.max(64, Math.floor(height / 4))
    
    if (url.includes('pollinations.ai')) {
      // Modify the pollinations URL to request smaller size first
      return url.replace(/width=\d+/, `width=${smallWidth}`)
                .replace(/height=\d+/, `height=${smallHeight}`)
    }
    
    return url
  }
  
  // Preload collection images (high priority)
  public async preloadCollectionImages(collections: any[]): Promise<void> {
    const collectionImages = collections.map(collection => ({
      url: `/images/cards/${collection.id}.webp`,
      priority: 'high' as const,
      width: 128,
      height: 128
    }))
    
    await this.preloadImagesWithPriority(collectionImages)
  }
  
  // Preload card images for a collection
  public async preloadCollectionCardImages(collection: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    const cardImages = collection.cards.map((card: any) => ({
      url: `/images/cards/${card.id}.webp`,
      priority,
      width: 256,
      height: 256
    }))
    
    await this.preloadImagesWithPriority(cardImages)
  }
  
  // Preload images with progressive enhancement
  public async preloadImagesProgressive(
    images: { url: string; priority: 'high' | 'medium' | 'low'; width?: number; height?: number }[]
  ): Promise<{ success: number; failed: number }> {
    let successCount = 0
    let failedCount = 0
    
    // Process images with progressive loading
    for (const image of images) {
      try {
        await this.preloadImage(image.url, image.width, image.height)
        successCount++
      } catch (error) {
        failedCount++
      }
    }
    
    return {
      success: successCount,
      failed: failedCount
    }
  }
  
  // Get low quality URL for progressive loading
  private getLowQualityUrl(url: string, width?: number, height?: number): string {
    if (url.includes('pollinations.ai') && width && height) {
      const lowWidth = Math.max(64, Math.floor(width / 4))
      const lowHeight = Math.max(64, Math.floor(height / 4))
      return url.replace(/width=\d+/, `width=${lowWidth}`)
                .replace(/height=\d+/, `height=${lowHeight}`)
    }
    return url
  }
  
  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader()