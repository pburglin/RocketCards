import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup'
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
            <RadioGroup value={strategy} onValueChange={(value: any) => setStrategy(value)} className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aggressive" id="aggressive" />
                <Label htmlFor="aggressive" className="flex items-center">
                  <Flame className="w-4 h-4 text-error mr-2" />
                  Aggressive
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced" className="flex items-center">
                  <Sparkles className="w-4 h-4 text-success mr-2" />
                  Balanced
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="defensive" id="defensive" />
                <Label htmlFor="defensive" className="flex items-center">
                  <Shield className="w-4 h-4 text-secondary mr-2" />
                  Defensive
                </Label>
              </div>
            </RadioGroup>
            
            <div className="mt-4 bg-surface-light p-4 rounded-lg">
              <h4 className="font-medium mb-2">Strategy Effects:</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Aggressive: +4 MP, MP Regen: 4</li>
                <li>• Balanced: +2 HP, +2 MP, MP Regen: 3</li>
                <li>• Defensive: +4 HP, MP Regen: 2</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-8">
            <Label className="mb-2 block">Key Stat</Label>
            <RadioGroup value={keyStat} onValueChange={(value: any) => setKeyStat(value)} className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strength" id="strength" />
                <Label htmlFor="strength">Strength</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intelligence" id="intelligence" />
                <Label htmlFor="intelligence">Intelligence</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="charisma" id="charisma" />
                <Label htmlFor="charisma">Charisma</Label>
              </div>
            </RadioGroup>
            
            <div className="mt-4 bg-surface-light p-4 rounded-lg">
              <h4 className="font-medium mb-2">Key Stat Effects:</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Strength: +8 HP, +2 MP</li>
                <li>• Intelligence: +2 HP, +6 MP</li>
                <li>• Charisma: +2 HP, +2 MP</li>
              </ul>
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
              <p className="text-xl font-bold text-accent">
                {strategy === 'aggressive' ? 4 : strategy === 'balanced' ? 3 : 2}
              </p>
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
