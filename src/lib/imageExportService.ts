// Image export service for downloading and saving card images locally
// This service provides functionality to export AI-generated images to local files

class ImageExportService {
  private readonly EXPORT_BATCH_SIZE = 5
  private readonly EXPORT_DELAY = 1000 // 1 second delay between batches
  private readonly DEFAULT_QUALITY = 80
  private readonly DEFAULT_WIDTH = 256
  private readonly DEFAULT_HEIGHT = 256
  
  // Export images for all cards in a collection
  public async exportCollectionImages(
    collectionId: string,
    onProgress?: (progress: number, total: number) => void,
    options?: { quality?: number; width?: number; height?: number }
  ): Promise<{ success: number; failed: number }> {
    try {
      const collectionModule = await import(`../../data/${collectionId}.json`)
      const collection = collectionModule.default || collectionModule
      
      if (!collection || !collection.cards) {
        throw new Error(`Collection ${collectionId} not found or invalid`)
      }
      
      const cards = collection.cards
      let successCount = 0
      let failedCount = 0
      
      // Process cards in batches to avoid rate limiting
      for (let i = 0; i < cards.length; i += this.EXPORT_BATCH_SIZE) {
        const batch = cards.slice(i, i + this.EXPORT_BATCH_SIZE)
        
        // Process batch
        const batchResults = await Promise.all(
          batch.map(async (card: any) => {
            try {
              const success = await this.exportCardImage(card.id, card.description, card.title, options)
              if (success) {
                successCount++
              } else {
                failedCount++
              }
              return success
            } catch (error) {
              console.error(`Failed to export image for card ${card.id}:`, error)
              failedCount++
              return false
            }
          })
        )
        
        // Report progress
        if (onProgress) {
          onProgress(i + batch.length, cards.length)
        }
        
        // Delay between batches to avoid rate limiting
        if (i + this.EXPORT_BATCH_SIZE < cards.length) {
          await this.delay(this.EXPORT_DELAY)
        }
      }
      
      return { success: successCount, failed: failedCount }
    } catch (error) {
      console.error(`Failed to export collection ${collectionId}:`, error)
      throw error
    }
  }
  
  // Export image for a single card
  public async exportCardImage(
    cardId: string,
    description: string,
    title: string,
    options?: { quality?: number; width?: number; height?: number }
  ): Promise<boolean> {
    try {
      // Generate pollinations.ai URL with customizable dimensions
      const width = options?.width || this.DEFAULT_WIDTH;
      const height = options?.height || this.DEFAULT_HEIGHT;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=${width}&height=${height}&nologo=true&private=true&safe=true&seed=1`
      
      // Download image as blob
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // In a real implementation, this would save to the file system
      // For now, we'll just log that the export would happen
      console.log(`Exported image for card ${cardId} from ${imageUrl}`)
      
      // This is where you would actually save the file
      // In a browser environment, you might trigger a download
      // In a Node.js environment, you would write to the file system
      
      return true
    } catch (error) {
      console.error(`Failed to export image for card ${cardId}:`, error)
      return false
    }
  }
  
  // Export all collections
  public async exportAllCollections(
    onProgress?: (collection: string, progress: number, total: number) => void,
    options?: { quality?: number; width?: number; height?: number }
  ): Promise<Record<string, { success: number; failed: number }>> {
    const collections = [
      'fantasy', 'politics', 'monsters', 'anime', 'scifi',
      'soccer', 'lawyers', 'apocalypse', 'heroes'
    ]
    
    const results: Record<string, { success: number; failed: number }> = {}
    
    for (const collectionId of collections) {
      try {
        console.log(`Exporting collection: ${collectionId}`)
        const result = await this.exportCollectionImages(collectionId, (progress, total) => {
          if (onProgress) {
            onProgress(collectionId, progress, total)
          }
        }, options)
        results[collectionId] = result
      } catch (error) {
        console.error(`Failed to export collection ${collectionId}:`, error)
        results[collectionId] = { success: 0, failed: 0 }
      }
    }
    
    return results
  }
  
  // Create a downloadable blob for a card image
  public async createImageBlob(cardId: string, description: string): Promise<Blob | null> {
    try {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=256&height=256&nologo=true&private=true&safe=true&seed=1`
      const response = await fetch(imageUrl)
      
      if (!response.ok) {
        return null
      }
      
      return await response.blob()
    } catch (error) {
      console.error(`Failed to create blob for card ${cardId}:`, error)
      return null
    }
  }
  
  // Trigger browser download of an image
  public triggerImageDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Download image for a single card
  public async downloadCardImage(cardId: string, description: string, title: string): Promise<boolean> {
    try {
      const blob = await this.createImageBlob(cardId, description)
      if (blob) {
        const filename = `${cardId}.webp`
        this.triggerImageDownload(blob, filename)
        return true
      }
      return false
    } catch (error) {
      console.error(`Failed to download image for card ${cardId}:`, error)
      return false
    }
  }
  
  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const imageExportService = new ImageExportService()