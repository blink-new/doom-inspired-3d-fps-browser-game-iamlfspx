import * as THREE from 'three'
import { Enemy } from './level'

export class EnemyController {
  enemies: Enemy[]
  playerPosition: THREE.Vector3
  detectionRange: number
  attackRange: number
  moveSpeed: number
  attackDamage: number
  attackCooldown: number
  lastAttackTime: number
  
  constructor(enemies: Enemy[]) {
    this.enemies = enemies
    this.playerPosition = new THREE.Vector3()
    this.detectionRange = 15
    this.attackRange = 2
    this.moveSpeed = 2
    this.attackDamage = 10
    this.attackCooldown = 1000 // 1 second
    this.lastAttackTime = 0
  }
  
  update(playerPosition: THREE.Vector3, delta: number, obstacles: THREE.Box3[]): number {
    this.playerPosition.copy(playerPosition)
    let damageToPlayer = 0
    
    for (const enemy of this.enemies) {
      if (!enemy.isActive) continue
      
      const distanceToPlayer = enemy.position.distanceTo(this.playerPosition)
      
      // Check if player is within detection range
      if (distanceToPlayer <= this.detectionRange) {
        // Move towards player if not in attack range
        if (distanceToPlayer > this.attackRange) {
          this.moveTowardsPlayer(enemy, delta, obstacles)
        } 
        // Attack player if in range and cooldown is over
        else if (distanceToPlayer <= this.attackRange) {
          const now = Date.now()
          if (now - this.lastAttackTime >= this.attackCooldown) {
            damageToPlayer += this.attackDamage
            this.lastAttackTime = now
          }
        }
      }
    }
    
    return damageToPlayer
  }
  
  moveTowardsPlayer(enemy: Enemy, delta: number, obstacles: THREE.Box3[]) {
    // Calculate direction to player
    const direction = new THREE.Vector3()
      .subVectors(this.playerPosition, enemy.position)
      .normalize()
    
    // Calculate new position
    const newPosition = enemy.position.clone()
    newPosition.x += direction.x * this.moveSpeed * delta
    newPosition.z += direction.z * this.moveSpeed * delta
    
    // Update collider for collision detection
    const oldCollider = enemy.collider.clone()
    
    // Temporarily update collider to check for collisions
    enemy.collider.setFromCenterAndSize(
      new THREE.Vector3(
        newPosition.x,
        enemy.position.y,
        newPosition.z
      ),
      new THREE.Vector3(1, 2, 1)
    )
    
    // Check for collisions with obstacles
    let hasCollision = false
    for (const obstacle of obstacles) {
      if (enemy.collider.intersectsBox(obstacle)) {
        hasCollision = true
        break
      }
    }
    
    if (!hasCollision) {
      // If no collision, update the enemy position
      enemy.position.copy(newPosition)
    } else {
      // If collision, restore the old collider
      enemy.collider.copy(oldCollider)
    }
  }
  
  takeDamage(enemyIndex: number, damage: number): boolean {
    if (enemyIndex >= 0 && enemyIndex < this.enemies.length) {
      const enemy = this.enemies[enemyIndex]
      enemy.health -= damage
      
      if (enemy.health <= 0) {
        enemy.isActive = false
        return true
      }
    }
    
    return false
  }
  
  getActiveEnemies(): Enemy[] {
    return this.enemies.filter(enemy => enemy.isActive)
  }
}