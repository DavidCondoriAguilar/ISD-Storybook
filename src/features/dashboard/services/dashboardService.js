import { format } from 'date-fns'

export const dashboardService = {
  isMillar(record) {
    const producto = (record.productoNombre || '').toLowerCase()
    const maquina = (record.maquinaId || '').toUpperCase()
    return producto.includes('millar') || 
           producto.includes('resorte') || 
           maquina.includes('RESORTERA') || 
           maquina.includes('MR')
  },

  calculateTotals(records) {
    const workers = new Set()
    const machines = new Set()

    const totals = records.reduce((acc, r) => {
      const isM = this.isMillar(r)
      if (isM) acc.millares += (r.cantidad || 0)
      else acc.unidades += (r.cantidad || 0)
      
      if (r.trabajadorNombre) workers.add(r.trabajadorNombre)
      if (r.maquinaId && r.maquinaId !== 'Sin Máquina') machines.add(r.maquinaId)

      if (r.outputMaquina > 0) {
        acc.totalOutput += r.outputMaquina
        acc.totalWithMachine += r.cantidad
      }
      return acc
    }, { unidades: 0, millares: 0, totalOutput: 0, totalWithMachine: 0 })

    const efficiency = totals.totalOutput > 0 
      ? (totals.totalWithMachine / totals.totalOutput) * 100 
      : 0

    return {
      ...totals,
      efficiency: efficiency.toFixed(1),
      workerCount: workers.size,
      machineCount: machines.size
    }
  },

  async exportToPDF(records, totals, notify) {
    // SENIOR OPTIMIZATION: Dynamic Import to reduce initial bundle size
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF()
    const COLORS = {
      primary: [99, 102, 241],
      secondary: [16, 185, 129],
      dark: [30, 41, 59],
      light: [241, 245, 249],
      white: [255, 255, 255]
    }

    const today = new Date()
    const headerHeight = 45

    // Header Background
    doc.setFillColor(...COLORS.dark)
    doc.rect(0, 0, 210, headerHeight, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('ISD - SISTEMA DE AUDITORÍA INDUSTRIAL', 14, 18)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Reporte de Producción | ${format(today, 'dd/MM/yyyy HH:mm')}`, 14, 28)

    // Summary Box
    const summaryY = headerHeight + 12
    doc.setFillColor(...COLORS.light)
    doc.roundedRect(14, summaryY, 182, 22, 3, 3, 'F')

    doc.setTextColor(...COLORS.dark)
    doc.setFontSize(8)
    doc.text(`REGISTROS: ${records.length}`, 20, summaryY + 13)
    doc.text(`PANELES: ${totals.unidades.toLocaleString()} u.`, 70, summaryY + 13)
    doc.text(`RESORTES: ${totals.millares.toLocaleString()} mil.`, 130, summaryY + 13)

    // Table
    const tableData = records.map((r, i) => [
      i + 1,
      format(new Date(r.fechaTimestamp), 'dd/MM/yyyy'),
      r.productoNombre || '-',
      r.moduloId || '-',
      r.trabajadorNombre || '-',
      r.cantidad ? `${r.cantidad.toLocaleString()} ${this.isMillar(r) ? 'mil.' : 'u.'}` : '-',
      r.outputMaquina !== null && r.outputMaquina !== undefined ? r.outputMaquina : '-',
      r.maquinaId || '-'
    ])

    autoTable(doc, {
      startY: summaryY + 30,
      head: [['#', 'FECHA', 'PRODUCTO', 'ÁREA', 'TRABAJADOR', 'CANTIDAD', 'P.MÁQUINA', 'MÁQUINA']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: COLORS.dark, fontSize: 7 },
      styles: { fontSize: 6, cellPadding: 1.5 }
    })

    doc.save(`ISD-Report-${format(today, 'yyyy-MM-dd')}.pdf`)
    if (notify) notify('PDF Exportado con éxito', 'success')
  }
}
