import * as THREE from 'three'

export interface Wall {
  position: THREE.Vector3
  size: THREE.Vector3
  rotation: THREE.Euler
  color: string
  texture?: string
  collider: THREE.Box3
}

export interface Door {
  position: THREE.Vector3
  size: THREE.Vector3
  rotation: THREE.Euler
  isOpen: boolean
  collider: THREE.Box3
}

export interface Enemy {
  position: THREE.Vector3
  health: number
  isActive: boolean
  collider: THREE.Box3
}

export interface Item {
  position: THREE.Vector3
  type: 'health' | 'ammo'
  value: number
  collider: THREE.Box3
}

export class Level {
  walls: Wall[]
  doors: Door[]
  enemies: Enemy[]
  items: Item[]
  startPosition: THREE.Vector3
  
  constructor() {
    this.walls = []
    this.doors = []
    this.enemies = []
    this.items = []
    this.startPosition = new THREE.Vector3(0, 1.6, 0)
    
    this.createLevel()
  }
  
  createLevel() {
    // Starting room
    this.createRoom(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 4, 10),
      '#444444'
    )
    
    // Corridor
    this.createCorridor(
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(3, 4, 10),
      '#333333'
    )
    
    // Door at the end of corridor
    this.createDoor(
      new THREE.Vector3(0, 0, -15)
    )
    
    // Second room with enemies
    this.createRoom(
      new THREE.Vector3(0, 0, -25),
      new THREE.Vector3(15, 4, 15),
      '#222222'
    )
    
    // Add enemies in the second room
    this.createEnemy(new THREE.Vector3(-5, 0, -25))
    this.createEnemy(new THREE.Vector3(5, 0, -25))
    this.createEnemy(new THREE.Vector3(0, 0, -30))
    
    // Add items
    this.createItem(new THREE.Vector3(3, 0, -5), 'health', 25)
    this.createItem(new THREE.Vector3(-3, 0, -5), 'ammo', 15)
    this.createItem(new THREE.Vector3(5, 0, -20), 'ammo', 10)
  }
  
  createRoom(position: THREE.Vector3, size: THREE.Vector3, color: string) {
    const halfWidth = size.x / 2
    const halfHeight = size.y / 2
    const halfDepth = size.z / 2
    
    // Floor
    this.walls.push({
      position: new THREE.Vector3(position.x, position.y, position.z),
      size: new THREE.Vector3(size.x, 0.1, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: '#111111',
      texture: 'floor',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth, position.y - 0.05, position.z - halfDepth),
        new THREE.Vector3(position.x + halfWidth, position.y + 0.05, position.z + halfDepth)
      )
    })
    
    // Ceiling
    this.walls.push({
      position: new THREE.Vector3(position.x, position.y + size.y, position.z),
      size: new THREE.Vector3(size.x, 0.1, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: '#111111',
      texture: 'ceiling',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth, position.y + size.y - 0.05, position.z - halfDepth),
        new THREE.Vector3(position.x + halfWidth, position.y + size.y + 0.05, position.z + halfDepth)
      )
    })
    
    // Walls
    // Left wall
    this.walls.push({
      position: new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z),
      size: new THREE.Vector3(0.1, size.y, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: color,
      texture: 'wall',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth - 0.05, position.y, position.z - halfDepth),
        new THREE.Vector3(position.x - halfWidth + 0.05, position.y + size.y, position.z + halfDepth)
      )
    })
    
    // Right wall
    this.walls.push({
      position: new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z),
      size: new THREE.Vector3(0.1, size.y, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: color,
      texture: 'wall',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x + halfWidth - 0.05, position.y, position.z - halfDepth),
        new THREE.Vector3(position.x + halfWidth + 0.05, position.y + size.y, position.z + halfDepth)
      )
    })
    
    // Front wall
    this.walls.push({
      position: new THREE.Vector3(position.x, position.y + halfHeight, position.z - halfDepth),
      size: new THREE.Vector3(size.x, size.y, 0.1),
      rotation: new THREE.Euler(0, 0, 0),
      color: color,
      texture: 'wall',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth, position.y, position.z - halfDepth - 0.05),
        new THREE.Vector3(position.x + halfWidth, position.y + size.y, position.z - halfDepth + 0.05)
      )
    })
    
    // Back wall
    this.walls.push({
      position: new THREE.Vector3(position.x, position.y + halfHeight, position.z + halfDepth),
      size: new THREE.Vector3(size.x, size.y, 0.1),
      rotation: new THREE.Euler(0, 0, 0),
      color: color,
      texture: 'wall',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth, position.y, position.z + halfDepth - 0.05),
        new THREE.Vector3(position.x + halfWidth, position.y + size.y, position.z + halfDepth + 0.05)
      )
    })
  }
  
  createCorridor(position: THREE.Vector3, size: THREE.Vector3, color: string) {
    const halfWidth = size.x / 2
    const halfHeight = size.y / 2
    const halfDepth = size.z / 2
    
    // Floor
    this.walls.push({
      position: new THREE.Vector3(position.x, position.y, position.z),
      size: new THREE.Vector3(size.x, 0.1, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: '#111111',
      texture: 'floor',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth, position.y - 0.05, position.z - halfDepth),
        new THREE.Vector3(position.x + halfWidth, position.y + 0.05, position.z + halfDepth)
      )
    })
    
    // Ceiling
    this.walls.push({
      position: new THREE.Vector3(position.x, position.y + size.y, position.z),
      size: new THREE.Vector3(size.x, 0.1, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: '#111111',
      texture: 'ceiling',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth, position.y + size.y - 0.05, position.z - halfDepth),
        new THREE.Vector3(position.x + halfWidth, position.y + size.y + 0.05, position.z + halfDepth)
      )
    })
    
    // Left wall
    this.walls.push({
      position: new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z),
      size: new THREE.Vector3(0.1, size.y, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: color,
      texture: 'wall',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - halfWidth - 0.05, position.y, position.z - halfDepth),
        new THREE.Vector3(position.x - halfWidth + 0.05, position.y + size.y, position.z + halfDepth)
      )
    })
    
    // Right wall
    this.walls.push({
      position: new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z),
      size: new THREE.Vector3(0.1, size.y, size.z),
      rotation: new THREE.Euler(0, 0, 0),
      color: color,
      texture: 'wall',
      collider: new THREE.Box3(
        new THREE.Vector3(position.x + halfWidth - 0.05, position.y, position.z - halfDepth),
        new THREE.Vector3(position.x + halfWidth + 0.05, position.y + size.y, position.z + halfDepth)
      )
    })
  }
  
  createDoor(position: THREE.Vector3) {
    this.doors.push({
      position: new THREE.Vector3(position.x, position.y + 2, position.z),
      size: new THREE.Vector3(3, 4, 0.2),
      rotation: new THREE.Euler(0, 0, 0),
      isOpen: false,
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - 1.5, position.y, position.z - 0.1),
        new THREE.Vector3(position.x + 1.5, position.y + 4, position.z + 0.1)
      )
    })
  }
  
  createEnemy(position: THREE.Vector3) {
    this.enemies.push({
      position: new THREE.Vector3(position.x, position.y + 1, position.z),
      health: 50,
      isActive: true,
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - 0.5, position.y, position.z - 0.5),
        new THREE.Vector3(position.x + 0.5, position.y + 2, position.z + 0.5)
      )
    })
  }
  
  createItem(position: THREE.Vector3, type: 'health' | 'ammo', value: number) {
    this.items.push({
      position: new THREE.Vector3(position.x, position.y + 0.5, position.z),
      type,
      value,
      collider: new THREE.Box3(
        new THREE.Vector3(position.x - 0.3, position.y, position.z - 0.3),
        new THREE.Vector3(position.x + 0.3, position.y + 1, position.z + 0.3)
      )
    })
  }
  
  toggleDoor(index: number) {
    if (index >= 0 && index < this.doors.length) {
      const door = this.doors[index]
      door.isOpen = !door.isOpen
      
      if (door.isOpen) {
        // Move collider out of the way when door is open
        door.collider.min.y = -100
        door.collider.max.y = -90
      } else {
        // Restore collider when door is closed
        door.collider.min.y = door.position.y - 2
        door.collider.max.y = door.position.y + 2
      }
      
      return door.isOpen
    }
    
    return false
  }
  
  getObstacles(): THREE.Box3[] {
    const obstacles: THREE.Box3[] = []
    
    // Add wall colliders
    for (const wall of this.walls) {
      obstacles.push(wall.collider)
    }
    
    // Add door colliders for closed doors
    for (const door of this.doors) {
      if (!door.isOpen) {
        obstacles.push(door.collider)
      }
    }
    
    return obstacles
  }
  
  getEnemyColliders(): THREE.Box3[] {
    return this.enemies
      .filter(enemy => enemy.isActive)
      .map(enemy => enemy.collider)
  }
  
  getItemColliders(): THREE.Box3[] {
    return this.items.map(item => item.collider)
  }
}