# Doom-Inspired 3D FPS Browser Game

A 3D first-person shooter browser game inspired by Doom (1993), featuring a main menu, first-person controls, simple level design, basic enemy AI, a weapon system, HUD, and game over logic, using Three.js with React Three Fiber.

## Features

- Main menu with Play, Settings, and Quit buttons
- First-person controls (WASD + mouse look) with collision detection
- Simple level with:
  - Starting room
  - Corridor with functional door
  - Second room containing enemies
- Basic enemy AI that pursues and attacks player
- Weapon system with shooting mechanics
- HUD showing health and ammo
- Game over when health reaches 0
- Item pickups for health and ammo

## Controls

- **WASD**: Move
- **Mouse**: Look around
- **Left Click**: Shoot
- **E**: Interact with doors
- **ESC**: Pause/unlock mouse

## Development

This project is built with:
- React
- Three.js
- React Three Fiber
- React Three Drei
- TypeScript
- Vite

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser to the local development URL

## Building for Production

To build the game for production:

```
npm run build
```

## Credits

This game is inspired by the classic Doom (1993) by id Software.