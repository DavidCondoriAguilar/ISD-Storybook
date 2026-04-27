import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { db } from '../../../data/db'
import { analyticsService } from '../services/analyticsService'

export const useExecutiveData = () => {
  const [timeRange, setTimeRange] = useState(30)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const rawRecords = useLiveQuery(() => db.records.toArray()) || []

  const filteredRecords = useMemo(() => {
    let filtered = rawRecords

    if (timeRange !== 'all') {
      const cutoff = subDays(new Date(), timeRange)
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
  }, [rawRecords, timeRange, searchTerm])

  const stats = useMemo(() => analyticsService.getExecutiveKPIs(filteredRecords), [filteredRecords])
  const advStats = useMemo(() => analyticsService.getAdvancedMetrics(filteredRecords), [filteredRecords])
  const trendData = useMemo(() => analyticsService.getProductionTrend(filteredRecords), [filteredRecords])
  const { topPaneleros, topResorteros } = useMemo(() => analyticsService.getWorkerRankings(filteredRecords), [filteredRecords])
  const productMix = useMemo(() => analyticsService.getProductMix(filteredRecords), [filteredRecords])
  const machineStats = useMemo(() => analyticsService.getMachineStats(filteredRecords), [filteredRecords])

  return {
    timeRange,
    setTimeRange,
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
