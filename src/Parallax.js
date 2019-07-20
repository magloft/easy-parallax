import { getStyle, setStyles } from './util'

const POSITION = 'absolute'

export default class Parallax {
  constructor(stage, element, { speed = 0.6, type = 'scroll' } = {}) {
    this.stage = stage
    this.element = element
    this.options = { type, speed }
    this.instanceID = this.stage.nextInstanceID()

    if (element.tagName === 'IMG') {
      this.container = stage.document.createElement('div')
      if (element.parentElement) {
        element.parentElement.insertBefore(this.container, element)
      } else {
        const shadowRoot = element.getRootNode()
        shadowRoot.insertBefore(this.container, element)
      }
      this.container.appendChild(element)
      this.image = element
      this.useImgTag = true
    } else if (getStyle(element, 'background-image')) {
      this.container = element
      const backgroundImage = getStyle(element, 'background-image')
      this.src = backgroundImage.match(/^url\(['"]?([^"')]+)['"]?\)$/)[1]
      this.useImgTag = false
    }

    // find image element
    if (this.image) {
      this.imageElement = this.image.cloneNode(true)
      this.useImgTag = true
      setStyles(this.image, { position: 'relative', display: 'block', maxWidth: '100%', height: 'auto', opacity: 0, zIndex: -100 })
    }

    const containerStyles = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      clipPath: 'inset(0px)'
    }
    let imageStyles = { position: 'absolute' }
    if (this.options.type === 'static') {
      imageStyles.position = 'fixed'
      imageStyles.left = '0px'
      imageStyles.top = '0px'
      imageStyles.width = '100%'
      imageStyles.height = '100%'
    }

    // set relative position and z-index to the parent
    if (getStyle(this.container, 'position') === 'static') {
      setStyles(this.container, { position: 'relative' })
    }
    if (getStyle(this.container, 'z-index') === 'auto') {
      setStyles(this.container, { zIndex: 0 })
    }

    // container for parallax image
    this.$container = this.stage.document.createElement('div')
    setStyles(this.$container, { ...containerStyles, zIndex: -100 })
    this.$container.setAttribute('id', `parallax-container-${this.instanceID}`)
    if (this.container.shadowRoot) {
      this.container.shadowRoot.appendChild(this.$container)
    } else {
      this.container.appendChild(this.$container)
    }

    if (this.useImgTag) {
      // use img tag
      imageStyles = Object.assign({
        'object-fit': 'cover',
        'object-position': '50% 50%',
        'font-family': `object-fit: cover; object-position: 50% 50%;`,
        'max-width': 'none'
      }, containerStyles, imageStyles)
      this.imageElement.onload = () => {
        this.stage.update()
      }
    } else {
      // use div with background image
      this.imageElement = this.stage.document.createElement('div')
      imageStyles = Object.assign({
        'background-position': '50% 50%',
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-image': `url("${this.src}")`
      }, containerStyles, imageStyles)
    }

    // insert parallax image
    setStyles(this.imageElement, imageStyles)
    this.$container.appendChild(this.imageElement)

    // set initial position and size
    this.coverImage()
    this.onScroll(true)

    // remove default user background
    if (getStyle(this.container, 'background-image') !== 'none') {
      setStyles(this.container, { 'background-image': 'none' })
    }
  }

  update(options = {}) {
    Object.assign(this.options, options)
    if (this.useImgTag) {
      if (this.image.src !== this.imageElement.src) {
        this.imageElement.src = this.image.src
      }
    } else {
      this.container.style.backgroundImage = null
      const backgroundImage = getStyle(this.container, 'background-image')
      this.container.style.backgroundImage = 'none'
      if (this.imageElement.style.backgroundImage !== backgroundImage) {
        this.imageElement.style.backgroundImage = backgroundImage
      }
    }
    this.stage.update()
  }

  coverImage() {
    const rect = this.$container.getBoundingClientRect()
    const { speed } = this.options
    const isScroll = this.options.type === 'scroll'
    let scrollDist = 0
    let resultH = rect.height

    // scroll parallax
    if (isScroll) {
      // scroll distance and height for image
      if (speed < 0) {
        scrollDist = speed * Math.max(rect.height, this.stage.height)
      } else {
        scrollDist = speed * (rect.height + this.stage.height)
      }

      // size for scroll parallax
      if (speed > 1) {
        resultH = Math.abs(scrollDist - this.stage.height)
      } else if (speed < 0) {
        resultH = scrollDist / speed + Math.abs(scrollDist)
      } else {
        resultH += Math.abs(this.stage.height - rect.height) * (1 - speed)
      }

      scrollDist /= 2
    }

    // store scroll distance
    this.parallaxScrollDistance = scrollDist

    // vertical center
    const resultMT = isScroll ? (this.stage.height - resultH) / 2 : (rect.height - resultH) / 2

    // apply result to item
    if (this.options.type === 'scroll') {
      setStyles(this.imageElement, {
        marginTop: `${resultMT}px`,
        left: '0',
        height: `${resultH}px`,
        width: `${rect.width}px`
      })
    } else {
      setStyles(this.imageElement, {
        marginTop: '0',
        left: '0',
        top: '0',
        height: '100%',
        width: '100%'
      })
    }
  }

  isVisible() {
    return this.isElementInViewport || false
  }

  onScroll(force) {
    const rect = this.container.getBoundingClientRect()
    const styles = {}

    // check if in viewport
    this.isElementInViewport = rect.bottom >= 0 && rect.right >= 0 && rect.top <= this.stage.height && rect.left <= this.stage.width
    if (force ? false : !this.isElementInViewport) { return }

    const fromViewportCenter = 1 - 2 * (this.stage.height - rect.top) / (this.stage.height + rect.height)

    // scroll
    if (this.options.type === 'scroll') {
      let positionY = this.parallaxScrollDistance * fromViewportCenter
      if (POSITION === 'absolute') { positionY -= rect.top }
      styles.transform = `translate3d(0,${positionY}px,0)`
    }

    setStyles(this.imageElement, styles)
  }

  onResize() {
    this.coverImage()
  }

  destroy() {
    this.container.style.zIndex = null

    if (this.useImgTag) {
      setStyles(this.image, { position: null, display: null, maxWidth: null, height: null, zIndex: null, opacity: null })
      this.imageElement.removeAttribute('style')
      this.container.replaceWith(this.image)
    } else {
      setStyles(this.container, { backgroundImage: this.imageElement.style.backgroundImage })
    }

    if (this.$clipStyles && this.$clipStyles.parentNode) {
      this.$clipStyles.parentNode.removeChild(this.$clipStyles)
    }
    if (this.$container && this.$container.parentNode) {
      this.$container.parentNode.removeChild(this.$container)
    }
  }
}
