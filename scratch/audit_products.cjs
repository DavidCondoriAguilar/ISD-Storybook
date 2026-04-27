
const fs = require('fs');
const path = 'c:\\Users\\porra\\OneDrive\\Escritorio\\ISD-MOBILE-APP\\produccion_completa.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const byProductPaneles = {};
const byProductResortes = {};

data.forEach(r => {
    const producto = (r.producto?.nombre || r.producto || "").toLowerCase();
    const qty = r.produccion?.cantidad || r.cantidad || 0;
    const esMillar = producto.includes('millar');
    const esProceso = producto.includes('embarillado') || 
                     producto.includes('doblado') || 
                     producto.includes('cortado');

    if (esMillar) {
        byProductResortes[producto] = (byProductResortes[producto] || 0) + qty;
    } else if (!esProceso) {
        byProductPaneles[producto] = (byProductPaneles[producto] || 0) + qty;
    }
});

console.log('--- PRODUCT MIX AUDIT ---');
console.log('Paneles Mix:', JSON.stringify(byProductPaneles, null, 2));
console.log('Resortes Mix:', JSON.stringify(byProductResortes, null, 2));
