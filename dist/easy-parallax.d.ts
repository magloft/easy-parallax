declare module 'easy-parallax' {
  export interface ParallaxOptions {
    speed: number
    type: string
  }
  export class Stage {
    constructor(window: Window)
    force(element: HTMLElement, options: ParallaxOptions): void
    remove(element: HTMLElement): void
    update(): void
  }
  export function EasyParallax(window: Window): Stage
}
