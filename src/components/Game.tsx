import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, PointerLockControls } from '@react-three/drei'
import HUD from './HUD'
import { Player } from '@/lib/game/player'
import { Level } from '@/lib/game/level'
import { EnemyController } from '@/lib/game/enemy'
import { WeaponSystem } from '@/lib/game/weapon'
import { loadTextures } from '@/lib/game/textures'
import { Button } from '@/components/ui/button'
import './Game.css'

interface GameProps {
  gameSettings: {
    soundVolume: number
    musicVolume: number
    mouseSensitivity: number
  }
}

// Scene component that handles the game logic
const Scene = ({ gameSettings }: { gameSettings: GameProps['gameSettings'] }) => {
  const { camera, gl } = useThree()
  const playerRef = useRef<Player | null>(null)
  const levelRef = useRef<Level | null>(null)
  const enemyControllerRef = useRef<EnemyController | null>(null)
  const weaponSystemRef = useRef<WeaponSystem | null>(null)
  const texturesRef = useRef<Record<string, THREE.Texture> | null>(null)
  
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({})
  const [isLocked, setIsLocked] = useState(false)
  
  // Game state
  const [health, setHealth] = useState(100)
  const [ammo, setAmmo] = useState(50)
  const [gameOver, setGameOver] = useState(false)
  
  useEffect(() => {
    // Load textures
    if (!texturesRef.current) {
      texturesRef.current = loadTextures()
    }
    
    // Initialize game objects
    if (!playerRef.current) {
      playerRef.current = new Player(camera as THREE.PerspectiveCamera, gameSettings.mouseSensitivity)
    }
    
    if (!levelRef.current) {
      levelRef.current = new Level()
    }
    
    if (!enemyControllerRef.current && levelRef.current) {
      enemyControllerRef.current = new EnemyController(levelRef.current.enemies)
    }
    
    if (!weaponSystemRef.current) {
      weaponSystemRef.current = new WeaponSystem()
    }
    
    // Set up key listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: true }))
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: false }))
    }
    
    // Set up mouse click for shooting
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && isLocked && !gameOver) {
        handleShoot()
      }
    }
    
    // Handle weapon switching
    const handleWheel = (e: WheelEvent) => {
      if (isLocked && !gameOver && weaponSystemRef.current) {
        const direction = e.deltaY > 0 ? 1 : -1
        const currentIndex = weaponSystemRef.current.currentWeaponIndex
        const newIndex = (currentIndex + direction + weaponSystemRef.current.weapons.length) % weaponSystemRef.current.weapons.length
        weaponSystemRef.current.switchWeapon(newIndex)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('wheel', handleWheel)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [camera, gameSettings.mouseSensitivity, isLocked, gameOver])
  
  // Handle shooting
  const handleShoot = () => {
    if (
      playerRef.current && 
      levelRef.current && 
      enemyControllerRef.current && 
      weaponSystemRef.current
    ) {
      const player = playerRef.current
      const enemies = levelRef.current.enemies
      
      // Get direction player is facing
      const direction = new THREE.Vector3(0, 0, -1)
        .applyEuler(player.rotation)
        .normalize()
      
      // Fire weapon
      const result = weaponSystemRef.current.fire(
        player.position,
        direction,
        enemies,
        ammo
      )
      
      // Update ammo
      setAmmo(result.ammoLeft)
      
      // Handle hit
      if (result.hit && result.enemyIndex !== -1) {
        const weapon = weaponSystemRef.current.getCurrentWeapon()
        const killed = enemyControllerRef.current.takeDamage(result.enemyIndex, weapon.damage)
        
        if (killed) {
          console.log('Enemy killed!')
        }
      }
    }
  }
  
  // Handle door interaction
  const handleInteract = () => {
    if (playerRef.current && levelRef.current) {
      const player = playerRef.current
      const doors = levelRef.current.doors
      
      // Get direction player is facing
      const direction = new THREE.Vector3(0, 0, -1)
        .applyEuler(player.rotation)
        .normalize()
      
      // Create ray for door detection
      const raycaster = new THREE.Raycaster(
        player.position,
        direction,
        0,
        3 // Interaction range
      )
      
      // Check for doors
      for (let i = 0; i < doors.length; i++) {
        const door = doors[i]
        
        // Check if ray intersects door
        const intersects = raycaster.intersectBox(door.collider, new THREE.Vector3())
        
        if (intersects) {
          levelRef.current.toggleDoor(i)
          break
        }
      }
    }
  }
  
  // Handle item pickup
  const checkItemPickup = () => {
    if (playerRef.current && levelRef.current) {
      const player = playerRef.current
      const items = levelRef.current.items
      
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]
        
        // Check if player is close to item
        const distance = player.position.distanceTo(item.position)
        
        if (distance < 1.5) {
          // Apply item effect
          if (item.type === 'health') {
            setHealth(prev => Math.min(100, prev + item.value))
            player.addHealth(item.value)
          } else if (item.type === 'ammo') {
            setAmmo(prev => prev + item.value)
            player.addAmmo(item.value)
          }
          
          // Remove item
          items.splice(i, 1)
        }
      }
    }
  }
  
  // Game loop
  useFrame((_, delta) => {
    if (gameOver || !isLocked) return
    
    if (
      playerRef.current && 
      levelRef.current && 
      enemyControllerRef.current
    ) {
      const player = playerRef.current
      const level = levelRef.current
      
      // Handle movement
      const moveDirection = new THREE.Vector3(0, 0, 0)
      
      if (keysPressed['w']) moveDirection.z = -1
      if (keysPressed['s']) moveDirection.z = 1
      if (keysPressed['a']) moveDirection.x = -1
      if (keysPressed['d']) moveDirection.x = 1
      
      // Store old position for collision detection
      const oldPosition = player.position.clone()
      
      // Move player
      player.move(moveDirection, delta)
      
      // Check for collisions
      const obstacles = level.getObstacles()
      const hasCollision = player.checkCollision(obstacles)
      
      // If collision, revert to old position
      if (hasCollision) {
        player.position.copy(oldPosition)
        player.updateCamera()
      }
      
      // Handle interaction (door opening)
      if (keysPressed['e']) {
        handleInteract()
        // Reset key to prevent multiple interactions
        setKeysPressed(prev => ({ ...prev, e: false }))
      }
      
      // Check for item pickup
      checkItemPickup()
      
      // Update enemies
      const damage = enemyControllerRef.current.update(player.position, delta, obstacles)
      
      // Apply damage to player
      if (damage > 0) {
        const isDead = player.takeDamage(damage)
        setHealth(player.health)
        
        if (isDead) {
          setGameOver(true)
        }
      }
    }
  })
  
  // Handle pointer lock
  useEffect(() => {
    // Listen for pointer lock changes from the parent component
    const handleLock = () => {
      setIsLocked(true)
    }
    
    const handleUnlock = () => {
      setIsLocked(false)
    }
    
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        handleLock()
      } else {
        handleUnlock()
      }
    })
    
    return () => {
      document.removeEventListener('pointerlockchange', () => {})
    }
  }, [])
  
  // Render walls
  const renderWalls = () => {
    if (!levelRef.current || !texturesRef.current) return null
    
    return levelRef.current.walls.map((wall, index) => {
      // Determine which texture to use
      let texture = null
      if (wall.texture === 'wall') texture = texturesRef.current?.wall
      else if (wall.texture === 'floor') texture = texturesRef.current?.floor
      else if (wall.texture === 'ceiling') texture = texturesRef.current?.ceiling
      
      return (
        <mesh
          key={`wall-${index}`}
          position={[wall.position.x, wall.position.y, wall.position.z]}
          rotation={[wall.rotation.x, wall.rotation.y, wall.rotation.z]}
        >
          <boxGeometry args={[wall.size.x, wall.size.y, wall.size.z]} />
          <meshStandardMaterial 
            color={wall.color} 
            map={texture || undefined}
          />
        </mesh>
      )
    })
  }
  
  // Render doors
  const renderDoors = () => {
    if (!levelRef.current) return null
    
    return levelRef.current.doors.map((door, index) => (
      <mesh
        key={`door-${index}`}
        position={[door.position.x, door.position.y - (door.isOpen ? 4 : 0), door.position.z]}
        rotation={[door.rotation.x, door.rotation.y, door.rotation.z]}
      >
        <boxGeometry args={[door.size.x, door.size.y, door.size.z]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    ))
  }
  
  // Render enemies
  const renderEnemies = () => {
    if (!levelRef.current) return null
    
    return levelRef.current.enemies
      .filter(enemy => enemy.isActive)
      .map((enemy, index) => (
        <mesh
          key={`enemy-${index}`}
          position={[enemy.position.x, enemy.position.y, enemy.position.z]}
        >
          <capsuleGeometry args={[0.5, 1, 8, 16]} />
          <meshStandardMaterial color="#880000" />
        </mesh>
      ))
  }
  
  // Render items
  const renderItems = () => {
    if (!levelRef.current) return null
    
    return levelRef.current.items.map((item, index) => (
      <mesh
        key={`item-${index}`}
        position={[item.position.x, item.position.y, item.position.z]}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={item.type === 'health' ? '#00ff00' : '#ffff00'} />
      </mesh>
    ))
  }
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Sky sunPosition={[100, 10, 100]} />
      
      {/* Level geometry */}
      {renderWalls()}
      {renderDoors()}
      {renderEnemies()}
      {renderItems()}
    </>
  )
}

// Main Game component
const Game = ({ gameSettings }: GameProps) => {
  const navigate = useNavigate()
  const [gameOver, setGameOver] = useState(false)
  const [health, setHealth] = useState(100)
  const [ammo, setAmmo] = useState(50)
  const [showClickToPlay, setShowClickToPlay] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const controlsRef = useRef<any>(null)
  
  // Add debug logging for pointer lock state
  useEffect(() => {
    const handleLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      console.log("Pointer lock state changed:", isLocked ? "LOCKED" : "UNLOCKED");
      setIsLocked(isLocked);
    };
    
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);
  
  const handleReturnToMenu = () => {
    navigate('/')
  }
  
  const handleClickToPlay = () => {
    console.log("Click to play clicked, attempting to lock controls")
    setShowClickToPlay(false)
    // Add a small delay to ensure the overlay is hidden before locking
    setTimeout(() => {
      if (controlsRef.current) {
        console.log("Locking controls")
        try {
          controlsRef.current.lock()
        } catch (error) {
          console.error("Error locking controls:", error)
          // If locking fails, show the overlay again
          setShowClickToPlay(true)
        }
      } else {
        console.error("Controls ref is null")
        setShowClickToPlay(true)
      }
    }, 100)
  }
  
  // Handle ESC key to show click-to-play overlay when pointer is unlocked
  useEffect(() => {
    if (!isLocked && !showClickToPlay && !gameOver) {
      setShowClickToPlay(true);
    }
  }, [isLocked, showClickToPlay, gameOver]);
  
  return (
    <div className="doom-container">
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <Scene 
          gameSettings={gameSettings} 
        />
        <PointerLockControls ref={controlsRef} />
      </Canvas>
      
      {/* HUD */}
      <HUD health={health} ammo={ammo} />
      
      {/* Crosshair - only show when locked */}
      {isLocked && <div className="crosshair"></div>}
      
      {/* Weapon - only show when locked */}
      {isLocked && (
        <div 
          className="weapon" 
          style={{ 
            backgroundImage: `url('https://static.wikia.nocookie.net/doom/images/4/48/DoomPistol.png')` 
          }}
        ></div>
      )}
      
      {/* Game Over Screen */}
      {gameOver && (
        <div className="game-over">
          <div className="game-over-text">GAME OVER</div>
          <Button 
            className="menu-button" 
            onClick={handleReturnToMenu}
          >
            RETURN TO MENU
          </Button>
        </div>
      )}
      
      {/* Click to Play Overlay */}
      {showClickToPlay && (
        <div className="click-to-play">
          <div className="click-to-play-text">CLICK TO PLAY</div>
          <div className="click-to-play-instructions">
            <p>Controls:</p>
            <p>WASD to move</p>
            <p>Mouse to look around</p>
            <p>Left-click to shoot</p>
            <p>E to interact with doors</p>
            <p>ESC to pause/unlock mouse</p>
          </div>
          <button 
            className="click-to-play-button"
            onClick={handleClickToPlay}
          >
            START GAME
          </button>
        </div>
      )}
      
      {/* Instructions - only show when locked */}
      {isLocked && (
        <div className="instructions">
          WASD: Move | Mouse: Look | Click: Shoot | E: Interact | ESC: Pause
        </div>
      )}
    </div>
  )
}

export default Game