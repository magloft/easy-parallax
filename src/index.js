import Stage from './Stage'
import Parallax from './Parallax'

export { Stage, Parallax }

export function EasyParallax(win = window) {
  return new Stage(win)
}
