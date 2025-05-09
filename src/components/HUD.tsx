import React from 'react'

interface HUDProps {
  health: number
  ammo: number
}

const HUD: React.FC<HUDProps> = ({ health, ammo }) => {
  return (
    <div className="hud">
      <div className="health">
        <span>HEALTH:</span>
        <span className="health-value">{health}</span>
      </div>
      <div className="ammo">
        <span>AMMO:</span>
        <span className="ammo-value">{ammo}</span>
      </div>
    </div>
  )
}

export default HUD