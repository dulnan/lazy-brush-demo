import { LazyBrush } from 'lazy-brush'

export default class Catenary {
  constructor () {
    this.curve = []
  }

  calculateCatenary (p1, p2, length) {
    const v = Math.abs(p1.y - p2.y)
    const h = Math.abs(p1.x - p2.y)
    const s = Math.sqrt(v * v + h * h) + length // minimum length + user defined length
  }

  ctn (a, x) {
    return a * Math.cosh(x / a)
  }

  f (a) {
    return Math.sqrt(s * s - v * v) - 2 * a * Math.sinh(h / (2 * a))
  }

  f_sq (a) {
    return this.f(a) * this.f(a)
  }
}
