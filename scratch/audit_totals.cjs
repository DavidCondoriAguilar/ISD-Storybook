
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:\\Users\\porra\\OneDrive\\Escritorio\\ISD-MOBILE-APP\\produccion_completa.json', 'utf8'));

let totalPaneles = 0;
let totalResortes = 0; // In units
let totalProcesos = 0;

data.forEach(r => {
    const producto = (r.producto?.nombre || r.producto || "").toLowerCase();
    const qty = r.produccion?.cantidad || r.cantidad || 0;
    const unit = (r.produccion?.unidad || r.unidad || "").toLowerCase();
    
    const esMillar = producto.includes('millar');
    const esProceso = producto.includes('embarillado') || 
                     producto.includes('doblado') || 
                     producto.includes('cortado') ||
                     producto.includes('pegado');

    if (esMillar) {
        totalResortes += qty * 1000;
    } else if (esProceso) {
        totalProcesos += qty;
    } else {
        totalPaneles += qty;
    }
});

console.log('--- AUDIT REPORT ---');
console.log('Total Paneles (Units):', totalPaneles);
console.log('Total Resortes (Units):', totalResortes);
console.log('Total Resortes (Millares):', totalResortes / 1000);
console.log('Total Procesos (Units):', totalProcesos);
console.log('Total Records:', data.length);
