import { Parallax, ParallaxOptions } from './Parallax'
import { requestAnimationFrame } from './util'

export interface PageData {
  width: number
  height: number
  scrollTop: number
}

export class Stage {
  public window: Window
  public document: Document
  public instanceID = 0
  public parallaxList: Parallax[] = []
  public width!: number
  public height!: number
  public scrollTop!: number
  public forceResizeParallax = false
  public oldPageData?: PageData

  constructor(window: Window) {
    this.window = window
    this.document = window.document
    this.window.addEventListener('resize', () => { this.calculateLayout() })
    this.window.addEventListener('orientationchange', () => { this.calculateLayout() })
    this.calculateLayout()
  }

  nextInstanceID() {
    this.instanceID += 1
    return this.instanceID
  }

  get(element: HTMLElement) {
    return this.parallaxList.find((parallax) => parallax.element === element)
  }

  contains(element: HTMLElement) {
    return this.get(element) != null
  }

  add(element: HTMLElement, options?: Partial<ParallaxOptions>) {
    if (this.contains(element)) { return null }
    const parallax = new Parallax(this, element, options)
    this.addToParallaxList(parallax)
    this.update()
    return parallax
  }

  force(element: HTMLElement, options?: Partial<ParallaxOptions>) {
    if (!this.contains(element)) {
      this.add(element, options)
    } else {
      this.update(element, options)
    }
  }

  remove(element: HTMLElement) {
    const parallax = this.get(element)
    if (!parallax) { return }
    this.removeFromParallaxList(parallax)
    parallax.destroy()
  }

  update(element?: HTMLElement, options?: Partial<ParallaxOptions>) {
    this.calculateLayout()
    this.forceResizeParallax = true
    if (element && this.contains(element)) {
      this.get(element)?.update(options)
    }
  }

  addToParallaxList(instance: Parallax) {
    this.parallaxList.push(instance)
    if (this.parallaxList.length === 1) {
      this.updateParallax()
    }
  }

  removeFromParallaxList(instance: Parallax) {
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
