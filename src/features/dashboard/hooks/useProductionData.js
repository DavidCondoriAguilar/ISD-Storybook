import { useMemo } from 'react'
import { transformProductionData, aggregateProductionData, buildProductionStats } from '../../../data/aggregators/productionAggregator'

const EMPTY_RESULT = { processedData: null, machines: [] }

export const useProductionData = (rawData) => {
  return useMemo(() => {
    if (!rawData || rawData.length === 0) return EMPTY_RESULT

    const transformed = transformProductionData(rawData)
    const aggregated = aggregateProductionData(transformed)
    const productionStats = buildProductionStats(aggregated)

    const machines = Array.from(new Set(transformed.map(r => r.maquinaKey)))
      .filter(m => m.toLowerCase().indexOf('sin máquina') === -1 && m !== 'Manual')
      .sort()

    return {
      processedData: {
        ...aggregated,
        ...productionStats
      },
      machines
    }
  }, [rawData])
}