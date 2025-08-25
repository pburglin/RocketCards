import { CardCollection } from '../types/game'

// List of available collections
export const AVAILABLE_COLLECTIONS = [
  { id: 'fantasy', name: 'Fantasy Realms' },
  { id: 'politics', name: 'Political Arena' },
  { id: 'monsters', name: 'Monster Mayhem' },
  { id: 'anime', name: 'Anime All-Stars' },
  { id: 'scifi', name: 'Sci-Fi Universe' },
  { id: 'soccer', name: 'Soccer Legends' },
  { id: 'lawyers', name: 'Legal Eagles' },
  { id: 'apocalypse', name: 'Wasteland Warriors' },
  { id: 'heroes', name: 'Legendary Heroes' }
]

// Function to load a collection from JSON file
export async function loadCollection(collectionId: string): Promise<CardCollection | null> {
  try {
    // In a real app, this would fetch from /data/{collectionId}.json
    // For development, we'll import the files directly
    const collectionModule = await import(`../../data/${collectionId}.json`)
    return collectionModule.default || collectionModule
  } catch (error) {
    console.error(`Failed to load collection ${collectionId}:`, error)
    return null
  }
}

// Function to load all collections
export async function loadAllCollections(): Promise<CardCollection[]> {
  const collections: CardCollection[] = []
  
  for (const collectionInfo of AVAILABLE_COLLECTIONS) {
    const collection = await loadCollection(collectionInfo.id)
    if (collection) {
      collections.push(collection)
    }
  }
  
  return collections
}

// Function to get collection metadata (without loading all cards)
export function getCollectionMetadata() {
  return AVAILABLE_COLLECTIONS.map(collection => ({
    id: collection.id,
    name: collection.name,
    // In a real app, you might store card counts in a separate metadata file
    // For now, we'll get this info when we load the full collection
  }))
}