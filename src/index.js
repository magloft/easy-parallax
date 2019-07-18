import Stage from './Stage'
import Parallax from './Parallax'

export { Stage, Parallax }

export default function(win = window) {
  return new Stage(win)
}
