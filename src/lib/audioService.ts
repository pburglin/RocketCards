import { Howl, Howler } from 'howler'

class AudioService {
  private sounds: Map<string, Howl> = new Map()
  private backgroundMusic: Howl | null = null

  constructor() {
    this.initializeSounds()
  }

  private initializeSounds() {
    try {
      // Initialize all sound effects with fallback to empty Howl objects
      const soundConfig = {
        cardPlay: '/sounds/card-play.mp3',
        damage: '/sounds/damage.mp3',
        newTurn: '/sounds/new-turn.mp3',
        victory: '/sounds/victory.mp3',
        defeat: '/sounds/defeat.mp3',
        backgroundMusic: '/sounds/battle-music.mp3'
      }

      // Initialize sound effects with better error handling
      Object.entries(soundConfig).forEach(([key, src]) => {
        if (key !== 'backgroundMusic') {
          const sound = new Howl({
            src: [src],
            volume: 0.7,
            preload: true,
            onloaderror: (id: any, error: any) => {
              console.warn(`Failed to load sound ${src}:`, error)
              // Create a silent fallback sound
              this.sounds.set(key, new Howl({
                src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA='],
                volume: 0
              }))
            },
            onplayerror: (id: any, error: any) => {
              console.warn(`Failed to play sound ${src}:`, error)
            }
          })
          this.sounds.set(key, sound)
        }
      })

      // Initialize background music with better error handling
      this.backgroundMusic = new Howl({
        src: [soundConfig.backgroundMusic],
        loop: true,
        volume: 0.3,
        preload: true,
        onloaderror: (id: any, error: any) => {
          console.warn(`Failed to load background music ${soundConfig.backgroundMusic}:`, error)
          // Create silent fallback
          this.backgroundMusic = new Howl({
            src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA='],
            volume: 0,
            loop: true
          })
        }
      })
    } catch (error: any) {
      console.warn('Audio initialization failed:', error)
      // Create silent fallback sounds
      const silentSound = new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA='],
        volume: 0
      })
      this.sounds.set('cardPlay', silentSound)
      this.sounds.set('damage', silentSound)
      this.sounds.set('newTurn', silentSound)
      this.sounds.set('victory', silentSound)
      this.sounds.set('defeat', silentSound)
      this.backgroundMusic = silentSound
    }
  }

  // Check if sound effects are enabled in user settings
  private isSoundEffectsEnabled(): boolean {
    const settings = localStorage.getItem('userSettings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        return parsed.general?.soundEffects !== false
      } catch (e) {
        return true // Default to enabled if parsing fails
      }
    }
    return true // Default to enabled
  }

  // Play a sound effect if sound is enabled
  public playSound(soundName: string): void {
    if (!this.isSoundEffectsEnabled()) {
      return
    }

    const sound = this.sounds.get(soundName)
    if (sound) {
      try {
        // Check if sound is loaded, if not try to load it
        if (sound.state() === 'unloaded') {
          // Try to reload the sound
          sound.load()
        }
        // Play the sound
        sound.play()
      } catch (error) {
        console.warn(`Failed to play sound ${soundName}:`, error)
      }
    }
  }

  // Play background music
  public playBackgroundMusic(): void {
    if (!this.isSoundEffectsEnabled()) {
      return
    }

    if (this.backgroundMusic) {
      try {
        // Check if sound is loaded, if not try to load it
        if (this.backgroundMusic.state() === 'unloaded') {
          // Try to reload the sound
          this.backgroundMusic.load()
        }
        // Play the sound
        this.backgroundMusic.play()
      } catch (error) {
        console.warn('Failed to play background music:', error)
      }
    }
  }

  // Stop background music
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.stop()
      } catch (error) {
        console.warn('Failed to stop background music:', error)
      }
    }
  }

  // Play card played sound
  public playCardSound(): void {
    try {
      this.playSound('cardPlay')
    } catch (error) {
      console.warn('Failed to play card sound:', error)
    }
  }

  // Play damage dealt sound
  public playDamageSound(): void {
    try {
      this.playSound('damage')
    } catch (error) {
      console.warn('Failed to play damage sound:', error)
    }
  }

  // Play new turn sound
  public playNewTurnSound(): void {
    try {
      this.playSound('newTurn')
    } catch (error) {
      console.warn('Failed to play new turn sound:', error)
    }
  }

  // Play victory sound
  public playVictorySound(): void {
    try {
      this.playSound('victory')
    } catch (error) {
      console.warn('Failed to play victory sound:', error)
    }
  }

  // Play defeat sound
  public playDefeatSound(): void {
    try {
      this.playSound('defeat')
    } catch (error) {
      console.warn('Failed to play defeat sound:', error)
    }
  }

  // Set global volume
  public setVolume(volume: number): void {
    Howler.volume(volume)
  }

  // Mute all sounds
  public mute(): void {
    Howler.mute(true)
  }

  // Unmute all sounds
  public unmute(): void {
    Howler.mute(false)
  }
}

// Export singleton instance
export const audioService = new AudioService()