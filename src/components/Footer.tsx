import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">CW</span>
              </div>
              <span className="text-2xl font-bold text-gradient">RocketCards</span>
            </div>
            <p className="text-text-secondary max-w-2xl mb-4">
              Choose your card collection, build your deck and strategy, then battle opponents with dynamic effects resolved by cutting-edge AI models.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/rocketcards" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-surface-light hover:bg-primary/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-text-secondary hover:text-primary" />
              </a>
              <a 
                href="https://twitter.com/rocketcards" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-surface-light hover:bg-primary/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-text-secondary hover:text-primary" />
              </a>
              <a 
                href="https://linkedin.com/company/rocketcards" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-surface-light hover:bg-primary/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-text-secondary hover:text-primary" />
              </a>
              <a 
                href="mailto:contact@rocketcards.com"
                className="p-2 rounded-full bg-surface-light hover:bg-primary/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-text-secondary hover:text-primary" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-text-secondary hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/collections" className="text-text-secondary hover:text-white transition-colors">Collections</a>
              </li>
              <li>
                <a href="/deck-builder" className="text-text-secondary hover:text-white transition-colors">Deck Builder</a>
              </li>
              <li>
                <a href="/play" className="text-text-secondary hover:text-white transition-colors">Play</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-text-secondary hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="text-text-secondary hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="/cookies" className="text-text-secondary hover:text-white transition-colors">Cookie Policy</a>
              </li>
              <li>
                <a href="/disclaimer" className="text-text-secondary hover:text-white transition-colors">Disclaimer</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-text-secondary">
          <p>&copy; {new Date().getFullYear()} RocketCards. All rights reserved.</p>
          <p className="mt-2 text-sm">Crafted with precision and passion for card game enthusiasts worldwide.</p>
        </div>
      </div>
    </footer>
  )
}
