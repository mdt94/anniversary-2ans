import { useEffect } from 'react'
import Lenis from 'lenis'

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) return undefined

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 0.95,
      autoRaf: true,
    })

    document.documentElement.classList.add('lenis')

    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]')
      if (!link) return

      const hash = link.getAttribute('href')
      if (!hash || hash === '#') return

      const target = document.querySelector(hash)
      if (!target) return

      event.preventDefault()
      lenis.scrollTo(target, { offset: -16, duration: 1.6 })
    }

    document.addEventListener('click', onAnchorClick)

    return () => {
      document.removeEventListener('click', onAnchorClick)
      document.documentElement.classList.remove('lenis')
      lenis.destroy()
    }
  }, [])
}
