import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
    return records.reduce((acc, r) => {
      const isM = this.isMillar(r)
      if (isM) acc.millares += (r.cantidad || 0)
      else acc.unidades += (r.cantidad || 0)
      return acc
    }, { unidades: 0, millares: 0 })
  },

  async exportToPDF(records, totals, notify) {
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
      r.maquinaId || '-'
    ])

    autoTable(doc, {
      startY: summaryY + 30,
      head: [['#', 'FECHA', 'PRODUCTO', 'ÁREA', 'TRABAJADOR', 'CANTIDAD', 'MÁQUINA']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: COLORS.dark, fontSize: 8 },
      styles: { fontSize: 7 }
    })

    doc.save(`ISD-Report-${format(today, 'yyyy-MM-dd')}.pdf`)
    if (notify) notify('PDF Exportado con éxito', 'success')
  }
}
