import * as THREE from 'three'
import { Enemy } from './level'

export interface Weapon {
  name: string
  damage: number
  range: number
  fireRate: number
  ammoPerShot: number
  lastFired: number
  isReloading: boolean
  reloadTime: number
  image: string
}

export class WeaponSystem {
  weapons: Weapon[]
  currentWeaponIndex: number
  
  constructor() {
    this.weapons = [
      {
        name: 'Pistol',
        damage: 15,
        range: 20,
        fireRate: 500, // milliseconds between shots
        ammoPerShot: 1,
        lastFired: 0,
        isReloading: false,
        reloadTime: 1000, // milliseconds
        image: 'https://static.wikia.nocookie.net/doom/images/4/48/DoomPistol.png'
      },
      {
        name: 'Shotgun',
        damage: 40,
        range: 10,
        fireRate: 900,
        ammoPerShot: 2,
        lastFired: 0,
        isReloading: false,
        reloadTime: 1500,
        image: 'https://static.wikia.nocookie.net/doom/images/6/6a/Shotgun.png'
      }
    ]
    this.currentWeaponIndex = 0
  }
  
  getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex]
  }
  
  switchWeapon(index: number) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index
      return true
    }
    return false
  }
  
  canFire(): boolean {
    const weapon = this.getCurrentWeapon()
    const now = Date.now()
    return now - weapon.lastFired >= weapon.fireRate && !weapon.isReloading
  }
  
  fire(playerPosition: THREE.Vector3, playerDirection: THREE.Vector3, enemies: Enemy[], ammo: number): { hit: boolean, enemyIndex: number, ammoLeft: number } {
    const weapon = this.getCurrentWeapon()
    
    if (ammo < weapon.ammoPerShot || !this.canFire()) {
      return { hit: false, enemyIndex: -1, ammoLeft: ammo }
    }
    
    // Update last fired time
    weapon.lastFired = Date.now()
    
    // Reduce ammo
    const ammoLeft = ammo - weapon.ammoPerShot
    
    // Create ray for hit detection
    const raycaster = new THREE.Raycaster(
      playerPosition,
      playerDirection.normalize(),
      0,
      weapon.range
    )
    
    // Check for hits on enemies
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i]
      if (!enemy.isActive) continue
      
      // Create a box for the enemy
      const enemyBox = new THREE.Box3().copy(enemy.collider)
      
      // Check if ray intersects enemy box
      const intersects = raycaster.intersectBox(enemyBox, new THREE.Vector3())
      
      if (intersects) {
        return { hit: true, enemyIndex: i, ammoLeft }
      }
    }
    
    return { hit: false, enemyIndex: -1, ammoLeft }
  }
  
  startReload() {
    const weapon = this.getCurrentWeapon()
    weapon.isReloading = true
    
    setTimeout(() => {
      weapon.isReloading = false
    }, weapon.reloadTime)
  }
}