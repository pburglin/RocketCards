// Local image service for managing exported card images
// This service handles loading images from local storage first, then falls back to external sources

class LocalImageService {
  private readonly LOCAL_IMAGE_PATH = '/images/cards/'
  private readonly IMAGE_EXTENSION = '.webp'
  
  // Check if a local image exists for a given card ID
  public async checkLocalImage(cardId: string): Promise<string | null> {
    const imagePath = `${this.LOCAL_IMAGE_PATH}${cardId}${this.IMAGE_EXTENSION}`
    
    // Try to load the image directly - this is more reliable than HEAD request
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(imagePath);
      img.onerror = () => resolve(null);
      img.src = imagePath;
    });
  }
  
  // Get local image path for a card ID
  public getLocalImagePath(cardId: string): string {
    return `${this.LOCAL_IMAGE_PATH}${cardId}${this.IMAGE_EXTENSION}`
  }
  
  // Generate pollinations.ai URL for a card
  public generatePollinationsUrl(description: string, width: number = 256, height: number = 256): string {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=${width}&height=${height}&nologo=true&private=true&safe=true&seed=1`
  }
  
  // Get image URL with local fallback
  public async getImageUrlWithLocalFallback(
    cardId: string,
    description: string,
    width: number = 256,
    height: number = 256
  ): Promise<string> {
    // First check if local image exists using the reliable method
    const localImagePath = await this.checkLocalImage(cardId)
    if (localImagePath) {
      return localImagePath
    }
    
    // Fall back to pollinations.ai
    return this.generatePollinationsUrl(description, width, height)
  }
  
  // Export image data to local file (this would be called by admin tools)
  public async exportImageToFile(cardId: string, imageData: string): Promise<boolean> {
    try {
      // In a real implementation, this would save to the file system
      // For now, we'll just simulate the export process
      console.log(`Exporting image for card ${cardId} to local storage`)
      // This would typically involve a backend service or file system API
      return true
    } catch (error) {
      console.error(`Failed to export image for card ${cardId}:`, error)
      return false
    }
  }
}

// Export singleton instance
export const localImageService = new LocalImageService()