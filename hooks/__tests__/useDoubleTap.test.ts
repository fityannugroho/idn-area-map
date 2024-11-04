import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useDoubleTap from '../useDoubleTap'

describe('useDoubleTap', () => {
  vi.useFakeTimers()

  it('should call the callback on double tap', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDoubleTap(callback))

    // Simulate first tap
    act(() => {
      result.current()
    })

    // Fast-forward time within the delay
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Simulate second tap
    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback if taps are outside the delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDoubleTap(callback))

    // Simulate first tap
    act(() => {
      result.current()
    })

    // Fast-forward time beyond the delay
    act(() => {
      vi.advanceTimersByTime(400)
    })

    // Simulate second tap
    act(() => {
      result.current()
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('should reset the timer after a double tap', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDoubleTap(callback))

    // Simulate first double tap
    act(() => {
      result.current()
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    // Simulate another double tap
    act(() => {
      result.current()
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
