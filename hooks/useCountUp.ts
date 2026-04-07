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
  const isVisibleRef = useRef(false)

  // easeOutExpo easing function
  const easeOutExpo = useCallback((t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }, [])

  const runAnimation = useCallback(() => {
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
  }, [end, duration, decimals, suffix, easeOutExpo])

  // Track visibility with IntersectionObserver
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    // Check initial visibility
    const rect = element.getBoundingClientRect()
    const isInitiallyVisible = rect.top < window.innerHeight && rect.bottom > 0
    isVisibleRef.current = isInitiallyVisible

    return () => observer.disconnect()
  }, [])

  // Start animation when end > 0 and element is visible
  useEffect(() => {
    if (end <= 0 || hasAnimated) return

    const startIfVisible = () => {
      if (isVisibleRef.current) {
        setHasAnimated(true)
        runAnimation()
      }
    }

    // Small delay to ensure visibility check is accurate after data loads
    const timer = setTimeout(startIfVisible, 150)

    return () => clearTimeout(timer)
  }, [end, hasAnimated, runAnimation])

  return { count, ref }
}
