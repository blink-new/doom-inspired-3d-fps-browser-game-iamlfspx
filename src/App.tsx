import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import Game from './components/Game'
import './App.css'

function App() {
  const [gameSettings, setGameSettings] = useState({
    soundVolume: 0.7,
    musicVolume: 0.5,
    mouseSensitivity: 0.5,
  })

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu gameSettings={gameSettings} setGameSettings={setGameSettings} />} />
        <Route path="/game" element={<Game gameSettings={gameSettings} />} />
      </Routes>
    </Router>
  )
}

export default App