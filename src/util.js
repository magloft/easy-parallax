export const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1

export const isIOs = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

export const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
  setTimeout(callback, 1000 / 60)
}

export function getStyle(element, cssProperty) {
  return element.ownerDocument.defaultView.getComputedStyle(element).getPropertyValue(cssProperty)
}

export function setStyles(element, cssProperties) {
  for (const [cssProperty, value] of Object.entries(cssProperties)) {
    element.style[cssProperty] = value
  }
}
