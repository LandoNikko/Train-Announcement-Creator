import { useRef, useCallback } from 'react'

export const useHoldToChange = (onChange, delta, interval = 50) => {
  const intervalRef = useRef(null)
  const currentValueRef = useRef(null)

  const startHold = useCallback(() => {
    if (intervalRef.current) return
    
    intervalRef.current = setInterval(() => {
      onChange(prev => {
        const newValue = prev + delta
        currentValueRef.current = newValue
        return newValue
      })
    }, interval)
  }, [onChange, delta, interval])

  const stopHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return { startHold, stopHold }
}

