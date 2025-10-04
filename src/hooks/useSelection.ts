import { useEffect, useState } from 'react'

const STORAGE_KEY = 'aiac_selection_v1'

type StoreShape = {
  selected: number[]
  deselected: number[]
  bulkTarget: number | null
}

export function useSelection() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deselected, setDeselected] = useState<Set<number>>(new Set())
  const [bulkTarget, setBulkTargetState] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const obj = JSON.parse(raw) as StoreShape
        setSelected(new Set(obj.selected || []))
        setDeselected(new Set(obj.deselected || []))
        setBulkTargetState(obj.bulkTarget ?? null)
      }
    } catch (e) {
      console.warn('Failed to load selection from storage', e)
    }
  }, [])

  useEffect(() => {
    try {
      const payload: StoreShape = {
        selected: Array.from(selected),
        deselected: Array.from(deselected),
        bulkTarget: bulkTarget,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('Failed to persist selection to storage', e)
    }
  }, [selected, deselected, bulkTarget])

  const isSelected = (id: number, globalIndex?: number) => {
    if (selected.has(id)) return true
    if (deselected.has(id)) return false
    if (bulkTarget != null && typeof globalIndex === 'number') {
      return globalIndex <= bulkTarget
    }
    return false
  }

  const toggle = (id: number) => setSelected((prev: Set<number>) => {
    const copy = new Set(prev)
    if (copy.has(id)) copy.delete(id)
    else copy.add(id)
    return copy
  })

  const addSelected = (ids: number[]) => setSelected((prev: Set<number>) => {
    const copy = new Set(prev)
    ids.forEach(id => copy.add(id))
    return copy
  })

  const removeSelected = (ids: number[]) => setSelected((prev: Set<number>) => {
    const copy = new Set(prev)
    ids.forEach(id => copy.delete(id))
    return copy
  })

  const addDeselected = (ids: number[]) => setDeselected((prev: Set<number>) => {
    const copy = new Set(prev)
    ids.forEach(id => copy.add(id))
    return copy
  })

  const removeDeselected = (ids: number[]) => setDeselected((prev: Set<number>) => {
    const copy = new Set(prev)
    ids.forEach(id => copy.delete(id))
    return copy
  })

  const clearAll = () => {
    setSelected(new Set())
    setDeselected(new Set())
    setBulkTargetState(null)
  }

  const setBulkTarget = (n: number | null) => {
    setBulkTargetState(n)
    // When setting a bulk target, we don't auto-populate selected ids; selection is computed via isSelected using globalIndex when pages load.
  }

  return {
    selected,
    deselected,
    bulkTarget,
    isSelected,
    toggle,
    addSelected,
    removeSelected,
    addDeselected,
    removeDeselected,
    clearAll,
    setBulkTarget,
  }
}
