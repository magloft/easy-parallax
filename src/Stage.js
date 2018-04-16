import { requestAnimationFrame } from './Helpers'
import Parallax from './Parallax'

class Stage {
  constructor(window) {
    this.window = window
    this.document = window.document
    this.instanceID = 0
    this.parallaxList = []
    this.width = null
    this.height = null
    this.scrollTop = null
    this.forceResizeParallax = false
    this.oldPageData = false
    this.window.addEventListener('resize', () => {
      this.calculateLayout()
    })
    this.window.addEventListener('orientationchange', () => {
      this.calculateLayout()
    })
  }

  nextInstanceID() {
    this.instanceID += 1
    return this.instanceID
  }

  add(element, options = {}) {
    const parallax = new Parallax(this, element, options)
    this.update()
    return parallax
  }

  update() {
    this.calculateLayout()
    this.forceResizeParallax = true
  }

  addToParallaxList(instance) {
    this.parallaxList.push(instance)
    if (this.parallaxList.length === 1) {
      this.updateParallax()
    }
  }

  removeFromParallaxList(instance) {
    this.parallaxList.forEach((item, key) => {
      if (item.instanceID === instance.instanceID) {
        this.parallaxList.splice(key, 1)
      }
    })
  }

  destroy() {
    for (let i = this.parallaxList.length - 1; i >= 0; i -= 1) {
      this.parallaxList[i].destroy()
    }
  }

  updateParallax() {
    if (!this.parallaxList.length) {
      return
    }
    if (this.window.pageYOffset !== undefined) {
      this.scrollTop = this.window.pageYOffset
    } else {
      this.scrollTop = (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollTop
    }
    const isResized = this.forceResizeParallax || !this.oldPageData || this.oldPageData.width !== this.width || this.oldPageData.height !== this.height
    const isScrolled = isResized || !this.oldPageData || this.oldPageData.scrollTop !== this.scrollTop
    this.forceResizeParallax = false
    if (isResized || isScrolled) {
      this.parallaxList.forEach((item) => {
        if (isResized) {
          item.onResize()
        }
        if (isScrolled) {
          item.onScroll()
        }
      })
      this.oldPageData = {
        width: this.width,
        height: this.height,
        scrollTop: this.scrollTop
      }
    }
    requestAnimationFrame(this.updateParallax.bind(this))
  }

  calculateLayout() {
    this.width = this.window.innerWidth || this.window.document.documentElement.clientWidth
    this.height = this.window.innerHeight || this.window.document.documentElement.clientHeight
  }
}

export default Stage
