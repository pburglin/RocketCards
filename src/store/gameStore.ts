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
  startPhase,
  upkeepPhase,
  playCard,
  resolveEffects,
  endTurn,
  concedeMatch
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
              collection: state.selectedCollection
            }
            
            const existingIndex = state.decks.findIndex(d => d.name === name)
            if (existingIndex !== -1) {
              state.decks[existingIndex] = deck
            } else {
              state.decks.push(deck)
            }
            
            localStorage.setItem('decks.v1', JSON.stringify(state.decks))
          }
        })
      },
      deleteDeck: (name) => {
        set(state => {
          state.decks = state.decks.filter(d => d.name !== name)
          localStorage.setItem('decks.v1', JSON.stringify(state.decks))
        })
      },
      autoBuildDeck: () => {
        const { selectedCollection, selectedDeck } = get()
        if (!selectedCollection || !selectedDeck) return
        
        set(state => {
          if (state.selectedDeck && state.selectedCollection) {
            // Clear current deck
            state.selectedDeck.cards = []
            
            // Add cards based on rarity
            const commons = state.selectedCollection.cards.filter(c => c.rarity === 'common')
            const rares = state.selectedCollection.cards.filter(c => c.rarity === 'rare')
            const uniques = state.selectedCollection.cards.filter(c => c.rarity === 'unique')
            
            // Add up to 1 unique if available
            if (uniques.length > 0) {
              state.selectedDeck.cards.push(uniques[0].id)
            }
            
            // Add up to 4 rares (2 copies each of up to 2 different rares) if available
            const raresToAdd = Math.min(2, rares.length)
            for (let i = 0; i < raresToAdd; i++) {
              state.selectedDeck.cards.push(rares[i].id)
              state.selectedDeck.cards.push(rares[i].id)
            }
            
            // Fill with commons (unlimited copies, aiming for 30 total cards)
            const targetDeckSize = 30
            const remainingSlots = targetDeckSize - state.selectedDeck.cards.length
            
            // Add commons to fill the deck
            if (commons.length > 0) {
              let commonsAdded = 0
              while (commonsAdded < remainingSlots) {
                // Cycle through commons to distribute them evenly
                const commonIndex = commonsAdded % commons.length
                state.selectedDeck.cards.push(commons[commonIndex].id)
                commonsAdded++
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
        localStorage.setItem('playerProfile.v1', JSON.stringify(profile))
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
        
        localStorage.setItem('currentMatch.v1', JSON.stringify({
          matchState: match.matchState,
          playerState: match.playerState,
          opponentState: match.opponentState
        }))
      },
      playCard: (cardId) => {
        const { matchState, playerState } = get()
        if (!matchState || !playerState) return false
        
        const result = playCard(matchState, playerState, cardId)
        if (result.success) {
          set({
            matchState: result.matchState,
            playerState: result.playerState
          })
          
          localStorage.setItem('currentMatch.v1', JSON.stringify({
            matchState: result.matchState,
            playerState: result.playerState,
            opponentState: get().opponentState
          }))
          
          return true
        }
        return false
      },
      endTurn: () => {
        const { matchState, playerState, opponentState } = get()
        if (!matchState || !playerState || !opponentState) return
        
        const result = endTurn(matchState, playerState, opponentState)
        set({
          matchState: result.matchState,
          playerState: result.playerState,
          opponentState: result.opponentState
        })
        
        localStorage.setItem('currentMatch.v1', JSON.stringify({
          matchState: result.matchState,
          playerState: result.playerState,
          opponentState: result.opponentState
        }))
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
            state.matchState.phase = 'end'
            state.matchState.log = [...state.matchState.log, ...log]
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
        
        localStorage.setItem('currentMatch.v1', JSON.stringify({
          matchState: result.matchState,
          playerState: result.playerState,
          opponentState: result.opponentState
        }))
      },
      
      // Persistence
      loadGameState: () => {
        // Load profile
        const profileStr = localStorage.getItem('playerProfile.v1')
        if (profileStr) {
          try {
            const profile = JSON.parse(profileStr)
            set({ profile })
          } catch (e) {
            console.error('Error loading profile', e)
          }
        }
        
        // Load decks
        const decksStr = localStorage.getItem('decks.v1')
        if (decksStr) {
          try {
            const decks = JSON.parse(decksStr)
            set({ decks })
          } catch (e) {
            console.error('Error loading decks', e)
          }
        }
        
        // Load current match
        const matchStr = localStorage.getItem('currentMatch.v1')
        if (matchStr) {
          try {
            const match = JSON.parse(matchStr)
            set({
              matchState: match.matchState,
              playerState: match.playerState,
              opponentState: match.opponentState
            })
          } catch (e) {
            console.error('Error loading match', e)
          }
        }
      },
      clearGameState: () => {
        localStorage.removeItem('playerProfile.v1')
        localStorage.removeItem('decks.v1')
        localStorage.removeItem('currentMatch.v1')
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
