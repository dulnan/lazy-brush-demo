import { LazyBrush, Point } from 'lazy-brush'
import { Catenary } from 'catenary-curve'

const LAZY_RADIUS = 300

export default class Scene {
  constructor (canvas, canvasDrawing) {
    this.canvas = canvas
    this.canvasDrawing = canvasDrawing

    this.context = this.canvas.getContext('2d')
    this.contextDrawing = this.canvasDrawing.getContext('2d')

    this.catenary = new Catenary({
      chainLength: LAZY_RADIUS
    })
    this.lazy = new LazyBrush({ radius: LAZY_RADIUS })

    this.width = 0
    this.height = 0

    this.pBprev = new Point(0, 0)
    this.points = []

    this.mouseBuffer = new Point(0, 0)

    this.mouseHasMoved = false
    this.isDrawing = false

    this.startTime = 0

    this.counter = 0
    this.total = 0

    this.init()
  }

  init () {


    this.width = window.innerWidth
    this.height = window.innerHeight

    const canvases = ['canvas', 'canvasDrawing']

    canvases.forEach(c => {
      this[c].width = window.innerWidth
      this[c].height = window.innerHeight
      this[c].style.width = window.innerWidth
      this[c].style.height = window.innerHeight
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

    window.getData = () => {
      return {
        counter: this.counter,
        total: this.total,
        average: this.total / this.counter
      }
    }
  }

  loop () {
    if (this.mouseHasMoved) {
      const hasChanged = this.lazy.update(this.mouseBuffer)

      const pointer = this.lazy.getPointerCoordinates()
      const brush = this.lazy.getBrushCoordinates()
      const radius = this.lazy.getRadius()

      this.context.clearRect(0, 0, this.width, this.height)

      //Draw catharina
      this.context.beginPath()
      this.context.lineWidth = 2
      this.context.lineCap = 'round'
      this.context.strokeStyle = '#cccccc'

      const start = window.performance.now()
      this.catenary.drawToCanvas(this.context, brush, pointer)
      this.total += window.performance.now() - start
      this.counter++

      this.context.stroke()
      this.context.setLineDash([])

      // Draw brush point
      this.context.beginPath()
      this.context.fillStyle = '#222222'
      this.context.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true)
      this.context.fill()

      // Draw mouse point
      this.context.beginPath()
      this.context.fillStyle = '#222222'
      this.context.arc(pointer.x, pointer.y, 2, 0, Math.PI * 2, true)
      this.context.fill()

      this.mouseHasMoved = false
    }

    window.requestAnimationFrame(() => {
      this.loop()
    })
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
