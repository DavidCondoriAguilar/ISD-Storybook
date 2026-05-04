export const formatMetric = (num) => {
  if (num === null || num === undefined) return '0'
  const val = Number(num)
  // En entornos industriales, el número completo da mejor percepción de volumen
  return val.toLocaleString('es-ES')
}