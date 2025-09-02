// Card image utility functions
// Provides consistent image loading with local fallback across the application

import { imageCacheService } from './imageCacheService'

// Get card image URL with local fallback
export async function getCardImageUrl(cardId: string, description: string, width: number = 256, height: number = 256): Promise<string> {
  return await imageCacheService.getCardImageUrl(cardId, description, width, height)
}

// Get collection image URL with local fallback
export async function getCollectionImageUrl(collectionId: string, width: number = 128, height: number = 128): Promise<string> {
  // For collections, we use the collection ID directly for local image lookup
  return await imageCacheService.getCardImageUrl(collectionId, collectionId, width, height)
}

// Preload card images in background
export async function preloadCardImages(cards: { id: string; description: string }[]): Promise<void> {
  // Preload in batches to avoid overwhelming the browser
  const batchSize = 3
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize)
    await Promise.all(
      batch.map(card => getCardImageUrl(card.id, card.description, 128, 128))
    )
    // Small delay between batches
    if (i + batchSize < cards.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}