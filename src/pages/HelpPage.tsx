import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ArrowLeft, BookOpen, Users, Clock, Shield, Sword, Zap, Star, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HelpPage() {
  const navigate = useNavigate()

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">1. Create Your Player Profile</h3>
            <p className="text-text-secondary mb-4">
              Before you can play, you'll need to create a player profile. This profile determines your starting stats and playstyle.
            </p>
            <div className="bg-surface-light p-4 rounded-lg mb-4">
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Go to the <strong>Profile</strong> section from the main menu</li>
                <li>Choose a display name for your player</li>
                <li>Select your preferred strategy: Aggressive, Balanced, or Defensive</li>
                <li>Pick your key stat: Strength, Intelligence, or Charisma</li>
                <li>Each combination gives you different starting HP and MP values</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">2. Select a Card Collection</h3>
            <p className="text-text-secondary mb-4">
              RocketCards features multiple themed collections, each with unique cards and artwork.
            </p>
            <div className="bg-surface-light p-4 rounded-lg mb-4">
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Browse collections in the <strong>Collections</strong> section</li>
                <li>Each collection has a different theme (Fantasy, Sci-Fi, Sports, etc.)</li>
                <li>Collections contain 30+ unique cards with different abilities</li>
                <li>Choose one collection to build your deck from</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">3. Build Your Deck</h3>
            <p className="text-text-secondary mb-4">
              Create a 30-card deck to use in matches. You can build manually or use the auto-build feature.
            </p>
            <div className="bg-surface-light p-4 rounded-lg mb-4">
              <h4 className="font-bold mb-2">Deck Building Rules:</h4>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
                <li>Decks must contain exactly 30 cards</li>
                <li>Common cards can be included unlimited times</li>
                <li>Rare cards can be included up to 2 times</li>
                <li>Unique cards can only be included once</li>
                <li>Special token cards must be purchased before use</li>
              </ul>
              <h4 className="font-bold mb-2">Building Options:</h4>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li><strong>Auto-build</strong>: Let the system create a balanced deck for you</li>
                <li><strong>Manual build</strong>: Select cards one by one to customize your strategy</li>
                <li><strong>Import/Export</strong>: Save and load deck configurations as JSON</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">4. Start Playing</h3>
            <p className="text-text-secondary mb-4">
              Once you have a profile and deck, you're ready to play!
            </p>
            <div className="bg-surface-light p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Go to the <strong>Play</strong> section</li>
                <li>Choose your match settings (AI difficulty, timed matches, etc.)</li>
                <li>Select your deck and start the match</li>
                <li>Learn the game mechanics as you play your first match</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'card-types',
      title: 'Card Types & Gameplay',
      icon: Sword,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Understanding Card Types</h3>
            <p className="text-text-secondary mb-4">
              RocketCards features several distinct card types, each with unique roles and abilities.
            </p>
          </div>

          <Card className="p-6 border-l-4 border-primary">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Champions</h4>
                <p className="text-text-secondary mb-3">
                  Your main fighter that stays in play throughout the match. Champions are the centerpiece of your strategy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-bold mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Only one champion per player allowed</li>
                      <li>Provides Attack Power (AP) and Defense Power (DP)</li>
                      <li>Can have skills attached to enhance abilities</li>
                      <li>Persistent - stays in play until destroyed</li>
                      <li>Special token champions are more powerful</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2">Examples:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Dragon Unbound (Fantasy) - Unique with powerful effects</li>
                      <li>Alien Overlord (Sci-Fi) - Mind control abilities</li>
                      <li>Lich King (Fantasy) - Necromancy powers</li>
                      <li>Token Champions - Extra powerful special cards</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-accent">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Creatures</h4>
                <p className="text-text-secondary mb-3">
                  Temporary fighters that provide additional combat power and special abilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-bold mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Have HP and MP stats that can change during play</li>
                      <li>Can have duration limits (turn-based, HP-based, or MP-based)</li>
                      <li>Attack and defend alongside your champion</li>
                      <li>Can be summoned multiple times per game</li>
                      <li>Vary in power from common to unique rarities</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2">Examples:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Goblin Warrior - Basic creature with 2 HP</li>
                      <li>Ancient Golem - High defense, cannot be targeted by weak damage</li>
                      <li>Knight Defender - Temporary protection for 3 turns</li>
                      <li>Security Drone - Cannot be targeted by opponent events</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Skills</h4>
                <p className="text-text-secondary mb-3">
                  Enhancement cards that attach to your champion to boost their abilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-bold mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Must be attached to a champion to be effective</li>
                      <li>Provide damage boosts, healing, or special effects</li>
                      <li>Can be played during your turn</li>
                      <li>Multiple skills can be attached to one champion</li>
                      <li>Common to rare rarities available</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2">Examples:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Fireball - Deal 2 damage to target champion</li>
                      <li>Healing Light - Restore 3 HP to target champion</li>
                      <li>Laser Blast - Technology-themed damage</li>
                      <li>Enchanted Blade - Weapon enhancement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Tactics</h4>
                <p className="text-text-secondary mb-3">
                  Strategic cards that provide immediate powerful effects or defensive measures.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-bold mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Instant or temporary effects</li>
                      <li>Often have reaction abilities (can be played in response)</li>
                      <li>Powerful defensive or offensive capabilities</li>
                      <li>Usually rare or unique rarity</li>
                      <li>One-time use cards</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2">Examples:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Counter Maneuver - Negate next action</li>
                      <li>Energy Force Field - Prevent all damage this turn</li>
                      <li>Divine Intervention - Protect champions and heal</li>
                      <li>Temporal Shift - Take an extra turn</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Events</h4>
                <p className="text-text-secondary mb-3">
                  Game-changing cards that affect the entire battlefield or have lasting consequences.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="font-bold mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Affect all players or the entire game state</li>
                      <li>Often have high costs but powerful effects</li>
                      <li>Can change game rules temporarily</li>
                      <li>Usually rare or unique rarity</li>
                      <li>One-time use with lasting impact</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2">Examples:</h5>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                      <li>Magical Storm - Reduce MP regeneration</li>
                      <li>Solar Eclipse - Empower dark magic</li>
                      <li>Solar Flare - Disrupt all champions</li>
                      <li>Gravitational Anomaly - Return creatures to hands</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-surface-light p-6 rounded-lg">
            <h4 className="text-lg font-bold mb-3">Card Rarity System</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-common pl-4">
                <h5 className="font-bold text-common">Common</h5>
                <p className="text-text-secondary text-sm">Basic cards, unlimited copies per deck</p>
              </div>
              <div className="border-l-4 border-rare pl-4">
                <h5 className="font-bold text-rare">Rare</h5>
                <p className="text-text-secondary text-sm">Powerful cards, max 2 copies per deck</p>
              </div>
              <div className="border-l-4 border-unique pl-4">
                <h5 className="font-bold text-unique">Unique</h5>
                <p className="text-text-secondary text-sm">Most powerful cards, 1 copy per deck</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-surface rounded-lg">
              <h5 className="font-bold mb-2 text-warning">Special Token Cards</h5>
              <p className="text-text-secondary text-sm">
                The most powerful cards in the game that must be purchased with tokens. 
                These include legendary champions and ultimate abilities that can turn the tide of battle.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'game-modes',
      title: 'Game Modes & Rules',
      icon: Clock,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Match Structure</h3>
            <p className="text-text-secondary mb-4">
              RocketCards features strategic turn-based gameplay with multiple phases and complex interactions.
            </p>
          </div>

          <Card className="p-6">
            <h4 className="text-lg font-bold mb-4">Turn Structure</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h5 className="font-bold">Start Phase</h5>
                  <p className="text-text-secondary text-sm">Restore MP, draw a card, check hand limit</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <h5 className="font-bold">Main Phase</h5>
                  <p className="text-text-secondary text-sm">Play cards, attack with champions and creatures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <h5 className="font-bold">End Phase</h5>
                  <p className="text-text-secondary text-sm">Clean up, check for win/loss conditions</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-bold mb-3">Timed Matches</h4>
              <p className="text-text-secondary mb-3">
                Add excitement and pressure to your matches with time limits.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary text-sm">
                <li>Each turn has a time limit (configurable)</li>
                <li>Automatic end turn if time expires</li>
                <li>Perfect for competitive play</li>
                <li>Can be enabled/disabled in match settings</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-bold mb-3">Mulligan System</h4>
              <p className="text-text-secondary mb-3">
                Start with a better hand by replacing unwanted cards.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary text-sm">
                <li>Option to redraw starting hand before first turn</li>
                <li>Can replace 1-3 cards from initial hand</li>
                <li>Helps ensure fair starting conditions</li>
                <li>Available in most game modes</li>
              </ul>
            </Card>
          </div>

          <Card className="p-6">
            <h4 className="text-lg font-bold mb-3">Play Limits & Fatigue</h4>
            <div className="space-y-4">
              <p className="text-text-secondary">
                Manage your resources carefully as fatigue affects your ability to play cards.
              </p>
              <div className="bg-surface-light p-4 rounded-lg">
                <h5 className="font-bold mb-2">Play Limits Based on Fatigue:</h5>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                  <li><strong>Fatigue 0-2:</strong> 2 cards per turn</li>
                  <li><strong>Fatigue 3-5:</strong> 1 card per turn</li>
                  <li><strong>Fatigue 6+:</strong> 0 cards per turn (cannot play)</li>
                </ul>
              </div>
              <div className="bg-surface-light p-4 rounded-lg">
                <h5 className="font-bold mb-2">Fatigue Accumulation:</h5>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                  <li>Playing cards increases fatigue</li>
                  <li>Not playing cards decreases fatigue by 1</li>
                  <li>Overplaying cards (exceeding limits) causes penalties</li>
                  <li>Penalty: Lose 2 HP and gain 1 Fatigue</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-red-500">
            <h4 className="text-lg font-bold mb-3">Conceding & Surrender</h4>
            <p className="text-text-secondary mb-3">
              Sometimes the best move is to accept defeat and learn for next time.
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>Concede button available during your turn</li>
              <li>Immediately ends the match as a loss</li>
              <li>No penalties for conceding</li>
              <li>Useful when defeat is inevitable</li>
              <li>Helps maintain good sportsmanship</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 'winning',
      title: 'Winning & Losing',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">How to Win</h3>
            <p className="text-text-secondary mb-4">
              Victory in RocketCards requires strategic thinking and careful resource management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-l-4 border-green-500">
              <h4 className="text-lg font-bold mb-3">Primary Victory Condition</h4>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Reduce opponent's HP to 0 or below</li>
                <li>Destroy all opponent's champions and creatures when they have no HP</li>
                <li>Force opponent to concede</li>
              </ul>
            </Card>

            <Card className="p-6 border-l-4 border-blue-500">
              <h4 className="text-lg font-bold mb-3">Secondary Victory Conditions</h4>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Opponent runs out of cards in deck</li>
                <li>Opponent cannot draw cards due to hand limit</li>
                <li>Special card effects that trigger victory</li>
              </ul>
            </Card>
          </div>

          <Card className="p-6 border-l-4 border-red-500">
            <h4 className="text-lg font-bold mb-3">How to Lose</h4>
            <div className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Your HP drops to 0 or below</li>
                <li>You concede the match</li>
                <li>You run out of cards in your deck</li>
                <li>You cannot draw cards due to hand limit violations</li>
                <li>Special card effects that trigger defeat</li>
              </ul>
              <div className="bg-surface-light p-4 rounded-lg mt-4">
                <h5 className="font-bold mb-2">Survival Tips:</h5>
                <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                  <li>Manage your HP and MP carefully</li>
                  <li>Don't overextend with high-cost plays</li>
                  <li>Keep defensive options available</li>
                  <li>Plan ahead for multiple turns</li>
                  <li>Adapt your strategy based on opponent's moves</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-bold mb-3">Match Statistics</h4>
            <p className="text-text-secondary mb-3">
              Track your performance and improve your skills over time.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-text-secondary">Wins</div>
              </div>
              <div className="text-center p-3 bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-red-500">0</div>
                <div className="text-sm text-text-secondary">Losses</div>
              </div>
              <div className="text-center p-3 bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">0</div>
                <div className="text-sm text-text-secondary">Win Streak</div>
              </div>
              <div className="text-center p-3 bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-accent">0</div>
                <div className="text-sm text-text-secondary">Tokens</div>
              </div>
            </div>
          </Card>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold">Help & Guide</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
              <nav className="space-y-2">
                {helpSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{section.title}</span>
                    </a>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {helpSections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    {section.icon && <section.icon className="w-8 h-8 text-primary" />}
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  {section.content}
                </Card>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}