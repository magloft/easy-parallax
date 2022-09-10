import { Parallax } from './Parallax'
import { Stage } from './Stage'

export { Stage, Parallax }

export function EasyParallax(win = window) {
  return new Stage(win)
}
