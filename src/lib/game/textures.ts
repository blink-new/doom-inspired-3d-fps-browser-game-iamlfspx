// Texture loader for the game
import * as THREE from 'three'

// Create a texture loader
const textureLoader = new THREE.TextureLoader()

// Load textures
export const loadTextures = () => {
  const textures = {
    wall: textureLoader.load('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop'),
    floor: textureLoader.load('https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?q=80&w=1000&auto=format&fit=crop'),
    ceiling: textureLoader.load('https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=1000&auto=format&fit=crop'),
  }
  
  return textures
}

// Apply texture to material
export const applyTexture = (material: THREE.Material, texture: THREE.Texture) => {
  if (material instanceof THREE.MeshStandardMaterial) {
    material.map = texture
    material.needsUpdate = true
  }
}