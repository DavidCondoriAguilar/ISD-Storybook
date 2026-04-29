import { useMemo, useState, useCallback, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { db } from '../../../data/db'

export const useDashboardRecords = () => {
  const [filterText, setFilterText] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  // Date Filtering State
  const [timeRange, setTimeRange] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const rawRecords = useLiveQuery(() => db.records.toArray(), []) || []

  const toggleSort = useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }, [])

  const filteredRecords = useMemo(() => {
    let filtered = rawRecords

    // 1. Date Range Filtering
    if (timeRange === 'custom' && startDate && endDate) {
      const [sYear, sMonth, sDay] = startDate.split('-').map(Number)
      const [eYear, eMonth, eDay] = endDate.split('-').map(Number)
      
      const start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime()
      const end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime()
      
      filtered = filtered.filter(r => r.fechaTimestamp >= start && r.fechaTimestamp <= end)
    } else if (timeRange !== 'all' && timeRange !== 'custom') {
      const cutoff = subDays(new Date(), timeRange)
      filtered = filtered.filter(r => r.fechaTimestamp >= cutoff.getTime())
    }

    // 2. Text Filtering
    const search = filterText.toLowerCase()
    if (filterText) {
      filtered = filtered.filter(r => 
        (r.trabajadorNombre || '').toLowerCase().includes(search) ||
        (r.productoNombre || '').toLowerCase().includes(search) ||
        (r.moduloId || '').toLowerCase().includes(search) ||
        (r.maquinaId || '').toLowerCase().includes(search)
      )
    }
    
    // 3. Sorting
    return [...filtered].sort((a, b) => {
      const dateA = a.fechaTimestamp || 0
      const dateB = b.fechaTimestamp || 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [rawRecords, filterText, sortOrder, timeRange, startDate, endDate])

  // Implement slicing for pagination
  const displayRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRecords.slice(start, start + itemsPerPage)
  }, [filteredRecords, currentPage, itemsPerPage])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterText, itemsPerPage, timeRange, startDate, endDate])

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1

  return {
    records: displayRecords,
    allFilteredRecords: filteredRecords,
    totalCount: filteredRecords.length,
    filterText,
    setFilterText,
    sortOrder,
    toggleSort,
    timeRange,
    setTimeRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isFilterOpen,
    setIsFilterOpen,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      setCurrentPage,
      setItemsPerPage
    }
  }
}
