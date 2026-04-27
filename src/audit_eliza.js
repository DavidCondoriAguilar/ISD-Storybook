import fs from 'fs';
const data = JSON.parse(fs.readFileSync('C:/Users/porra/OneDrive/Escritorio/produccion_completa.json', 'utf8'));

let elizaTotal = 0;
console.log('--- AUDITORÍA ELIZA ---');
data.forEach(r => {
  if (r.trabajador.nombre === 'Eliza') {
    console.log(`${r.fechaLegible} | Cantidad: ${r.produccion.cantidad} | Producto: ${r.producto.nombre} | Máquina: ${r.ubicacion.maquina}`);
    elizaTotal += r.produccion.cantidad;
  }
});
console.log('------------------------');
console.log('TOTAL CALCULADO ELIZA:', elizaTotal);
