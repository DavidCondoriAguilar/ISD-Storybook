import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { db } from '../../../data/db'
import { analyticsService } from '../services/analyticsService'

export const useExecutiveData = () => {
  const [timeRange, setTimeRange] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const rawRecords = useLiveQuery(() => db.records.toArray()) || []

  const filteredRecords = useMemo(() => {
    let filtered = rawRecords

    if (timeRange === 'custom' && startDate && endDate) {
      const [sYear, sMonth, sDay] = startDate.split('-').map(Number)
      const [eYear, eMonth, eDay] = endDate.split('-').map(Number)
      
      const start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime()
      const end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime()
      
      filtered = filtered.filter(r => r.fechaTimestamp >= start && r.fechaTimestamp <= end)
    } else if (timeRange !== 'all' && timeRange !== 'custom') {
      const cutoff = subDays(new Date(), timeRange)
      cutoff.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => r.fechaTimestamp >= cutoff.getTime())
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        (r.trabajadorNombre || '').toLowerCase().includes(search) ||
        (r.productoNombre || '').toLowerCase().includes(search) ||
        (r.maquinaId || '').toLowerCase().includes(search)
      )
    }

    return filtered
  }, [rawRecords, timeRange, startDate, endDate, searchTerm])

  const stats = useMemo(() => analyticsService.getExecutiveKPIs(filteredRecords), [filteredRecords])
  const advStats = useMemo(() => analyticsService.getAdvancedMetrics(filteredRecords), [filteredRecords])
  const trendData = useMemo(() => analyticsService.getProductionTrend(filteredRecords), [filteredRecords])
  const { topPaneleros, topResorteros } = useMemo(() => analyticsService.getWorkerRankings(filteredRecords), [filteredRecords])
  const productMix = useMemo(() => analyticsService.getProductMix(filteredRecords), [filteredRecords])
  const machineStats = useMemo(() => analyticsService.getMachineStats(filteredRecords), [filteredRecords])

  return {
    timeRange,
    setTimeRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    stats,
    advStats,
    trendData,
    topPaneleros,
    topResorteros,
    productMix,
    machineStats
  }
}
