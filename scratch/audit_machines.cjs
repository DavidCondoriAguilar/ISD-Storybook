
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:\\Users\\porra\\OneDrive\\Escritorio\\ISD-MOBILE-APP\\produccion_completa.json', 'utf8'));

const byMachinePaneles = {};
const byMachineResortes = {};
const byProceso = {};

data.forEach(r => {
    const producto = (r.producto?.nombre || r.producto || "").toLowerCase();
    const qty = r.produccion?.cantidad || r.cantidad || 0;
    const machine = r.ubicacion?.maquina || r.maquina || 'Sin Máquina';
    
    const esMillar = producto.includes('millar');
    const esProceso = producto.includes('embarillado') || 
                     producto.includes('doblado') || 
                     producto.includes('cortado') ||
                     producto.includes('pegado');

    if (esMillar) {
        byMachineResortes[machine] = (byMachineResortes[machine] || 0) + qty;
    } else if (esProceso) {
        byProceso[machine] = (byProceso[machine] || 0) + qty;
    } else {
        byMachinePaneles[machine] = (byMachinePaneles[machine] || 0) + qty;
    }
});

console.log('--- MACHINE VOLUME AUDIT ---');
console.log('Paneles:', byMachinePaneles);
console.log('Resortes:', byMachineResortes);
console.log('Procesos:', byProceso);
