import styleVariables from '!!sass-variable-loader!./../styles/_variables.scss'

import { LazyBrush, Point } from 'lazy-brush'
import { Catenary } from 'catenary-curve'

import ResizeObserver from 'resize-observer-polyfill'

const LAZY_RADIUS = 60
const BRUSH_RADIUS = 12.5

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

export default class Scene {
  constructor ({ canvasContainer, sidebar, canvas, slider, button }) {
    this.sidebar = document.getElementById(sidebar)
    this.canvasContainer = document.getElementById(canvasContainer)

    this.button = {}
    Object.keys(button).forEach(b => {
      this.button[b] = document.getElementById(button[b])
    })

    this.slider = {}
    Object.keys(slider).forEach(s => {
      this.slider[s] = document.getElementById(slider[s])
    })

    this.canvas = {}
    this.context = {}
    Object.keys(canvas).forEach(c => {
      const el = document.getElementById(canvas[c])
      this.canvas[c] = el
      this.context[c] = el.getContext('2d')
    })

    this.catenary = new Catenary()

    this.lazy = new LazyBrush({
      radius: LAZY_RADIUS,
      enabled: true,
      initialPoint: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    })

    this.points = []

    this.mouseHasMoved = true
    this.valuesChanged = true
    this.isDrawing = false
    this.isPressing = false

    this.points = []

    this.brushRadius = BRUSH_RADIUS
    this.chainLength = LAZY_RADIUS
  }

  init () {
    // Listeners for mouse events
    this.canvas.interface.addEventListener('mousedown', this.handlePointerDown.bind(this))
    this.canvas.interface.addEventListener('mouseup', this.handlePointerUp.bind(this))
    this.canvas.interface.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY))
    this.canvas.interface.addEventListener('contextmenu', (e) => this.handleContextMenu(e))

    // Listeners for touch events
    this.canvas.interface.addEventListener('touchstart', (e) => this.handleTouchStart(e))
    this.canvas.interface.addEventListener('touchend', (e) => this.handleTouchEnd(e))
    this.canvas.interface.addEventListener('touchmove', (e) => this.handleTouchMove(e))

    // Listeners for click events on butons
    this.button.menu.addEventListener('click', (e) => this.handleButtonMenu(e))
    this.button.clear.addEventListener('click', (e) => this.handleButtonClear(e))
    this.button.lazy.addEventListener('click', (e) => this.handleButtonLazy(e))

    // Listeners for input events on range sliders
    this.slider.brush.addEventListener('input', (e) => this.handleSliderBrush(e))
    this.slider.lazy.addEventListener('input', (e) => this.handleSliderLazy(e))

    // Set initial value for range sliders
    this.slider.brush.value = BRUSH_RADIUS
    this.slider.lazy.value = LAZY_RADIUS

    const observeCanvas = new ResizeObserver((entries, observer) => this.handleCanvasResize(entries, observer))
    observeCanvas.observe(this.canvasContainer)

    const observeSidebar = new ResizeObserver((entries, observer) => this.handleSidebarResize(entries, observer))
    observeSidebar.observe(this.sidebar)

    this.loop()

    window.setTimeout(() => {
      const initX = window.innerWidth / 2
      const initY = window.innerHeight / 2
      this.lazy.update({x: initX - (this.chainLength  / 4), y: initY}, { both: true })
      this.lazy.update({x: initX + (this.chainLength  / 4), y: initY}, { both: false })
      this.mouseHasMoved = true
      this.valuesChanged = true
      this.clearCanvas()
    }, 100)
  }

  handleTouchStart (e) {
    const x = e.changedTouches[0].clientX
    const y = e.changedTouches[0].clientY
    this.lazy.update({x: x, y: y}, { both: true })
    this.handlePointerDown(e)

    this.mouseHasMoved = true
  }

  handleTouchMove (e) {
    e.preventDefault()
    this.handlePointerMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
  }

  handleTouchEnd (e) {
    this.handlePointerUp(e)
    const brush = this.lazy.getBrushCoordinates()
    this.lazy.update({x: brush.x, y: brush.y}, { both: true })
    this.mouseHasMoved = true

  }

  handleContextMenu (e) {
    e.preventDefault()
    if (e.button === 2) {
      this.clearCanvas()
    }
  }

  handleButtonMenu (e) {
    e.preventDefault()
    document.body.classList.toggle('menu-visible')
  }

  handleButtonClear (e) {
    e.preventDefault()
    this.clearCanvas()
  }

  handleButtonLazy (e) {
    e.preventDefault()
    this.valuesChanged = true
    this.button.lazy.classList.toggle('disabled')

    if (this.lazy.isEnabled()) {
      this.button.lazy.innerHTML = 'Off'
      this.lazy.disable()
    } else {
      this.button.lazy.innerHTML = 'On'
      this.lazy.enable()
    }
  }

  handleSidebarResize (entries, observer) {
    for (const entry of entries) {
      const {left, top, width, height} = entry.contentRect
      this.setCanvasSize(this.canvas.debug, width, width)
      this.loop({ once: true })
    }
  }

  handleCanvasResize (entries, observer) {
    for (const entry of entries) {
      const {left, top, width, height} = entry.contentRect
      console.log(height)
      this.setCanvasSize(this.canvas.interface, width, height)
      this.setCanvasSize(this.canvas.drawing, width, height)
      this.setCanvasSize(this.canvas.temp, width, height)
      this.setCanvasSize(this.canvas.grid, width, height)

      this.drawGrid(this.context.grid)
      this.loop({ once: true })
    }
  }

  handleSliderBrush (e) {
    const val = parseInt(e.target.value)
    this.valuesChanged = true
    this.brushRadius = val
  }

  handleSliderLazy (e) {
    this.valuesChanged = true
    const val = parseInt(e.target.value)
    this.chainLength = val
    this.lazy.setRadius(val)
  }

  setCanvasSize (canvas, width, height) {
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = width
    canvas.style.height = height
    canvas.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio)
  }

  handlePointerDown (e) {
    e.preventDefault()
    this.isPressing = true
  }

  handlePointerUp (e) {
    e.preventDefault()
    this.isDrawing = false
    this.isPressing = false
    this.points.length = 0

    const width = this.canvas.temp.width / window.devicePixelRatio
    const height = this.canvas.temp.height / window.devicePixelRatio

    this.context.drawing.drawImage(this.canvas.temp, 0, 0, width, height)
    this.context.temp.clearRect(0, 0, width, height)
  }

  handlePointerMove (x, y) {
    const hasChanged = this.lazy.update({ x: x, y: y})
    const isDisabled = !this.lazy.isEnabled()

    this.context.temp.lineJoin = 'round'
    this.context.temp.lineCap = 'round'
    this.context.temp.strokeStyle = styleVariables.colorPrimary

    if ((this.isPressing && hasChanged && !this.isDrawing) || (isDisabled && this.isPressing)) {
      this.isDrawing = true
      this.points.push(this.lazy.brush.toObject())
    }

    if (this.isDrawing && (this.lazy.brushHasMoved() || isDisabled)) {

      this.context.temp.clearRect(0, 0, this.context.temp.canvas.width, this.context.temp.canvas.height)
      this.context.temp.lineWidth = this.brushRadius * 2
      this.points.push(this.lazy.brush.toObject())

      var p1 = this.points[0]
      var p2 = this.points[1]

      this.context.temp.moveTo(p2.x, p2.y)
      this.context.temp.beginPath()

      for (var i = 1, len = this.points.length; i < len; i++) {
        // we pick the point between pi+1 & pi+2 as the
        // end point and p1 as our control point
        var midPoint = midPointBtw(p1, p2)
        this.context.temp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = this.points[i]
        p2 = this.points[i+1];
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      this.context.temp.lineTo(p1.x, p1.y)
      this.context.temp.stroke()
    }

    this.mouseHasMoved = true
  }

  clearCanvas () {
    this.valuesChanged = true
    this.context.drawing.clearRect(0, 0, this.canvas.drawing.width, this.canvas.drawing.height)
    this.context.temp.clearRect(0, 0, this.canvas.temp.width, this.canvas.temp.height)
  }

  loop ({ once = false } = {}) {
    if (this.mouseHasMoved || this.valuesChanged) {
      const pointer = this.lazy.getPointerCoordinates()
      const brush = this.lazy.getBrushCoordinates()
      const angle = this.lazy.getAngle()
      const radius = this.lazy.getRadius()
      const hasMoved = this.lazy.brushHasMoved()
      const distance = this.lazy.getDistance()

      this.drawInterface(this.context.interface, pointer, brush)
      this.drawDebug(this.context.debug, pointer, brush, angle, hasMoved, distance, radius)
      this.mouseHasMoved = false
      this.valuesChanged = false
    }

    if (!once) {
      window.requestAnimationFrame(() => {
        this.loop()
      })
    }
  }

  drawDebug (ctx, pointer, brush, angle, hasMoved, distance, radius) {
    const degrees = angle * 180 / Math.PI
    const w = ctx.canvas.width / window.devicePixelRatio
    const h = ctx.canvas.height / window.devicePixelRatio

    ctx.clearRect(0, 0, w, h)

    ctx.beginPath()
    // ctx.setLineDash([2, 4])
    ctx.lineWidth = 1
    ctx.strokeStyle = styleVariables.colorDebugGrid

    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)

    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)

    ctx.moveTo(0, 0)
    ctx.lineTo(w, 0)
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.lineTo(0, 0)

    ctx.stroke()
    ctx.setLineDash([])

    // Brush
    ctx.beginPath()
    ctx.strokeStyle = styleVariables.colorDebugGrid
    ctx.arc(w / 2, h / 2, this.brushRadius, 0, Math.PI * 2, true)
    ctx.stroke()

    // Lazy Area
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    if (distance > radius) {
      ctx.strokeStyle = styleVariables.colorDebugLazyActive
      ctx.setLineDash([])
    } else {
      ctx.strokeStyle = styleVariables.colorDebugLazy
      ctx.setLineDash([2, 4])
    }
    ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.setLineDash([])

    // Pointer
    const pX = (w / 2) - (brush.x - pointer.x)
    const pY = (h / 2) - (brush.y - pointer.y)
    ctx.beginPath()
    ctx.fillStyle = styleVariables.colorDebugPointer
    ctx.arc(pX, pY, 3, 0, Math.PI * 2, true)
    ctx.fill()

    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#444'
    ctx.moveTo(w / 2, h / 2)
    ctx.lineTo(pX, pY)
    ctx.stroke()
  }

  drawGrid (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.beginPath()
    ctx.setLineDash([5,1])
    // ctx.setLineDash([])
    // ctx.strokeStyle = styleVariables.colorInterfaceGrid
    ctx.strokeStyle = 'rgba(150,150,150,0.11)'
    ctx.lineWidth = 1

    const gridSize = 25

    let countX = 0
    while (countX < ctx.canvas.width) {
      countX += gridSize
      ctx.moveTo(countX, 0)
      ctx.lineTo(countX, ctx.canvas.height)
    }
    ctx.stroke()

    let countY = 0
    while (countY < ctx.canvas.height) {
      countY += gridSize
      ctx.moveTo(0, countY)
      ctx.lineTo(ctx.canvas.width, countY)
    }
    ctx.stroke()
  }

  drawInterface (ctx, pointer, brush) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw brush point
    ctx.beginPath()
    ctx.fillStyle = styleVariables.colorPrimary
    ctx.arc(brush.x, brush.y, this.brushRadius, 0, Math.PI * 2, true)
    ctx.fill()

    // Draw mouse point
    ctx.beginPath()
    ctx.fillStyle = styleVariables.colorWhite
    ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2, true)
    ctx.fill()

    //Draw catharina
    if (this.lazy.isEnabled()) {
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.setLineDash([2, 4])
      ctx.strokeStyle = styleVariables.colorCatenary
      this.catenary.drawToCanvas(this.context.interface, brush, pointer, this.chainLength)
      ctx.stroke()
    }

    // Draw mouse point
    ctx.beginPath()
    ctx.fillStyle = '#222222'
    ctx.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true)
    ctx.fill()
  }
}
