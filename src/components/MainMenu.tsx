import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface GameSettings {
  soundVolume: number
  musicVolume: number
  mouseSensitivity: number
}

interface MainMenuProps {
  gameSettings: GameSettings
  setGameSettings: (settings: GameSettings) => void
}

const MainMenu = ({ gameSettings, setGameSettings }: MainMenuProps) => {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)

  const handlePlay = () => {
    navigate('/game')
  }

  const handleQuit = () => {
    // In a browser game, we can just redirect to another site
    window.location.href = 'https://blink.new'
  }

  const handleSettingsChange = (key: keyof GameSettings, value: number) => {
    setGameSettings({
      ...gameSettings,
      [key]: value,
    })
  }

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1 className="doom-title">DOOM CLONE</h1>
        
        <Button 
          className="menu-button" 
          onClick={handlePlay}
        >
          PLAY
        </Button>
        
        <Button 
          className="menu-button" 
          onClick={() => setShowSettings(true)}
        >
          SETTINGS
        </Button>
        
        <Button 
          className="menu-button" 
          onClick={handleQuit}
        >
          QUIT
        </Button>
      </div>

      {showSettings && (
        <div className="settings-container">
          <h2 className="settings-title">SETTINGS</h2>
          
          <div className="settings-row">
            <span className="settings-label">Sound Volume</span>
            <Slider
              className="settings-slider"
              value={[gameSettings.soundVolume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => handleSettingsChange('soundVolume', value[0])}
            />
          </div>
          
          <div className="settings-row">
            <span className="settings-label">Music Volume</span>
            <Slider
              className="settings-slider"
              value={[gameSettings.musicVolume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => handleSettingsChange('musicVolume', value[0])}
            />
          </div>
          
          <div className="settings-row">
            <span className="settings-label">Mouse Sensitivity</span>
            <Slider
              className="settings-slider"
              value={[gameSettings.mouseSensitivity]}
              min={0.1}
              max={1}
              step={0.1}
              onValueChange={(value) => handleSettingsChange('mouseSensitivity', value[0])}
            />
          </div>
          
          <div className="settings-buttons">
            <Button 
              className="menu-button" 
              onClick={() => setShowSettings(false)}
            >
              BACK
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainMenu