import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { useSelection } from '../hooks/useSelection'

function TestComponent() {
  const { selected, addSelected, removeSelected, clearAll, setBulkTarget } = useSelection()
  return (
    <div>
      <div data-testid="count">{Array.from(selected).length}</div>
      <button onClick={() => addSelected([1,2,3])}>add</button>
      <button onClick={() => removeSelected([2])}>remove2</button>
      <button onClick={() => setBulkTarget(5)}>bulk5</button>
      <button onClick={() => clearAll()}>clear</button>
    </div>
  )
}

describe('useSelection DOM integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds and removes selection and persists', () => {
    render(<TestComponent />)
    const count = screen.getByTestId('count')
    expect(count.textContent).toBe('0')
    fireEvent.click(screen.getByText('add'))
    expect(count.textContent).toBe('3')
    fireEvent.click(screen.getByText('remove2'))
    expect(count.textContent).toBe('2')
    fireEvent.click(screen.getByText('clear'))
    expect(count.textContent).toBe('0')
  })
})
