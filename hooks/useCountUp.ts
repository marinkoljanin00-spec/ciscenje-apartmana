'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  decimals?: number
  suffix?: string
}

export function useCountUp({ end, duration = 2000, decimals = 0, suffix = '' }: UseCountUpOptions) {
  const [count, setCount] = useState('0')
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // easeOutExpo easing function
  const easeOutExpo = useCallback((t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          
          const startTime = performance.now()
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = easeOutExpo(progress)
            const currentValue = easedProgress * end
            
            setCount(currentValue.toFixed(decimals) + suffix)
            
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          
          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [end, duration, decimals, suffix, hasAnimated, easeOutExpo])

  return { count, ref }
}
