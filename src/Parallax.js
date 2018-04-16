import { isAndroid, isIOs } from './Helpers'

export default class Parallax {
  constructor(stage, element, options) {
    this.stage = stage
    this.instanceID = this.stage.nextInstanceID()
    this.element = element
    this.element.parallax = this
    this.defaults = {
      type: 'scroll',
      speed: 0.5,
      onScroll: null,
      onInit: null,
      onDestroy: null,
      onCoverImage: null
    }

    this.options = this.extend({}, this.defaults, options)

    // fix speed option [-1.0, 2.0]
    this.options.speed = Math.min(2, Math.max(-1, parseFloat(this.options.speed)))

    this.image = {
      src: null,
      $container: null,
      useImgTag: false,
      position: isAndroid || isIOs ? 'absolute' : 'fixed'
    }

    if (this.initImg()) {
      this.init()
    }
  }

  // add styles to element
  css(el, styles) {
    if (typeof styles === 'string') {
      return this.stage.window.getComputedStyle(el).getPropertyValue(styles)
    }
    Object.keys(styles).forEach((key) => {
      el.style[key] = styles[key]
    })
    return el
  }

  extend(...args) {
    const out = args[0] || {}
    Object.keys(args).forEach((i) => {
      if (!args[i]) {
        return
      }
      Object.keys(args[i]).forEach((key) => {
        out[key] = args[i][key]
      })
    })
    return out
  }

  // Parallax functions
  initImg() {
    // find image element
    let $imgElement = this.element.querySelector('img')
    // check if dom element
    if (!($imgElement instanceof Element)) {
      $imgElement = null
    }

    if ($imgElement) {
      this.image.$original = $imgElement
      this.image.element = $imgElement.cloneNode(true)
      this.image.useImgTag = true
      this.css($imgElement, {
        position: 'relative',
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        zIndex: -100
      })
    }

    // true if there is img tag
    if (this.image.element) {
      return true
    }

    // get image src
    if (this.image.src === null) {
      this.image.src = this.css(this.element, 'background-image').replace(/^url\(['"]?/g, '').replace(/['"]?\)$/g, '')
    }
    return !(!this.image.src || this.image.src === 'none')
  }

  update() {
    if (this.image.useImgTag) {
      if (this.image.$original.src !== this.image.element.src) {
        this.image.element.src = this.image.$original.src
      }
    } else if (this.image.element.style.backgroundImage !== this.element.style.backgroundImage) {
      this.image.element.style.backgroundImage = this.element.style.backgroundImage
    }
    this.stage.update()
  }

  init() {
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
    if (this.css(this.element, 'position') === 'static') {
      this.css(this.element, {
        position: 'relative'
      })
    }
    if (this.css(this.element, 'z-index') === 'auto') {
      this.css(this.element, { zIndex: 0 })
    }

    // container for parallax image
    this.image.$container = this.stage.document.createElement('div')
    this.css(this.image.$container, containerStyles)
    this.css(this.image.$container, { zIndex: -100 })
    this.image.$container.setAttribute('id', `parallax-container-${this.instanceID}`)
    this.element.appendChild(this.image.$container)

    if (this.image.useImgTag) {
      // use img tag
      imageStyles = this.extend({
        'object-fit': 'cover',
        'object-position': '50% 50%',
        'font-family': `object-fit: cover; object-position: 50% 50%;`,
        'max-width': 'none'
      }, containerStyles, imageStyles)
      this.image.element.onload = () => {
        this.stage.update()
      }
    } else {
      // use div with background image
      this.image.element = this.stage.document.createElement('div')
      imageStyles = this.extend({
        'background-position': '50% 50%',
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-image': `url("${this.image.src}")`
      }, containerStyles, imageStyles)
    }

    // check if one of parents have transform style (without this check, scroll transform will be inverted if used parallax with position fixed)
    // discussion - https://github.com/nk-o/parallax/issues/9
    if (this.image.position === 'fixed') {
      let parentWithTransform = 0
      let elementParents = this.element
      while (elementParents !== null && elementParents !== this.stage.document && parentWithTransform === 0) {
        const parentTransform = this.css(elementParents, '-webkit-transform') || this.css(elementParents, '-moz-transform') || this.css(elementParents, 'transform')
        if (parentTransform && parentTransform !== 'none') {
          parentWithTransform = 1
          this.image.position = 'absolute'
        }
        elementParents = elementParents.parentNode
      }
    }

    // add position to parallax block
    imageStyles.position = this.image.position

    // insert parallax image
    this.css(this.image.element, imageStyles)
    this.image.$container.appendChild(this.image.element)

    // set initial position and size
    this.coverImage()
    this.clipContainer()
    this.onScroll(true)

    // call onInit event
    if (this.options.onInit) {
      this.options.onInit.call(this)
    }

    // remove default user background
    if (this.css(this.element, 'background-image') !== 'none') {
      this.css(this.element, {
        'background-image': 'none'
      })
    }

    this.stage.addToParallaxList(this)
  }

  destroy() {
    this.stage.removeFromParallaxList(this)
    this.element.style.zIndex = null

    if (this.image.useImgTag) {
      this.css(this.image.$original, {
        position: null,
        display: null,
        maxWidth: null,
        height: null,
        zIndex: null
      })
      this.image.element.removeAttribute('style')
      // move img tag to its default position
      if (this.image.elementParent) {
        this.image.elementParent.appendChild(this.image.element)
      }
    } else {
      this.css(this.element, {
        backgroundImage: this.image.element.style.backgroundImage
      })
    }

    // remove additional dom elements
    if (this.$clipStyles) {
      this.$clipStyles.parentNode.removeChild(this.$clipStyles)
    }
    if (this.image.$container) {
      this.image.$container.parentNode.removeChild(this.image.$container)
    }

    // call onDestroy event
    if (this.options.onDestroy) {
      this.options.onDestroy.call(this)
    }

    // delete parallax from item
    delete this.element.parallax
  }

  // it will remove some image overlapping
  // overlapping occur due to an image position fixed inside absolute position element
  clipContainer() {
    // needed only when background in fixed position
    if (this.image.position !== 'fixed') {
      return
    }

    const rect = this.image.$container.getBoundingClientRect()
    const { width, height } = rect

    if (!this.$clipStyles) {
      this.$clipStyles = this.stage.document.createElement('style')
      this.$clipStyles.setAttribute('type', 'text/css')
      this.$clipStyles.setAttribute('id', `parallax-clip-${this.instanceID}`)
      const head = this.stage.document.head || this.stage.document.getElementsByTagName('head')[0]
      head.appendChild(this.$clipStyles)
    }

    const styles = `#parallax-container-${this.instanceID} {
           clip: rect(0 ${width}px ${height}px 0);
           clip: rect(0, ${width}px, ${height}px, 0);
        }`

    // add clip styles inline (this method need for support IE8 and less browsers)
    if (this.$clipStyles.styleSheet) {
      this.$clipStyles.styleSheet.cssText = styles
    } else {
      this.$clipStyles.innerHTML = styles
    }
  }

  coverImage() {
    const rect = this.image.$container.getBoundingClientRect()
    const contH = rect.height
    const { speed } = this.options
    const isScroll = this.options.type === 'scroll'
    let scrollDist = 0
    let resultH = contH
    let resultMT = 0

    // scroll parallax
    if (isScroll) {
      // scroll distance and height for image
      if (speed < 0) {
        scrollDist = speed * Math.max(contH, this.stage.height)
      } else {
        scrollDist = speed * (contH + this.stage.height)
      }

      // size for scroll parallax
      if (speed > 1) {
        resultH = Math.abs(scrollDist - this.stage.height)
      } else if (speed < 0) {
        resultH = scrollDist / speed + Math.abs(scrollDist)
      } else {
        resultH += Math.abs(this.stage.height - contH) * (1 - speed)
      }

      scrollDist /= 2
    }

    // store scroll distance
    this.parallaxScrollDistance = scrollDist

    // vertical center
    if (isScroll) {
      resultMT = (this.stage.height - resultH) / 2
    } else {
      resultMT = (contH - resultH) / 2
    }

    // apply result to item
    this.css(this.image.element, {
      height: `${resultH}px`,
      marginTop: `${resultMT}px`,
      left: this.image.position === 'fixed' ? `${rect.left}px` : '0',
      width: `${rect.width}px`
    })

    // call onCoverImage event
    if (this.options.onCoverImage) {
      this.options.onCoverImage.call(this)
    }
  }

  isVisible() {
    return this.isElementInViewport || false
  }

  onScroll(force) {
    const rect = this.element.getBoundingClientRect()
    const contT = rect.top
    const contH = rect.height
    const styles = {}

    // check if in viewport
    this.isElementInViewport = rect.bottom >= 0 && rect.right >= 0 && rect.top <= this.stage.height && rect.left <= this.stage.width

    // stop calculations if item is not in viewport
    if (force ? false : !this.isElementInViewport) {
      return
    }

    // calculate parallax helping variables
    const beforeTop = Math.max(0, contT)
    const beforeTopEnd = Math.max(0, contH + contT)
    const afterTop = Math.max(0, -contT)
    const beforeBottom = Math.max(0, contT + contH - this.stage.height)
    const beforeBottomEnd = Math.max(0, contH - (contT + contH - this.stage.height))
    const afterBottom = Math.max(0, -contT + this.stage.height - contH)
    const fromViewportCenter = 1 - 2 * (this.stage.height - contT) / (this.stage.height + contH)

    // calculate on how percent of section is visible
    let visiblePercent = 1
    if (contH < this.stage.height) {
      visiblePercent = 1 - (afterTop || beforeBottom) / contH
    } else if (beforeTopEnd <= this.stage.height) {
      visiblePercent = beforeTopEnd / this.stage.height
    } else if (beforeBottomEnd <= this.stage.height) {
      visiblePercent = beforeBottomEnd / this.stage.height
    }

    // scroll
    if (this.options.type === 'scroll') {
      let positionY = this.parallaxScrollDistance * fromViewportCenter

      // fix if parallax block in absolute position
      if (this.image.position === 'absolute') {
        positionY -= contT
      }

      styles.transform = `translate3d(0,${positionY}px,0)`
    }

    this.css(this.image.element, styles)

    // call onScroll event
    if (this.options.onScroll) {
      this.options.onScroll.call(this, {
        section: rect,
        beforeTop,
        beforeTopEnd,
        afterTop,
        beforeBottom,
        beforeBottomEnd,
        afterBottom,
        visiblePercent,
        fromViewportCenter
      })
    }
  }

  onResize() {
    this.coverImage()
    this.clipContainer()
  }
}
