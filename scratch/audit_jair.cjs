
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:\\Users\\porra\\OneDrive\\Escritorio\\ISD-MOBILE-APP\\produccion_completa.json', 'utf8'));

const workerName = "Jair";
let totalPaneles = 0;
let totalResortes = 0;
let totalProcesos = 0;

data.forEach(r => {
    const name = r.trabajador?.nombre || r.trabajador || "";
    if (name.toLowerCase() !== workerName.toLowerCase()) return;

    const producto = (r.producto?.nombre || r.producto || "").toLowerCase();
    const qty = r.produccion?.cantidad || r.cantidad || 0;
    
    const esMillar = producto.includes('millar');
    const esProceso = producto.includes('embarillado') || 
                     producto.includes('doblado') || 
                     producto.includes('cortado');

    if (esMillar) {
        totalResortes += qty; // in Millares
    } else if (esProceso) {
        totalProcesos += qty;
    } else {
        totalPaneles += qty;
    }
});

console.log(`--- AUDIT FOR ${workerName} ---`);
console.log('Paneles (u.):', totalPaneles);
console.log('Resortes (k.):', totalResortes);
console.log('Procesos (u.):', totalProcesos);
