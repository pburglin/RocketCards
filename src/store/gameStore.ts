import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  PlayerState,
  MatchState,
  CardCollection,
  Deck,
  Profile,
  Card
} from '../types/game'
import {
  calculatePlayerStats,
  initializeMatch,
  playCard,
  resolveEffects,
  endTurn,
  concedeMatch,
  playOpponentAI
} from '../lib/gameEngine'
import { loadAllCollections, loadCollection } from '../lib/collectionLoader'

interface GameStore {
  // Collections
  collections: CardCollection[]
  selectedCollection: CardCollection | null
  setSelectedCollection: (collection: CardCollection) => void
  initializeCollections: () => Promise<void>
  
  // Decks
  decks: Deck[]
  selectedDeck: Deck | null
  addToDeck: (cardId: string) => void
  removeFromDeck: (cardId: string) => void
  saveDeck: (name: string) => void
  deleteDeck: (name: string) => void
  autoBuildDeck: () => void
  setSelectedDeck: (deck: Deck) => void
  
  // Profile
  profile: Profile | null
  saveProfile: (profile: Profile) => void
  addTokens: (amount: number) => void
  
  // Token purchases
  purchaseCardWithTokens: (cardId: string) => boolean
  
  // Match
  matchState: MatchState | null
  playerState: PlayerState | null
  opponentState: PlayerState | null
  startMatch: (options: {
    deck: Deck
    opponentType: 'ai' | 'pvp'
    aiDifficulty?: 'easy' | 'medium' | 'hard'
    timedMatch?: boolean
    mulliganEnabled?: boolean
    seed?: string
  }) => void
  playCard: (cardId: string) => boolean
  endTurn: () => void
  resolveLLM: () => Promise<{ log: string[] }>
  concede: () => void
  
  // Persistence
  loadGameState: () => void
  clearGameState: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      // Collections
      collections: [],
      selectedCollection: null,
      setSelectedCollection: (collection) => set({ selectedCollection: collection }),
      
      // Initialize collections asynchronously
      initializeCollections: async () => {
        const collections = await loadAllCollections()
        set({ collections })
      },
      
      // Decks
      decks: [],
      selectedDeck: null,
      addToDeck: (cardId) => {
        const { selectedDeck, collections, selectedCollection } = get()
        if (!selectedDeck) return
        
        // Find the card in the selected collection or any available collection
        let card: Card | undefined
        if (selectedCollection) {
          card = selectedCollection.cards.find(c => c.id === cardId)
        } else {
          // Search through all collections
          for (const collection of collections) {
            card = collection.cards.find(c => c.id === cardId)
            if (card) break
          }
        }
        
        if (!card) return
        
        // Check copy limits
        const currentCount = selectedDeck.cards.filter(id => id === cardId).length
        // Common cards can be included unlimited times
        let maxAllowed = Infinity
        if (card.rarity === 'rare') maxAllowed = 2
        if (card.rarity === 'unique') maxAllowed = 1
        
        if (currentCount >= maxAllowed) {
          // Show error
          return
        }
        
        set(state => {
          if (state.selectedDeck) {
            state.selectedDeck.cards.push(cardId)
          }
        })
      },
      removeFromDeck: (cardId: string) => {
        set(state => {
          if (state.selectedDeck) {
            const index = state.selectedDeck.cards.indexOf(cardId)
            if (index !== -1) {
              state.selectedDeck.cards.splice(index, 1)
            }
          }
        })
      },
      saveDeck: (name) => {
        set(state => {
          if (state.selectedDeck && state.selectedCollection) {
            const deck = {
              ...state.selectedDeck,
              name,
              collection: state.selectedCollection.id // Store collection ID instead of full object
            }
            
            const existingIndex = state.decks.findIndex(d => d.name === name)
            if (existingIndex !== -1) {
              state.decks[existingIndex] = deck
            } else {
              state.decks.push(deck)
            }
            
            // Also update the selectedDeck to reflect the saved version
            state.selectedDeck = deck
          }
        })
      },
      deleteDeck: (name) => {
        set(state => {
          state.decks = state.decks.filter(d => d.name !== name)
        })
      },
      autoBuildDeck: () => {
        const { selectedCollection, selectedDeck, setSelectedDeck } = get()
        
        if (!selectedCollection) {
          return
        }
        
        // If no selected deck, create a new one with collection name
        if (!selectedDeck) {
          const newDeck: Deck = {
            name: `${selectedCollection.name} Deck`,
            cards: []
          }
          setSelectedDeck(newDeck)
        }
        
        set(state => {
          if (state.selectedDeck && state.selectedCollection) {
            // Clear current deck
            state.selectedDeck.cards = []
            
            // Add cards based on rarity with balanced distribution
            // Exclude token-purchased cards from auto-building
            const commons = [...state.selectedCollection.cards.filter(c => c.rarity === 'common' && !c.tokenCost)]
            const rares = [...state.selectedCollection.cards.filter(c => c.rarity === 'rare' && !c.tokenCost)]
            const uniques = [...state.selectedCollection.cards.filter(c => c.rarity === 'unique' && !c.tokenCost)]
            
            // Shuffle arrays to randomize selection
            commons.sort(() => Math.random() - 0.5)
            rares.sort(() => Math.random() - 0.5)
            uniques.sort(() => Math.random() - 0.5)
            
            // Add all uniques first (max 1 copy each)
            uniques.forEach(unique => {
              if (state.selectedDeck && state.selectedDeck.cards.length < 30) {
                state.selectedDeck.cards.push(unique.id)
              }
            })
            
            // Add rares (max 2 copies each) but respect the 30 card limit
            rares.forEach(rare => {
              if (state.selectedDeck && state.selectedDeck.cards.length < 30) {
                state.selectedDeck.cards.push(rare.id)
                if (state.selectedDeck.cards.length < 30) {
                  state.selectedDeck.cards.push(rare.id)
                }
              }
            })
            
            // Fill with commons (unlimited copies, aiming for 30 total cards)
            const targetDeckSize = 30
            if (state.selectedDeck) {
              const remainingSlots = targetDeckSize - state.selectedDeck.cards.length
              
              // Add commons to fill the deck with balanced distribution
              if (commons.length > 0 && remainingSlots > 0) {
                // Distribute commons evenly with some randomness
                for (let i = 0; i < remainingSlots; i++) {
                  const commonIndex = i % commons.length
                  if (state.selectedDeck) {
                    state.selectedDeck.cards.push(commons[commonIndex].id)
                  }
                }
              }
              
              // If we have more than 30 cards, trim to 30
              if (state.selectedDeck.cards.length > 30) {
                state.selectedDeck.cards = state.selectedDeck.cards.slice(0, 30)
              }
            }
          }
        })
      },
      setSelectedDeck: (deck) => set({ selectedDeck: deck }),
      
      // Profile
      profile: null,
      saveProfile: (profile) => {
        set({ profile })
      },
      addTokens: (amount: number) => {
        set(state => {
          if (state.profile) {
            return {
              profile: {
                ...state.profile,
                tokens: (state.profile.tokens || 0) + amount
              }
            }
          }
          return state
        })
      },
      
      // Token purchases
      purchaseCardWithTokens: (cardId) => {
        const { profile, collections } = get()
        
        if (!profile) return false
        
        // Find the card in any collection
        let card: Card | undefined
        for (const collection of collections) {
          card = collection.cards.find(c => c.id === cardId)
          if (card) break
        }
        
        if (!card || !card.tokenCost) return false
        
        // Check if player has enough tokens
        if ((profile.tokens || 0) < card.tokenCost) return false
        
        // Deduct tokens
        set(state => {
          if (state.profile) {
            return {
              profile: {
                ...state.profile,
                tokens: (state.profile.tokens || 0) - card!.tokenCost!
              }
            }
          }
          return state
        })
        
        return true
      },
      
      // Match
      matchState: null,
      playerState: null,
      opponentState: null,
      startMatch: (options) => {
        const { profile } = get()
        if (!profile || !options.deck) return
        
        const match = initializeMatch({
          playerProfile: profile,
          deck: options.deck,
          opponentType: options.opponentType,
          aiDifficulty: options.aiDifficulty || 'medium',
          timedMatch: options.timedMatch ?? true,
          mulliganEnabled: options.mulliganEnabled ?? true,
          seed: options.seed
        })
        
        set({
          matchState: match.matchState,
          playerState: match.playerState,
          opponentState: match.opponentState
        })
        
      },
      playCard: (cardId) => {
        const { matchState, playerState, opponentState, collections } = get()
        if (!matchState || !playerState || !opponentState) return false
        
        const result = playCard(matchState, playerState, opponentState, cardId, collections)
        if (result.success) {
          set({
            matchState: result.matchState,
            playerState: result.playerState,
            opponentState: result.opponentState
          })
          
          
          return true
        }
        return false
      },
      endTurn: () => {
        const { matchState, playerState, opponentState, collections } = get()
        if (!matchState || !playerState || !opponentState) return
        
        const result = endTurn(matchState, playerState, opponentState, collections)
        
        set({
          matchState: result.matchState,
          playerState: result.playerState,
          opponentState: result.opponentState
        })
        
        // After ending turn, if it's now the opponent's turn, trigger AI after a short delay
        if (result.matchState.activePlayer === 'opponent' && result.matchState.phase === 'main') {
          setTimeout(() => {
            const { matchState: currentMatchState, playerState: currentPlayerState, opponentState: currentOpponentState, collections: currentCollections } = get()
            if (currentMatchState && currentPlayerState && currentOpponentState) {
              const aiResult = playOpponentAI(currentMatchState, currentPlayerState, currentOpponentState, currentCollections)
              set({
                matchState: aiResult.matchState,
                playerState: aiResult.playerState,
                opponentState: aiResult.opponentState
              })
            }
          }, 500)
        }
        
      },
      resolveLLM: async () => {
        const { matchState, playerState, opponentState } = get()
        if (!matchState || !playerState || !opponentState) {
          return { log: ['Error: No match state'] }
        }
        
        // In a real app, this would call the LLM API
        // For MVP, we'll simulate a response
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const log = [
          'Player gains 3 MP',
          'Opponent takes 2 damage',
          'Champion ability triggered'
        ]
        
        set(state => {
          if (state.matchState) {
            state.matchState.log = [...state.matchState.log, ...log.map(message => ({ message, turn: state.matchState!.turn }))]
          }
        })
        
        return { log }
      },
      concede: () => {
        const { matchState, playerState, opponentState } = get()
        if (!matchState || !playerState || !opponentState) return
        
        const result = concedeMatch(matchState, playerState, opponentState)
        set({
          matchState: result.matchState,
          playerState: result.playerState,
          opponentState: result.opponentState
        })
        
      },
      // Persistence
      loadGameState: () => {
        // Persistence is handled automatically by the persist middleware
      },
      clearGameState: () => {
        set({
          profile: null,
          decks: [],
          matchState: null,
          playerState: null,
          opponentState: null
        })
      }
    })),
    {
      name: 'cardwizard-storage',
    }
  )
)
