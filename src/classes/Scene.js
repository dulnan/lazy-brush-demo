import { LazyBrush, Point } from 'lazy-brush'
import { Catenary } from 'catenary-curve'

const LAZY_RADIUS = 300

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

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

    this.points = []
    this.prevBrush = new Point(0, 0)

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

    this.contextDrawing.lineWidth = 20
    this.contextDrawing.lineJoin = 'round'
    this.contextDrawing.lineCap = 'round'


    window.addEventListener('mousedown', (e) => {
      this.isDrawing = true
      this.points.push({ x: e.clientX, y: e.clientY })
    })

    window.addEventListener('mouseup', (e) => {
      this.isDrawing = false
      this.points.length = 0
    })

    window.addEventListener('mousemove', (e) => {
      const hasChanged = this.lazy.update({ x: e.clientX, y: e.clientY })
      this.mouseHasMoved = true

      if (this.isDrawing && this.lazy.hasMoved()) {
        this.points.push(this.lazy.brush.toObject())

        var p1 = this.points[0]
        var p2 = this.points[1]
        
        this.contextDrawing.moveTo(p2.x, p2.y)
        this.contextDrawing.beginPath()

        for (var i = 1, len = this.points.length; i < len; i++) {
          // we pick the point between pi+1 & pi+2 as the
          // end point and p1 as our control point
          var midPoint = midPointBtw(p1, p2)
          this.contextDrawing.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          p1 = this.points[i]
          p2 = this.points[i+1];
        }
        // Draw last line as a straight line while
        // we wait for the next point to be able to calculate
        // the bezier control point
        // this.contextDrawing.lineTo(p1.x, p1.y)
        this.contextDrawing.stroke()
      }
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
