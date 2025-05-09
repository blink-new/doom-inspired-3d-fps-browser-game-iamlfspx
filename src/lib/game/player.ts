import * as THREE from 'three'

export interface PlayerState {
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3
  health: number
  ammo: number
  isMoving: boolean
  isJumping: boolean
  isShooting: boolean
}

export class Player {
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3
  health: number
  ammo: number
  height: number
  speed: number
  mouseSensitivity: number
  isMoving: boolean
  isJumping: boolean
  isShooting: boolean
  camera: THREE.PerspectiveCamera
  collider: THREE.Box3
  
  constructor(camera: THREE.PerspectiveCamera, mouseSensitivity: number = 0.5) {
    this.position = new THREE.Vector3(0, 1.6, 0)
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ')
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.health = 100
    this.ammo = 50
    this.height = 1.6
    this.speed = 5
    this.mouseSensitivity = mouseSensitivity
    this.isMoving = false
    this.isJumping = false
    this.isShooting = false
    this.camera = camera
    this.collider = new THREE.Box3(
      new THREE.Vector3(-0.3, 0, -0.3),
      new THREE.Vector3(0.3, this.height, 0.3)
    )
    
    // Set initial camera position
    this.updateCamera()
    
    // Set up mouse movement handler
    this.setupMouseControls()
  }
  
  // Set up mouse movement handler
  setupMouseControls() {
    // Use a proper bound function to ensure 'this' context is preserved
    this._handleMouseMove = this._handleMouseMove.bind(this);
    
    // Remove any existing event listeners to prevent duplicates
    document.removeEventListener('mousemove', this._handleMouseMove);
    
    // Add the event listener
    document.addEventListener('mousemove', this._handleMouseMove);
    
    console.log('Mouse controls set up with proper binding');
  }
  
  // Private method for mouse movement handling
  _handleMouseMove(event: MouseEvent) {
    // Only process mouse movement if pointer is locked
    if (document.pointerLockElement) {
      console.log(`Mouse movement detected: X=${event.movementX}, Y=${event.movementY}`);
      this.rotate(event.movementX, event.movementY);
    }
  }
  
  // Handle mouse movement for looking around (public method kept for compatibility)
  handleMouseMove(event: MouseEvent) {
    this._handleMouseMove(event);
  }
  
  updateCamera() {
    this.camera.position.copy(this.position)
    this.camera.rotation.copy(this.rotation)
  }
  
  move(direction: THREE.Vector3, delta: number) {
    // Apply movement in the direction the player is facing
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation)
    const right = new THREE.Vector3(1, 0, 0).applyEuler(this.rotation)
    
    const moveX = direction.x * this.speed * delta
    const moveZ = direction.z * this.speed * delta
    
    this.velocity.x = right.x * moveX + forward.x * moveZ
    this.velocity.z = right.z * moveX + forward.z * moveZ
    
    this.position.x += this.velocity.x
    this.position.z += this.velocity.z
    
    this.isMoving = moveX !== 0 || moveZ !== 0
    
    this.updateCamera()
  }
  
  rotate(deltaX: number, deltaY: number) {
    // Apply mouse sensitivity
    deltaX *= this.mouseSensitivity
    deltaY *= this.mouseSensitivity
    
    // Update rotation
    this.rotation.y -= deltaX * 0.01
    this.rotation.x -= deltaY * 0.01
    
    // Clamp vertical rotation to prevent flipping
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x))
    
    this.updateCamera()
  }
  
  shoot() {
    if (this.ammo > 0) {
      this.ammo--
      this.isShooting = true
      
      // Reset shooting state after a short delay
      setTimeout(() => {
        this.isShooting = false
      }, 200)
      
      return true
    }
    
    return false
  }
  
  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
    return this.health <= 0
  }
  
  addAmmo(amount: number) {
    this.ammo += amount
  }
  
  addHealth(amount: number) {
    this.health = Math.min(100, this.health + amount)
  }
  
  getState(): PlayerState {
    return {
      position: this.position.clone(),
      rotation: this.rotation.clone(),
      velocity: this.velocity.clone(),
      health: this.health,
      ammo: this.ammo,
      isMoving: this.isMoving,
      isJumping: this.isJumping,
      isShooting: this.isShooting
    }
  }
  
  checkCollision(obstacles: THREE.Box3[]): boolean {
    // Update collider position
    this.collider.setFromCenterAndSize(
      new THREE.Vector3(
        this.position.x,
        this.position.y - this.height / 2,
        this.position.z
      ),
      new THREE.Vector3(0.6, this.height, 0.6)
    )
    
    // Check for collisions with obstacles
    for (const obstacle of obstacles) {
      if (this.collider.intersectsBox(obstacle)) {
        return true
      }
    }
    
    return false
  }
}