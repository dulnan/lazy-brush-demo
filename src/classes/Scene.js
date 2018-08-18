import Position from './Position'

import { calculatePositionDifference } from '../tools/helpers'

export default class Scene {
  constructor (catenary, canvas) {
    this.catenary = catenary
    this.canvas = canvas
    this.context = null

    this.width = 0
    this.height = 0

    this.currentMousePosition = new Position(0, 0)

    this.mouseHasMoved = false

    this.init()
  }

  init () {
    this.context = this.canvas.getContext('2d')

    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.canvas.style.width = window.innerWidth
    this.canvas.style.height = window.innerHeight

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseHasMoved = true
      this.currentMousePosition.update({ x: e.clientX, y: e.clientY })
    })

    this.loop()
  }

  loop () {
    if (this.mouseHasMoved) {
      this.catenary.updatePositionMouse(this.currentMousePosition)

      this.context.clearRect(0, 0, this.width, this.height)

      // Draw brush point
      this.context.beginPath()
      this.context.fillStyle = '#222222'
      this.context.arc(this.catenary.pB.x, this.catenary.pB.y, 20, 0, Math.PI * 2, true)
      this.context.fill()

      // Draw lazy circle
      this.context.beginPath()
      this.context.lineWidth = 1
      this.context.strokeStyle = '#cccccc'
      this.context.arc(this.catenary.pB.x, this.catenary.pB.y, this.catenary.length, 0, Math.PI * 2, true)
      this.context.stroke()

      // Draw catharina
      this.context.beginPath()
      this.context.lineWidth = 2
      this.context.lineCap = 'round'
      this.context.strokeStyle = '#cccccc'
      this.catenary.calculateCatenary()
      this.context.stroke()

      // Draw mouse point
      this.context.beginPath()
      this.context.fillStyle = '#222222'
      this.context.arc(this.catenary.pM.x, this.catenary.pM.y, 2, 0, Math.PI * 2, true)
      this.context.fill()

      this.mouseHasMoved = false
    }

    window.requestAnimationFrame(() => {
      this.loop()
    })
  }
}
