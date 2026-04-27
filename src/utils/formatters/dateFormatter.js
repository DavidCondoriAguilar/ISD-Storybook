export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  return date.toLocaleString('es-ES', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const formatHours = (hours) => {
  if (!hours) return '0.00h'
  return `${hours}h`
}