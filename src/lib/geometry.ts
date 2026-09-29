export const FT = 1

export function pitchAngle(pitch: number) {
  return Math.atan(pitch / 12)
}

export function roofRise(width: number, pitch: number) {
  return (width / 2) * (pitch / 12)
}

export function roofPanelLength(width: number, pitch: number, overhang = 0.9) {
  const halfRun = width / 2 + overhang
  return Math.sqrt(halfRun ** 2 + roofRise(width, pitch) ** 2)
}

export function formatFeet(value: number) {
  const whole = Math.floor(value)
  const inches = Math.round((value - whole) * 12)
  if (inches === 0) return `${whole}'`
  if (inches === 12) return `${whole + 1}'`
  return `${whole}' ${inches}"`
}

export function clampDimensions(width: number, depth: number, wallHeight: number) {
  return {
    width: Math.min(60, Math.max(16, width)),
    depth: Math.min(80, Math.max(16, depth)),
    wallHeight: Math.min(16, Math.max(8, wallHeight)),
  }
}
