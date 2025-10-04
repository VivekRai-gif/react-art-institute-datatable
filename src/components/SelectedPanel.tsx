import React from 'react'
import { Button } from 'primereact/button'

interface Props {
  selectedIds: number[]
  titles?: Record<number, string>
  onClear: () => void
}

export default function SelectedPanel({ selectedIds, titles = {}, onClear }: Props) {
  return (
    <div className="p-3 surface-card border-1 p-shadow-2 mb-3">
      <div className="flex align-items-center justify-content-between">
        <div>
          <strong>{selectedIds.length}</strong>
          <span className="ml-2">selected</span>
        </div>
        <div>
          <Button label="Clear" className="p-button-warning" onClick={onClear} />
        </div>
      </div>
      <div className="mt-2">
        <ul>
          {selectedIds.slice(0, 6).map(id => (
            <li key={id}>{titles[id] ?? `#${id}`}</li>
          ))}
        </ul>
        {selectedIds.length > 6 && <div className="mt-1">and {selectedIds.length - 6} more...</div>}
      </div>
    </div>
  )
}
