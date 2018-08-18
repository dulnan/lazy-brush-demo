import Position from './Position'

import { calculatePositionDifference, calculatePositionDistance, calculatePositionAngle, pointOutsideCircle, movePointAtAngle } from '../tools/helpers'


export default class Catenary {
  constructor (pB, pM, length, canvas) {
    this.context = canvas.getContext('2d')

    this.pB = pB
    this.pM = pM
    this.brushRadius = length

    this.difference = new Position(0, 0)
    this.distance = 0
    this.angle = 0

    this.curve = []
  }

  get length () {
    return this.brushRadius
  }

  updatePositionMouse (positionMouse) {
    // Find the difference of the mouse to the brush
    const difference = calculatePositionDifference(positionMouse, this.pB)

    // The distance between the position of the brush and the mouse
    const distance = calculatePositionDistance(difference)

    // If the mouse is outside the lazy area, update the position of the brush
    // if (pointOutsideCircle(positionMouse, this.pB, this.length)) {
    if (distance > this.length) {
      // Use the difference of the pointer to the brush to get the angle in radians
      const angle = calculatePositionAngle(difference)

      // Update the brush position by moving it by the distance minus radius.
      const newPositionBrush = movePointAtAngle(this.pB, angle, distance - this.length)
      this.pB.update(newPositionBrush)
      this.angle = angle
    }

    this.pM.update(positionMouse)
    this.difference = difference
    this.distance = distance
  }

  calculateCatenary () {
  }
}
