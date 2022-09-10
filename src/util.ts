declare global {
  interface Window {
    webkitRequestAnimationFrame(callback: FrameRequestCallback): number
    mozRequestAnimationFrame(callback: FrameRequestCallback): number
  }
}

export const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
  setTimeout(callback, 1000 / 60)
}

export function getStyle(element: HTMLElement, cssProperty: string) {
  return element.ownerDocument.defaultView!.getComputedStyle(element).getPropertyValue(cssProperty)
}

export function setStyles(element: HTMLElement, cssProperties: Record<string, string | null>) {
  for (const [cssProperty, value] of Object.entries(cssProperties)) {
    element.style.setProperty(cssProperty, value, 'important')
  }
}
