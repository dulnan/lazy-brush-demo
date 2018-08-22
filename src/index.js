// Import styles
require('normalize.css/normalize.css')
require('./styles/index.scss')

// Import classes
import Scene from './classes/Scene'

// Init app
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas')
  const canvasDrawing = document.getElementById('canvasdrawing')

  const scene = new Scene(canvas, canvasDrawing)
})
