// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const reportService = {
  generateExecutiveReport: async (data, dateRange) => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const fecha = format(now, 'dd/MM/yyyy HH:mm', { locale: es });

    // HEADER - Minimalist Senior Style
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE EJECUTIVO DE PRODUCCIÓN', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`INTELIGENCIA OPERATIVA ISD • ${fecha}`, 14, 30);

    const parseSafeDate = (d) => {
      if (!d) return null;
      if (typeof d === 'string' && d.includes('-')) {
        const [y, m, d_part] = d.split('-').map(Number);
        return new Date(y, m - 1, d_part, 12, 0, 0, 0);
      }
      return new Date(d);
    };

    if (dateRange?.start) {
      const startObj = parseSafeDate(dateRange.start);
      const endObj = parseSafeDate(dateRange.end || dateRange.start);
      
      const startStr = format(startObj, 'dd/MM/yyyy');
      const endStr = format(endObj, 'dd/MM/yyyy');
      
      const periodText = startStr === endStr ? `FECHA AUDITADA: ${startStr}` : `PERIODO AUDITADO: ${startStr} - ${endStr}`;
      doc.text(periodText, pageWidth - 14, 30, { align: 'right' });
    }

    let yPos = 55;

    // SECTION 1: KPI MASTER
    if (data?.stats) {
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('I. INDICADORES CLAVE DE DESEMPEÑO (KPIs)', 14, yPos);
      yPos += 6;

      const statsData = [
        ['PRODUCCIÓN PANELES (MÁQUINA MP)', `${data.stats.totalPaneles?.toLocaleString('es-ES') || '0'} u.`, 'UNIDADES'],
        ['PRODUCCIÓN RESORTES (MÁQUINA MR)', `${data.stats.totalResortes?.toLocaleString('es-ES') || '0'} mill.`, 'MILLARES'],
        ['FUERZA LABORAL ACTIVA', `${data.stats.uniqueWorkers || '0'} PERS.`, 'OPERARIOS'],
        ['EFICIENCIA OPERATIVA GLOBAL', `${data.stats.cumplimiento?.global || 0}%`, 'CUMPLIMIENTO'],
        ['TOTAL REGISTROS AUDITADOS', `${data.stats.totalRecords || '0'} REG.`, 'TRAZABILIDAD']
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['MÉTRICA DE CONTROL', 'VALOR ACTUAL', 'UNIDAD']],
        body: statsData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 5, font: 'helvetica' },
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          1: { halign: 'right', fontStyle: 'bold' },
          2: { halign: 'center', textColor: [100, 100, 100] }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // SECTION 2: TOP COLABORADORES
    if (data?.topPaneleros?.length > 0 || data?.topResorteros?.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('II. LIDERAZGO EN PRODUCCIÓN (TOP 5)', 14, yPos);
      yPos += 6;

      const workersData = [];

      if (data?.topPaneleros?.length > 0) {
        workersData.push([{ content: 'MÓDULO PANELES (MP)', colSpan: 2, styles: { fillColor: [238, 242, 255], fontStyle: 'bold' } }]);
        data.topPaneleros.slice(0, 5).forEach((w, i) => {
          workersData.push([`${i + 1}. ${w.name}`, `${w.total?.toLocaleString('es-ES') || '0'} u.`]);
        });
      }

      if (data?.topResorteros?.length > 0) {
        workersData.push([{ content: 'MÓDULO RESORTES (MR)', colSpan: 2, styles: { fillColor: [236, 253, 245], fontStyle: 'bold' } }]);
        data.topResorteros.slice(0, 5).forEach((w, i) => {
          workersData.push([`${i + 1}. ${w.name}`, `${w.total?.toLocaleString('es-ES') || '0'} mill.`]);
        });
      }

      autoTable(doc, {
        startY: yPos,
        head: [['COLABORADOR', 'TOTAL PRODUCIDO']],
        body: workersData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // SECTION 3: MÁQUINAS
    if (data?.machineStats?.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('III. DESEMPEÑO POR ACTIVO (MÁQUINAS)', 14, yPos);
      yPos += 6;

      const machineData = data.machineStats.slice(0, 10).map(m => [
        m.name?.toUpperCase() || 'N/A',
        `${m.total?.toLocaleString('es-ES') || '0'} ${m.name?.includes('MR') ? 'mill.' : 'u.'}`,
        'ÓPTIMO'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['ID MÁQUINA', 'TOTAL PRODUCIDO', 'ESTADO']],
        body: machineData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
      });
    }

    // FOOTER - Corporate minimalist
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('ESTE DOCUMENTO ES UN REGISTRO OFICIAL AUDITADO POR EL SISTEMA ISD. CONFIDENCIAL.', 14, doc.internal.pageSize.getHeight() - 10);
      doc.text(`PÁGINA ${i} / ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    // Identificación de archivo basada en el periodo auditado
    const startFilename = dateRange?.start ? String(dateRange.start) : format(now, 'yyyy-MM-dd');
    const endFilename = dateRange?.end ? String(dateRange.end) : startFilename;
    const filenameSuffix = startFilename === endFilename ? startFilename : `${startFilename}_al_${endFilename}`;

    doc.save(`ISD-Reporte-Ejecutivo-${filenameSuffix}.pdf`);
    return { success: true, fileName: `ISD-Reporte-Ejecutivo-${filenameSuffix}.pdf` };
  },

  generateDailyProductionReport: async (records, dateRange) => {
    // Dynamic import (Lighthouse Performance Optimization)
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

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