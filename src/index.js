// Import styles
require('normalize.css/normalize.css')
require('./styles/index.scss')

// Import classes
import Position from './classes/Position'
import Catenary from './classes/Catenary'
import Scene from './classes/Scene'

// Define global constants
const ROPE_LENGTH = 120
const LAZY_RADIUS = ROPE_LENGTH

// Init app
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas')

  let brushPos = new Position(0, 0)
  let mousePos = new Position(0, 0)

  let catenary = new Catenary(brushPos, mousePos, ROPE_LENGTH, canvas)
  let scene = new Scene(catenary, canvas)
})
