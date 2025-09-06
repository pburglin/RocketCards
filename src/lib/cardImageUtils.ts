// Card image utility functions
// Provides consistent image loading with local fallback across the application

import { imageCacheService } from './imageCacheService'
import { imagePreloader } from './imagePreloader'

// Get card image URL with local fallback and error handling
export async function getCardImageUrl(cardId: string, description: string, width: number = 256, height: number = 256): Promise<string> {
  try {
    return await imageCacheService.getCardImageUrl(cardId, description, width, height)
  } catch (error) {
    console.warn(`Failed to get image for card ${cardId}, using fallback:`, error)
    // Return a fallback URL
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=${width}&height=${height}&nologo=true&private=true&safe=true&seed=1`
  }
}

// Get collection image URL with local fallback and error handling
export async function getCollectionImageUrl(collectionId: string, width: number = 128, height: number = 128): Promise<string> {
  try {
    // For collections, we use the collection ID directly for local image lookup
    return await imageCacheService.getCardImageUrl(collectionId, collectionId, width, height)
  } catch (error) {
    console.warn(`Failed to get image for collection ${collectionId}, using fallback:`, error)
    // Return a fallback URL
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(collectionId)}?width=${width}&height=${height}&nologo=true&private=true&safe=true&seed=1`
  }
}

// Preload card images with priority levels
export async function preloadCardImages(cards: { id: string; description: string }[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
  const images = cards.map(card => ({
    url: `/images/cards/${card.id}.webp`,
    priority,
    width: 256,
    height: 256
  }))
  
  await imagePreloader.preloadImagesWithPriority(images)
}

// Preload collection images (high priority)
export async function preloadCollectionImages(collections: any[]): Promise<void> {
  await imagePreloader.preloadCollectionImages(collections)
}

// Preload card images for a specific collection
export async function preloadCollectionCardImages(collection: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
  await imagePreloader.preloadCollectionCardImages(collection, priority)
}

// Preload images with progressive enhancement
export async function preloadCardImagesProgressive(cards: { id: string; description: string }[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<{ success: number; failed: number }> {
  const images = cards.map(card => ({
    url: `/images/cards/${card.id}.webp`,
    priority,
    width: 256,
    height: 256
  }))
  
  return await imagePreloader.preloadImagesProgressive(images)
}

// Preload collection images with progressive enhancement
export async function preloadCollectionImagesProgressive(collections: any[]): Promise<{ success: number; failed: number }> {
  const images = collections.map(collection => ({
    url: `/images/cards/${collection.id}.webp`,
    priority: 'high' as const,
    width: 128,
    height: 128
  }))
  
  return await imagePreloader.preloadImagesProgressive(images)
}