import { LazyBrush, Point } from 'lazy-brush'
import { Catenary } from 'catenary-curve'

const LAZY_RADIUS = 160
const COLOR_RED = '#ff3a29'
const BRUSH_RADIUS = 10

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

export default class Scene {
  constructor (canvas, canvasDrawing, canvasTemp, canvasDebug) {
    this.canvas = canvas
    this.canvasDrawing = canvasDrawing
    this.canvasTemp = canvasTemp
    this.canvasDebug = canvasDebug

    this.context = this.canvas.getContext('2d')
    this.contextDrawing = this.canvasDrawing.getContext('2d')
    this.contextTemp = this.canvasTemp.getContext('2d')
    this.contextDebug = this.canvasDebug.getContext('2d')

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
    this.isPressing = false

    this.startTime = 0

    this.points = []
    this.prevBrush = new Point(0, 0)

    this.init()
  }

  init () {
    this.width = window.innerWidth
    this.height = window.innerHeight

    const canvases = ['canvas', 'canvasDrawing', 'canvasTemp']

    canvases.forEach(c => {
      this[c].width = window.innerWidth
      this[c].height = window.innerHeight
      this[c].style.width = window.innerWidth
      this[c].style.height = window.innerHeight
    })

    const debugRect = this.canvasDebug.getBoundingClientRect()
    this.canvasDebug.width = debugRect.width
    this.canvasDebug.height = debugRect.height
    this.canvasDebug.style.width = debugRect.width
    this.canvasDebug.style.height = debugRect.height

    this.contextTemp.lineWidth = BRUSH_RADIUS * 2
    this.contextTemp.lineJoin = 'round'
    this.contextTemp.lineCap = 'round'
    this.contextTemp.strokeStyle = COLOR_RED


    window.addEventListener('mousedown', (e) => {
      this.isPressing = true
    })

    window.addEventListener('mouseup', (e) => {
      this.isDrawing = false
      this.isPressing = false
      this.points.length = 0
      this.contextDrawing.drawImage(this.canvasTemp, 0, 0)
    })

    window.addEventListener('mousemove', (e) => {
      const hasChanged = this.lazy.update({ x: e.clientX, y: e.clientY })

      if (this.isPressing && hasChanged && !this.isDrawing) {
        this.isDrawing = true
        this.points.push(this.lazy.brush.toObject())
      }

      if (this.isDrawing && this.lazy.hasMoved()) {

        this.contextTemp.clearRect(0, 0, this.width, this.height)
        this.points.push(this.lazy.brush.toObject())

        var p1 = this.points[0]
        var p2 = this.points[1]

        this.contextTemp.moveTo(p2.x, p2.y)
        this.contextTemp.beginPath()

        for (var i = 1, len = this.points.length; i < len; i++) {
          // we pick the point between pi+1 & pi+2 as the
          // end point and p1 as our control point
          var midPoint = midPointBtw(p1, p2)
          this.contextTemp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          p1 = this.points[i]
          p2 = this.points[i+1];
        }
        // Draw last line as a straight line while
        // we wait for the next point to be able to calculate
        // the bezier control point
        this.contextTemp.lineTo(p1.x, p1.y)
        this.contextTemp.stroke()
      }

      this.mouseHasMoved = true
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
      const pointer = this.lazy.getPointerCoordinates()
      const brush = this.lazy.getBrushCoordinates()
      const angle = this.lazy.getAngle()
      const radius = this.lazy.getRadius()
      const hasMoved = this.lazy.hasMoved()
      const distance = this.lazy.getDistance()

      this.drawInterface(this.context, pointer, brush)
      this.drawDebug(this.contextDebug, pointer, brush, angle, hasMoved, distance, radius)
      this.mouseHasMoved = false
    }

    window.requestAnimationFrame(() => {
      this.loop()
    })
  }

  drawDebug (ctx, pointer, brush, angle, hasMoved, distance, radius) {
    const degrees = angle * 180 / Math.PI
    console.log(degrees)
    const w = ctx.canvas.width
    const h = ctx.canvas.height

    ctx.clearRect(0, 0, w, h)

    ctx.beginPath()
    ctx.setLineDash([2, 4])
    ctx.lineWidth = 1
    ctx.strokeStyle = '#bbb'

    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)

    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)

    ctx.stroke()
    ctx.setLineDash([])

    // Brush
    ctx.beginPath()
    ctx.fillStyle = '#222222'
    ctx.arc(w / 2, h / 2, BRUSH_RADIUS, 0, Math.PI * 2, true)
    ctx.fill()

    // Lazy Area
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    // ctx.setLineDash([2, 4])
    if (distance > radius) {
      ctx.strokeStyle = '#444'
    } else {
      ctx.strokeStyle = '#bbb'
    }
    ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2, true)
    ctx.stroke()

    // Pointer
    const pX = (w / 2) - (brush.x - pointer.x)
    const pY = (h / 2) - (brush.y - pointer.y)
    ctx.beginPath()
    ctx.fillStyle = '#00FFFF'
    ctx.arc(pX, pY, 4, 0, Math.PI * 2, true)
    ctx.fill()

    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#444'
    ctx.moveTo(w / 2, h / 2)
    ctx.lineTo(pX, pY)
    ctx.stroke()
  }

  drawInterface (ctx, pointer, brush) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw brush point
    ctx.beginPath()
    ctx.fillStyle = COLOR_RED
    ctx.arc(brush.x, brush.y, BRUSH_RADIUS, 0, Math.PI * 2, true)
    ctx.fill()

    // Draw mouse point
    ctx.beginPath()
    ctx.fillStyle = '#222222'
    ctx.arc(pointer.x, pointer.y, 2, 0, Math.PI * 2, true)
    ctx.fill()

    //Draw catharina
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.setLineDash([2, 4])
    ctx.strokeStyle = '#444'
    this.catenary.drawToCanvas(this.context, brush, pointer)
    ctx.stroke()

    // Draw mouse point
    ctx.beginPath()
    ctx.fillStyle = '#222222'
    ctx.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true)
    ctx.fill()
  }
}
