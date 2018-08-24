// Import styles
require('normalize.css/normalize.css')
require('./styles/index.scss')

// Import classes
import Scene from './classes/Scene'

// Init app
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas')
  const canvasDrawing = document.getElementById('canvasdrawing')
  const canvasTemp = document.getElementById('canvastemp')
  const canvasDebug = document.getElementById('canvasdebug')

  const rangeRadius = document.getElementById('rangeradius')
  const rangeLazy = document.getElementById('rangelazy')

  const checkboxLazy = document.getElementById('checkboxlazy')

  const buttonClear = document.getElementById('buttonclear')

  const scene = new Scene(canvas, canvasDrawing, canvastemp, canvasdebug, rangeRadius, rangeLazy, checkboxLazy, buttonClear)
})
