import { isAndroid, isIOs, getStyle, setStyles } from './util'

const POSITION = isAndroid || isIOs ? 'absolute' : 'fixed'

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
      pointerEvents: 'none'
    }
    let imageStyles = {}

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

    // add position to parallax block
    imageStyles.position = POSITION

    // insert parallax image
    setStyles(this.imageElement, imageStyles)
    this.$container.appendChild(this.imageElement)

    // set initial position and size
    this.coverImage()
    this.clipContainer()
    this.onScroll(true)

    // remove default user background
    if (getStyle(this.container, 'background-image') !== 'none') {
      setStyles(this.container, { 'background-image': 'none' })
    }
  }

  update(options = {}) {
    this.options = Object.assign({}, this.options, options)
    if (this.useImgTag) {
      if (this.image.src !== this.imageElement.src) {
        this.imageElement.src = this.image.src
      }
    } else if (this.imageElement.style.backgroundImage !== this.container.style.backgroundImage) {
      this.imageElement.style.backgroundImage = this.container.style.backgroundImage
    }
    this.stage.update()
  }

  clipContainer() {
    // needed only when background in fixed position
    if (POSITION !== 'fixed') { return }

    const rect = this.$container.getBoundingClientRect()
    const { width, height } = rect

    if (!this.$clipStyles) {
      this.$clipStyles = this.stage.document.createElement('style')
      this.$clipStyles.setAttribute('type', 'text/css')
      this.$clipStyles.setAttribute('id', `parallax-clip-${this.instanceID}`)
      const doc = this.imageElement.getRootNode()
      let styleTarget
      if (doc.nodeType === Document.DOCUMENT_FRAGMENT_NODE) {
        styleTarget = doc
      } else if (doc.nodeType === Document.DOCUMENT_NODE) {
        styleTarget = doc.head || doc.getElementsByTagName('head')[0]
      } else {
        throw new Error('Invalid document node type')
      }
      styleTarget.appendChild(this.$clipStyles)
    }

    const styles = `#parallax-container-${this.instanceID} {
        clip: rect(0 ${width}px ${height}px 0);
        clip: rect(0, ${width}px, ${height}px, 0);
    }`

    if (this.$clipStyles.styleSheet) {
      this.$clipStyles.styleSheet.cssText = styles
    } else {
      this.$clipStyles.innerHTML = styles
    }
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
    setStyles(this.imageElement, {
      height: `${resultH}px`,
      marginTop: `${resultMT}px`,
      left: POSITION === 'fixed' ? `${rect.left}px` : '0',
      width: `${rect.width}px`
    })
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
    this.clipContainer()
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
