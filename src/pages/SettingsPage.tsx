import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Palette, Bell, Shield, User, Gamepad2, LogOut, Save, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '../components/ui/Card'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('general')
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'dark',
    language: 'en',
    animations: true,
    autoSave: true,
    soundEffects: true
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    gameUpdates: true,
    friendRequests: true,
    achievements: true
  })
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends',
    gameHistory: 'friends',
    showOnlineStatus: true
  })

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('userSettings', JSON.stringify({
      general: generalSettings,
      notifications: notificationSettings,
      privacy: privacySettings
    }))
    
    // Show success message
    alert('Settings saved successfully!')
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      // Clear user data
      localStorage.removeItem('playerProfile.v1')
      localStorage.removeItem('decks.v1')
      localStorage.removeItem('currentMatch.v1')
      localStorage.removeItem('userSettings')
      
      // Redirect to landing page
      navigate('/')
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select 
              value={generalSettings.theme}
              onChange={(e) => setGeneralSettings({...generalSettings, theme: e.target.value})}
              className="w-full p-3 bg-surface rounded-lg border border-border focus:border-primary focus:outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">System Default</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select 
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
              className="w-full p-3 bg-surface rounded-lg border border-border focus:border-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2" />
            Gameplay
          </CardTitle>
        </CardHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Animations</div>
              <div className="text-sm text-text-secondary">Enable card and effect animations</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={generalSettings.animations}
                onChange={(e) => setGeneralSettings({...generalSettings, animations: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Auto-save Progress</div>
              <div className="text-sm text-text-secondary">Automatically save game progress</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={generalSettings.autoSave}
                onChange={(e) => setGeneralSettings({...generalSettings, autoSave: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Sound Effects</div>
              <div className="text-sm text-text-secondary">Card plays and game effects</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={generalSettings.soundEffects}
                onChange={(e) => setGeneralSettings({...generalSettings, soundEffects: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-text-secondary">Receive updates via email</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={notificationSettings.email}
                onChange={(e) => setNotificationSettings({...notificationSettings, email: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-text-secondary">Receive push notifications</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={notificationSettings.push}
                onChange={(e) => setNotificationSettings({...notificationSettings, push: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl">Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Game Updates</div>
              <div className="text-sm text-text-secondary">New cards, collections, and features</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={notificationSettings.gameUpdates}
                onChange={(e) => setNotificationSettings({...notificationSettings, gameUpdates: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Friend Requests</div>
              <div className="text-sm text-text-secondary">When someone sends you a friend request</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={notificationSettings.friendRequests}
                onChange={(e) => setNotificationSettings({...notificationSettings, friendRequests: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Achievements</div>
              <div className="text-sm text-text-secondary">When you unlock new achievements</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={notificationSettings.achievements}
                onChange={(e) => setNotificationSettings({...notificationSettings, achievements: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Profile Visibility</label>
            <select 
              value={privacySettings.profileVisibility}
              onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
              className="w-full p-3 bg-surface rounded-lg border border-border focus:border-primary focus:outline-none"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">
              Control who can see your profile information
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Game History</label>
            <select 
              value={privacySettings.gameHistory}
              onChange={(e) => setPrivacySettings({...privacySettings, gameHistory: e.target.value})}
              className="w-full p-3 bg-surface rounded-lg border border-border focus:border-primary focus:outline-none"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
            <p className="text-sm text-text-secondary mt-1">
              Control who can see your match history
            </p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium">Show Online Status</div>
              <div className="text-sm text-text-secondary">Let friends see when you're online</div>
            </div>
            <label className="relative inline-block w-9 h-5 align-middle select-none">
              <input
                type="checkbox"
                checked={privacySettings.showOnlineStatus}
                onChange={(e) => setPrivacySettings({...privacySettings, showOnlineStatus: e.target.checked})}
                className="toggle toggle-primary absolute opacity-0 w-0 h-0"
              />
              <div className="toggle-slider rounded-full"></div>
            </label>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl">Account Management</CardTitle>
        </CardHeader>
        
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-error border-error hover:bg-error/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-warning border-warning hover:bg-warning/10"
          >
            <X className="w-5 h-5 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  )

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-4">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-text-secondary">Manage your account preferences and game settings</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-surface-light'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </Card>
          
          <Card className="p-6 mt-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">Player Profile</div>
                <div className="text-sm text-text-secondary">Manage your account</div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full"
            >
              Edit Profile
            </Button>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold capitalize">{activeSection} Settings</h2>
                <p className="text-text-secondary">
                  {activeSection === 'general' && 'Customize your game experience'}
                  {activeSection === 'notifications' && 'Manage your notification preferences'}
                  {activeSection === 'privacy' && 'Control your privacy and security settings'}
                </p>
              </div>
              {activeSection !== 'admin' && (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
            
            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'notifications' && renderNotificationSettings()}
            {activeSection === 'privacy' && renderPrivacySettings()}
          </Card>
        </div>
      </div>
    </div>
  )
}
