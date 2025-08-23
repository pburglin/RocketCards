import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Label } from '../components/ui/Label'
import { calculatePlayerStats } from '../lib/gameEngine'
import { Shield, Sword, Sparkles, Flame, Star } from 'lucide-react'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { saveProfile } = useGameStore()
  const [displayName, setDisplayName] = useState('')
  const [strategy, setStrategy] = useState<'aggressive' | 'balanced' | 'defensive'>('balanced')
  const [keyStat, setKeyStat] = useState<'strength' | 'intelligence' | 'charisma'>('intelligence')
  const [errors, setErrors] = useState<{displayName?: string}>({})
  
  const stats = calculatePlayerStats(strategy, keyStat)
  
  // Calculate MP regen based on strategy
  const mpRegen = strategy === 'aggressive' ? 4 : strategy === 'balanced' ? 3 : 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: {displayName?: string} = {}
    
    if (displayName.length < 3 || displayName.length > 20) {
      newErrors.displayName = 'Display name must be 3-20 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    saveProfile({
      displayName,
      strategy,
      keyStat,
      hp: stats.hp,
      mp: stats.mp
    })
    
    // Navigate back to play setup instead of deck builder
    navigate('/play-setup')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
          <Sword className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Profile Setup</h1>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="displayName" className="mb-2 block">Display Name</Label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your display name"
            />
            {errors.displayName && (
              <p className="mt-2 text-sm text-error">{errors.displayName}</p>
            )}
          </div>
          
          <div className="mb-6">
            <Label className="mb-2 block">Strategy</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <input
                  type="radio"
                  id="aggressive"
                  name="strategy"
                  value="aggressive"
                  checked={strategy === 'aggressive'}
                  onChange={(e) => e.target.checked && setStrategy('aggressive')}
                  className="hidden"
                />
                <label
                  htmlFor="aggressive"
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                    strategy === 'aggressive' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Flame className="w-6 h-6 text-error mb-2" />
                  <span className="font-medium mb-1">Aggressive</span>
                  <span className="text-sm text-text-secondary">+4 MP, MP Regen: 4</span>
                </label>
              </div>
              
              <div className="text-center">
                <input
                  type="radio"
                  id="balanced"
                  name="strategy"
                  value="balanced"
                  checked={strategy === 'balanced'}
                  onChange={(e) => e.target.checked && setStrategy('balanced')}
                  className="hidden"
                />
                <label
                  htmlFor="balanced"
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                    strategy === 'balanced' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-success mb-2" />
                  <span className="font-medium mb-1">Balanced</span>
                  <span className="text-sm text-text-secondary">+2 HP, +2 MP, MP Regen: 3</span>
                </label>
              </div>
              
              <div className="text-center">
                <input
                  type="radio"
                  id="defensive"
                  name="strategy"
                  value="defensive"
                  checked={strategy === 'defensive'}
                  onChange={(e) => e.target.checked && setStrategy('defensive')}
                  className="hidden"
                />
                <label
                  htmlFor="defensive"
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                    strategy === 'defensive' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Shield className="w-6 h-6 text-secondary mb-2" />
                  <span className="font-medium mb-1">Defensive</span>
                  <span className="text-sm text-text-secondary">+4 HP, MP Regen: 2</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <Label className="mb-2 block">Key Stat</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <input
                  type="radio"
                  id="strength"
                  name="keyStat"
                  value="strength"
                  checked={keyStat === 'strength'}
                  onChange={(e) => e.target.checked && setKeyStat('strength')}
                  className="hidden"
                />
                <label
                  htmlFor="strength"
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                    keyStat === 'strength' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium mb-1">Strength</span>
                  <span className="text-sm text-text-secondary">+8 HP, +2 MP</span>
                </label>
              </div>
              
              <div className="text-center">
                <input
                  type="radio"
                  id="intelligence"
                  name="keyStat"
                  value="intelligence"
                  checked={keyStat === 'intelligence'}
                  onChange={(e) => e.target.checked && setKeyStat('intelligence')}
                  className="hidden"
                />
                <label
                  htmlFor="intelligence"
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                    keyStat === 'intelligence' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium mb-1">Intelligence</span>
                  <span className="text-sm text-text-secondary">+2 HP, +6 MP</span>
                </label>
              </div>
              
              <div className="text-center">
                <input
                  type="radio"
                  id="charisma"
                  name="keyStat"
                  value="charisma"
                  checked={keyStat === 'charisma'}
                  onChange={(e) => e.target.checked && setKeyStat('charisma')}
                  className="hidden"
                />
                <label
                  htmlFor="charisma"
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                    keyStat === 'charisma' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium mb-1">Charisma</span>
                  <span className="text-sm text-text-secondary">+2 HP, +2 MP</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-surface-light p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Calculated Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">HP</p>
                <p className="text-2xl font-bold text-primary">{stats.hp}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">MP</p>
                <p className="text-2xl font-bold text-secondary">{stats.mp}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-text-secondary">MP Regen</p>
              <p className="text-xl font-bold text-accent">{mpRegen}</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!displayName || displayName.length < 3 || displayName.length > 20}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
