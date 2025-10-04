import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from '../hooks/useSelection'

// Simple behavior tests for selection hook
describe('useSelection', () => {
  it('initializes and toggles selection', () => {
    const { result } = renderHook(() => useSelection())
    // initially empty
    expect(Array.from(result.current.selected)).toHaveLength(0)

    act(() => {
      result.current.addSelected([1,2,3])
    })
    expect(Array.from(result.current.selected)).toEqual(expect.arrayContaining([1,2,3]))

    act(() => {
      result.current.removeSelected([2])
    })
    expect(Array.from(result.current.selected)).toEqual(expect.arrayContaining([1,3]))
  })
})
