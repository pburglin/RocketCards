import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { audioService } from '../lib/audioService'
import { useEffect, useState } from 'react'
import { Trophy, RotateCw, Home, User, BarChart } from 'lucide-react'
import { Button } from '../components/ui/Button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '../components/ui/Card'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { matchState, playerState, opponentState, clearGameState, addTokens } = useGameStore()
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(timer)
  }, [])
  
  const isPlayerWinner = (playerState?.hp || 0) > (opponentState?.hp || 0)

  // If no match state, redirect to play
  useEffect(() => {
    if (!matchState) {
      navigate('/play')
    }
  }, [matchState, navigate])

  // Play victory or defeat sound when page loads
  useEffect(() => {
    // Stop background music first
    audioService.stopBackgroundMusic();
    
    // Play victory or defeat sound
    if (isPlayerWinner) {
      audioService.playVictorySound();
    } else {
      audioService.playDefeatSound();
    }
  }, [isPlayerWinner]);

  const handlePlayAgain = () => {
    clearGameState()
    navigate('/play')
  }

  const handleReturnHome = () => {
    clearGameState()
    navigate('/')
  }

  // Calculate match statistics
  const totalTurns = matchState?.turn || 0
  const playerHp = playerState?.hp || 0
  const opponentHp = opponentState?.hp || 0
  
  // Award tokens when player wins
  useEffect(() => {
    if (isPlayerWinner) {
      addTokens(10) // Award 10 tokens for winning
    }
  }, [isPlayerWinner, addTokens])

  return (
    <div className="min-h-screen pt-16 pb-12">
      {/* Results Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface-light mb-6">
              {isPlayerWinner ? (
                <>
                  <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-text-secondary font-medium">Victory Achieved!</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-text-secondary font-medium">Match Complete</span>
                </>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {isPlayerWinner ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  Congratulations!
                </span>
              ) : (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-slate-500">
                  Match Results
                </span>
              )}
            </h1>
            
            <p className="text-xl text-text-secondary mb-10">
              {isPlayerWinner
                ? "You've emerged victorious in this strategic battle!"
                : "A hard-fought match with valuable lessons learned."}
            </p>
            {isPlayerWinner && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-success/20 border border-success mb-6">
                <span className="text-success font-medium">+10 Tokens Awarded!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Match Statistics */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Player Score */}
              <Card className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">You</h3>
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{playerHp}</div>
                <p className="text-text-secondary">HP</p>
              </Card>

              {/* Match Result */}
              <Card className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Result</h3>
                </div>
                <div className={`text-3xl font-bold mb-2 ${
                  isPlayerWinner ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {isPlayerWinner ? 'Victory' : 'Defeat'}
                </div>
                <p className="text-text-secondary">Match Outcome</p>
              </Card>

              {/* Opponent Score */}
              <Card className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-surface-light to-border rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold">Opponent</h3>
                </div>
                <div className="text-4xl font-bold text-text-secondary mb-2">{opponentHp}</div>
                <p className="text-text-secondary">HP</p>
              </Card>
            </div>

            {/* Detailed Stats */}
            <Card className="p-6 mb-8">
              <CardHeader className="text-center mb-6">
                <CardTitle className="text-2xl mb-2">Match Statistics</CardTitle>
                <CardDescription>
                  Detailed breakdown of this match's performance
                </CardDescription>
              </CardHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-light p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{totalTurns}</div>
                  <div className="text-sm text-text-secondary">Total Turns</div>
                </div>
                
                <div className="bg-surface-light p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {playerState?.champions?.length || 0}
                  </div>
                  <div className="text-sm text-text-secondary">Champions Used</div>
                </div>
                
                <div className="bg-surface-light p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {playerState?.hand?.length || 0}
                  </div>
                  <div className="text-sm text-text-secondary">Cards Played</div>
                </div>
                
                <div className="bg-surface-light p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-warning mb-1">
                    {playerState?.fatigue || 0}
                  </div>
                  <div className="text-sm text-text-secondary">Final Fatigue</div>
                </div>
              </div>
            </Card>

            {/* Performance Insights */}
            <Card className="p-6 mb-8">
              <CardHeader className="mb-4">
                <CardTitle className="text-xl flex items-center">
                  <BarChart className="w-5 h-5 mr-2" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                  <span className="text-text-secondary">Resource Management</span>
                  <span className="font-medium">
                    {playerState?.mp ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                  <span className="text-text-secondary">Champion Deployment</span>
                  <span className="font-medium">
                    {(playerState?.champions?.length || 0) > 0 ? 'Effective' : 'Limited'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                  <span className="text-text-secondary">Strategic Plays</span>
                  <span className="font-medium">
                    {totalTurns > 5 ? 'Strong' : 'Developing'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button 
                onClick={handlePlayAgain}
                className="text-lg font-semibold py-4 px-8"
              >
                <RotateCw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              
              <Button 
                onClick={handleReturnHome}
                variant="outline"
                className="text-lg font-semibold py-4 px-8"
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Section */}
      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h2 className="text-3xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Next Steps
              </span>
            </h2>
            
            <p className="text-text-secondary mb-8">
              Continue your journey and improve your skills
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/collections" 
                className="card card-hover-effect p-6 text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-surface-light rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <BarChart className="w-6 h-6 text-primary group-hover:text-primary-dark" />
                </div>
                <h3 className="text-lg font-bold mb-2">Analyze Decks</h3>
                <p className="text-sm text-text-secondary">
                  Review your collection and optimize strategies
                </p>
              </Link>
              
              <Link 
                to="/deck-builder" 
                className="card card-hover-effect p-6 text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-surface-light rounded-full flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                  <Trophy className="w-6 h-6 text-secondary group-hover:text-secondary-dark" />
                </div>
                <h3 className="text-lg font-bold mb-2">Build Decks</h3>
                <p className="text-sm text-text-secondary">
                  Create new strategies and combinations
                </p>
              </Link>
              
              <Link 
                to="/profile" 
                className="card card-hover-effect p-6 text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-surface-light rounded-full flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <User className="w-6 h-6 text-accent group-hover:text-accent-dark" />
                </div>
                <h3 className="text-lg font-bold mb-2">Profile Stats</h3>
                <p className="text-sm text-text-secondary">
                  Track your overall progress and achievements
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
