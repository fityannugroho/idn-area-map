import { useRef, useCallback } from 'react'

/**
 * Hook that triggers a callback function on a double-tap event.
 *
 * This hook checks if two consecutive taps occur within a specified delay (default is 300ms).
 * If the taps are close enough, it fires the provided callback function.
 *
 * @param callback - The function to be executed on a double tap.
 * @param [delay=300] - The time (in milliseconds) within which the two taps must occur to be considered a double tap. Default is 300ms.
 *
 * @returns A memoized function that should be called on each tap event. It will determine if the event is a double-tap.
 *
 * @example
 * ```jsx
 * const handleDoubleTap = useDoubleTap(() => {
 *   console.log('Double tapped!')
 * })
 *
 * <div onTouchStart={handleDoubleTap}>Tap me twice</div>
 * ```
 */
export default function useDoubleTap(callback: () => void, delay = 300) {
  const lastTap = useRef(0)

  return useCallback(() => {
    const currentTime = Date.now()
    const tapLength = currentTime - lastTap.current

    // If the tap is within the specified delay, it's a double tap
    if (tapLength < delay && tapLength > 0) {
      callback()
    }

    lastTap.current = currentTime
  }, [callback, delay])
}
