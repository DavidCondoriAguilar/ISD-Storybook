export const formatMetric = (num) => {
  if (num === null || num === undefined) return '0'
  const val = Number(num)
  if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return val.toLocaleString()
}