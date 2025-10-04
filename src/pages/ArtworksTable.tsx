import React, { useEffect, useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { fetchArtworks } from '../api/artApi'
import { ArtWork } from '../types/artwork'
import { useSelection } from '../hooks/useSelection'
import SelectedPanel from '../components/SelectedPanel'
import { Toast } from 'primereact/toast'

export default function ArtworksTable() {
  const [data, setData] = useState<ArtWork[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(12)
  const toast = useRef<any>(null)

  const {
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
  } = useSelection()

  const op = useRef<any>(null)
  const [bulkValue, setBulkValue] = useState<string>('')

  async function loadPage(p: number) {
    setLoading(true)
    try {
      const res = await fetchArtworks(p, rows)
      setData(res.data)
      setTotal(res.total)
    } catch (e) {
      console.error('Failed to fetch artworks', e)
      toast.current?.show({ severity: 'error', summary: 'Load failed', detail: 'Failed to fetch artworks. Click to retry.', life: 4000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage(page) }, [page, rows])

  function onPage(event: { first: number; rows: number }) {
    const newPage = Math.floor((event.first / event.rows) + 1)
    setPage(newPage)
    setRows(event.rows)
  }

  // derive selection for current page using globalIndex
  const selectionForPage: ArtWork[] = data.filter((d: ArtWork, idx: number) => {
    const globalIndex = (page - 1) * rows + idx + 1
    return isSelected(d.id, globalIndex)
  })

  function onRowToggle(e: { originalEvent?: any; data?: ArtWork }) {
    // Toggle single row selection (deterministic)
    if (!e.data) return
    const id = e.data.id
    const currentlySelected = selected.has(id)
    // Use flushSync to make the update visible immediately in the UI
    if (currentlySelected) {
      flushSync(() => {
        removeSelected([id])
        addDeselected([id])
      })
    } else {
      flushSync(() => {
        addSelected([id])
        removeDeselected([id])
      })
    }
  }

  function onPageSelectionChange(e: any) {
    // e.value contains the selected rows objects for current page
    const newSelected = (e.value as ArtWork[]) || []
    const newIds = newSelected.map(s => s.id)
    const currentPageIds: number[] = data.map((d: ArtWork) => d.id)

    // Add newly selected ids
    addSelected(newIds)
    // Any ids on this page that are not in newIds should be marked deselected
    const shouldDeselect = currentPageIds.filter(id => !newIds.includes(id))
    if (shouldDeselect.length) addDeselected(shouldDeselect)
  }

  function onClear() {
    clearAll()
  }

  const selectedIdsArray: number[] = Array.from(selected)
  const titlesMap: Record<number, string> = {}
  data.forEach(d => titlesMap[d.id] = d.title)

  function submitBulkSelect() {
    const n = parseInt(bulkValue || '0', 10)
    if (isNaN(n) || n <= 0) {
      setBulkValue('')
      op.current?.hide()
      return
    }
    // set bulk target which will make first N rows selected by global index
    setBulkTarget(n)
    // clear explicit deselections that are beyond the bulk target might remain
    setBulkValue('')
    op.current?.hide()
  }

  return (
    <div>
      <Toast ref={toast} />
      <SelectedPanel selectedIds={selectedIdsArray} titles={titlesMap} onClear={onClear} />

      <DataTable value={data}
        lazy
        paginator
        rows={rows}
        totalRecords={total}
        first={(page - 1) * rows}
        onPage={onPage}
        loading={loading}
        selectionMode="checkbox"
        selection={selectionForPage}
        onSelectionChange={onPageSelectionChange}
        rowHover
        onRowClick={(e: any) => {
          // toggle when row clicked
          onRowToggle({ data: e.data })
        }}
        rowClassName={(rowData: ArtWork) => {
          const idx = data.findIndex(d => d.id === rowData.id)
          const globalIndex = idx >= 0 ? (page - 1) * rows + idx + 1 : undefined
          return isSelected(rowData.id, globalIndex) ? 'p-highlight' : ''
        }}
        dataKey="id"
      >
        <Column headerStyle={{width: '3rem'}} header={() => {
          const currentPageIds = data.map(d => d.id)
          const pageSelectedCount = currentPageIds.filter((id, idx) => {
            const globalIndex = (page - 1) * rows + idx + 1
            return isSelected(id, globalIndex)
          }).length
          const allSelectedOnPage = pageSelectedCount === currentPageIds.length && currentPageIds.length > 0
          const someSelectedOnPage = pageSelectedCount > 0 && pageSelectedCount < currentPageIds.length
          return (
            <div className="flex align-items-center">
              <input
                type="checkbox"
                checked={allSelectedOnPage}
                ref={(el) => { if (el) el.indeterminate = someSelectedOnPage }}
                onChange={(ev) => {
                  const checked = ev.target.checked
                  if (checked) {
                    // select all on current page - update immediately
                    flushSync(() => {
                      addSelected(currentPageIds)
                      removeDeselected(currentPageIds)
                    })
                  } else {
                    // deselect all on current page - update immediately
                    flushSync(() => {
                      removeSelected(currentPageIds)
                      addDeselected(currentPageIds)
                    })
                  }
                }}
                style={{marginRight: 6}}
                aria-label="Select all rows on this page"
              />
              <Button type="button" icon="pi pi-chevron-down" className="p-button-text p-button-plain" onClick={(e) => op.current?.toggle(e)} />
              <OverlayPanel ref={op} showCloseIcon>
                <div className="p-3">
                  <label htmlFor="bulkInput">Select rows across pages</label>
                  <div className="p-inputgroup mt-2">
                    <InputText id="bulkInput" value={bulkValue} onChange={(ev) => setBulkValue(ev.target.value)} placeholder="Enter number" />
                    <Button label="Submit" onClick={submitBulkSelect} />
                  </div>
                </div>
              </OverlayPanel>
            </div>
          )
        }} body={(rowData: ArtWork, options) => {
          // compute whether this row is selected
          const globalIndex = (page - 1) * rows + options.rowIndex + 1
          const checked = isSelected(rowData.id, globalIndex)
          return (
            <div style={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onRowToggle({ data: rowData })}
                aria-label={`Select row ${rowData.id}`}
              />
            </div>
          )
        }}></Column>
        <Column field="id" header="Code" style={{width: '8rem'}} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Year Start" />
        <Column field="date_end" header="Year End" />
      </DataTable>
    </div>
  )
}
