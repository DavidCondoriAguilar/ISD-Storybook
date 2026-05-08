import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const reportService = {
  generateExecutiveReport: async (data, dateRange) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const fecha = format(now, 'dd/MM/yyyy HH:mm', { locale: es });

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('ISD - Reporte Ejecutivo', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${fecha}`, pageWidth / 2, 30, { align: 'center' });

    if (dateRange?.start && dateRange?.end) {
      doc.setFontSize(10);
      doc.text(`Período: ${format(dateRange.start, 'dd/MM/yyyy')} - ${format(dateRange.end, 'dd/MM/yyyy')}`, pageWidth / 2, 38, { align: 'center' });
    }

    let yPos = 50;

    if (data?.stats) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen de Producción', 14, yPos);
      yPos += 8;

      const statsData = [
        ['Total Unidades', data.stats.totalUnits?.toLocaleString() || '0'],
        ['Producción Paneles', data.stats.totalPaneles?.toLocaleString() || '0'],
        ['Producción Resortes', `${data.stats.totalResortes?.toLocaleString() || '0'} mil.`],
        ['Fuerza Laboral', data.stats.uniqueWorkers?.toString() || '0'],
        ['Eficiencia Global', `${data.stats.cumplimiento?.global || 0}%`],
        ['Meta Alcanzada', data.stats.cumplimiento?.global >= 100 ? 'Sí' : 'No'],
        ['Registros Auditados', data.stats.totalRecords?.toString() || '0'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }, // Imperial Purple
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    if (data?.topPaneleros?.length > 0 || data?.topResorteros?.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Top Colaboradores', 14, yPos);
      yPos += 8;

      const workersData = [];
      
      if (data?.topPaneleros?.length > 0) {
        workersData.push([{ content: '--- PANELEROS ---', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [248, 250, 252] } }]);
        data.topPaneleros.slice(0, 5).forEach((w, i) => {
          workersData.push([`${i + 1}. ${w.name}`, `${w.total?.toLocaleString() || '0'} u.`, 'N/A']);
        });
      }

      if (data?.topResorteros?.length > 0) {
        workersData.push([{ content: '--- RESORTEROS ---', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [248, 250, 252] } }]);
        data.topResorteros.slice(0, 5).forEach((w, i) => {
          workersData.push([`${i + 1}. ${w.name}`, `${w.total?.toLocaleString() || '0'} mil.`, 'N/A']);
        });
      }

      autoTable(doc, {
        startY: yPos,
        head: [['Colaborador', 'Producción', 'Eficiencia']],
        body: workersData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    if (data?.machineStats?.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Eficiencia por Máquina', 14, yPos);
      yPos += 8;

      const machineData = data.machineStats.slice(0, 10).map(m => [
        m.name || 'N/A',
        m.total?.toLocaleString() || '0',
        'N/A',
        'N/A',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Máquina', 'Producción (u/mil)', 'Eficiencia', 'Utilización']],
        body: machineData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    if (data?.productMix?.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Mezcla de Productos', 14, yPos);
      yPos += 8;

      const mixData = data.productMix.slice(0, 10).map(p => [
        p.name || 'N/A',
        p.value?.toLocaleString() || '0',
        'N/A',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Producto/Módulo', 'Unidades', 'Porcentaje']],
        body: mixData,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 14, right: 14 },
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`ISD-Reporte-${format(now, 'yyyy-MM-dd')}.pdf`);
    
    return { success: true, fileName: `ISD-Reporte-${format(now, 'yyyy-MM-dd')}.pdf` };
  },

  generateDailyProductionReport: async (records, dateRange) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const fecha = format(now, 'dd/MM/yyyy', { locale: es });

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte Diario de Producción', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${fecha}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total registros: ${records?.length || 0}`, pageWidth / 2, 38, { align: 'center' });

    const tableData = records?.slice(0, 100).map(r => [
      r.trabajadorNombre || 'N/A',
      r.moduloId || r.productoNombre || 'N/A',
      r.maquinaId || 'N/A',
      r.cantidad?.toString() || '0',
      r.outputMaquina?.toString() || '0',
    ]) || [];

    autoTable(doc, {
      startY: 50,
      head: [['Trabajador', 'Producto', 'Máquina', 'Cantidad', 'Output']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14, right: 14 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`ISD-Produccion-Diaria-${format(now, 'yyyy-MM-dd')}.pdf`);
    
    return { success: true, fileName: `ISD-Produccion-Diaria-${format(now, 'yyyy-MM-dd')}.pdf` };
  },
};

export default reportService;