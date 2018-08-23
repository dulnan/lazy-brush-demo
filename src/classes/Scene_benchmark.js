import { LazyBrush, Point } from 'lazy-brush'
import { Catenary } from 'catenary-curve'

const LAZY_RADIUS = 100

export default class Scene {
  constructor (canvas, canvasDrawing) {
    this.canvas = canvas
    this.canvasDrawing = canvasDrawing

    this.context = this.canvas.getContext('2d')
    this.contextDrawing = this.canvasDrawing.getContext('2d')

    this.catenary = new Catenary()
    this.lazy = new LazyBrush({ radius: LAZY_RADIUS })

    this.width = 0
    this.height = 0

    this.pBprev = new Point(0, 0)
    this.points = []

    this.mouseBuffer = new Point(0, 0)

    this.mouseHasMoved = false
    this.isDrawing = false

    this.count = 0
    this.total = LAZY_RADIUS * LAZY_RADIUS

    this.startTime = 0

    this.longOnes = []

    this.init()
  }

  init () {


    this.width = window.innerWidth
    this.height = window.innerHeight

    const canvases = ['canvas', 'canvasDrawing']

    canvases.forEach(c => {
      this[c].width = LAZY_RADIUS
      this[c].height = LAZY_RADIUS
      this[c].style.width = LAZY_RADIUS
      this[c].style.height = LAZY_RADIUS
    })

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true
    })

    this.canvas.addEventListener('mouseup', (e) => {
      this.isDrawing = false
    })

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseHasMoved = true
      this.mouseBuffer.x = e.clientX
      this.mouseBuffer.y = e.clientY
    })

    this.startTime = window.performance.now();
    this.loop()
  }

  loop () {
    for (var i = 0; i < this.total; i++) {
    //const hasChanged = this.lazy.update(this.mouseBuffer)

    // const pointer = this.lazy.getPointerCoordinates()
    // const brush = this.lazy.getBrushCoordinates()
    const radius = this.lazy.getRadius()

      const x = i % LAZY_RADIUS
      const y = Math.round(i / LAZY_RADIUS)
    const pointer = {x: x, y: y }
    const brush = { x: LAZY_RADIUS / 2, y: LAZY_RADIUS / 2}

    this.count++

    // this.context.clearRect(0, 0, this.width, this.height)

    // Draw catharina
    // this.context.beginPath()
    // this.context.lineWidth = 1
    // this.context.lineCap = 'round'
    // this.context.strokeStyle = '#cccccc'
    // this.context.setLineDash([1,6])


    const start = window.performance.now();
    this.catenary.drawToCanvas(brush, pointer, radius, this.context)
    const stepDuration = window.performance.now() - start

      if (stepDuration > 0.8) {
        this.longOnes.push({
          x, y, stepDuration
        })
      }

    // this.context.stroke()
    // this.context.setLineDash([])

    // Draw brush point
    // this.context.beginPath()
    // this.context.fillStyle = '#222222'
    // this.context.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true)
    // this.context.fill()

    // Draw mouse point
    // this.context.beginPath()
    // this.context.fillStyle = '#222222'
    // this.context.arc(pointer.x, pointer.y, 2, 0, Math.PI * 2, true)
    // this.context.fill()
      // window.requestAnimationFrame(() => {
      // })
    }
      const duration = window.performance.now() - this.startTime

      const result = {
        segments: 0,
        matrix: LAZY_RADIUS,
        total: this.total,
        duration: duration,
        average: duration / this.total,
        longOnes: this.longOnes
      }

      console.log(JSON.stringify(result))
  }

  draw () {
    this.context.beginPath()
    this.context.lineWidth = 2
    this.context.lineCap = 'round'
    this.context.strokeStyle = '#cccccc'
    this.catenary.calculateCatenary()
    this.context.stroke()
  }
}
