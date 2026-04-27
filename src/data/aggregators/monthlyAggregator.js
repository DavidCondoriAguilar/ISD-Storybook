export const getMonthlyData = (history) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dataByMonth = {}
  
  history.forEach(r => {
    const date = new Date(r.timestamp)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (!dataByMonth[key]) {
      dataByMonth[key] = { 
        name: months[date.getMonth()], 
        units: 0, imports: 0, ts: date.getTime(), breakdown: {} 
      }
    }
    
    dataByMonth[key].units += (r.units || 0)
    dataByMonth[key].imports += 1
    
    const records = r.rawRecords || []
    records.forEach(rec => {
      const cat = rec.modulo || rec.productoTipo || 'Otros'
      const qty = Number(rec.cantidad || 0)
      dataByMonth[key].breakdown[cat] = (dataByMonth[key].breakdown[cat] || 0) + qty
    })
  })
  
  return Object.values(dataByMonth).sort((a, b) => a.ts - b.ts).slice(-6)
}