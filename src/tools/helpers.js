import Position from '../classes/Position'

export function pointOutsideCircle (p, c, r) {
  const distancesqured = (p.x - c.x) * (p.x - c.x) + (p.y - c.y) * (p.y - c.y)
  return distancesqured >= r * r
}

export function movePointAtAngle (point, angle, distance) {
  return {
    x: point.x + (Math.cos(angle) * distance),
    y: point.y + (Math.sin(angle) * distance)
  }
}

export function calculatePositionDifference (p1, p2) {
  return new Position(p1.x - p2.x, p1.y - p2.y)
}

export function calculatePositionDistance (p) {
  return Math.sqrt(p.x * p.x + p.y * p.y)
}

export function calculatePositionAngle (p) {
  return Math.atan2(p.y, p.x)
}
