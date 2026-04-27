import { useMemo, useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../data/db'

export const useDashboardRecords = () => {
  const [filterText, setFilterText] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const records = useLiveQuery(() => db.records.toArray(), []) || []

  const toggleSort = useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }, [])

  const filteredRecords = useMemo(() => {
    const search = filterText.toLowerCase()
    const filtered = filterText
      ? records.filter(r => 
          (r.trabajadorNombre || '').toLowerCase().includes(search) ||
          (r.productoNombre || '').toLowerCase().includes(search) ||
          (r.moduloId || '').toLowerCase().includes(search) ||
          (r.maquinaId || '').toLowerCase().includes(search)
        )
      : records
    
    return [...filtered].sort((a, b) => {
      const dateA = a.fechaTimestamp || 0
      const dateB = b.fechaTimestamp || 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [records, filterText, sortOrder])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRecords.slice(start, start + itemsPerPage)
  }, [filteredRecords, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1

  return {
    records: paginatedRecords,
    allFilteredRecords: filteredRecords,
    totalCount: filteredRecords.length,
    filterText,
    setFilterText,
    sortOrder,
    toggleSort,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      setCurrentPage,
      setItemsPerPage
    }
  }
}
