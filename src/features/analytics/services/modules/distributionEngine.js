/**
 * MOTOR DE DISTRIBUCIÓN (Mix de productos)
 */
export const calculateDistribution = (records) => {
  const productMap = {};

  records.forEach(r => {
    const name = r.productoNombre || 'Sin Producto';
    const nameUpper = name.toUpperCase();
    
    // Ignorar tareas administrativas
    if (nameUpper.includes('PERMISO') || nameUpper.includes('LIMPIEZA') || nameUpper.includes('NO TRABAJÓ')) {
      return;
    }

    if (!productMap[name]) productMap[name] = 0;
    productMap[name] += (r.cantidad || 0);
  });

  const sortedProducts = Object.entries(productMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Tomamos los 6 primeros y agrupamos el resto en "Otros"
  const topProducts = sortedProducts.slice(0, 6);
  const others = sortedProducts.slice(6);

  if (others.length > 0) {
    const othersTotal = others.reduce((sum, item) => sum + item.value, 0);
    topProducts.push({ name: 'Otros (Menores)', value: othersTotal });
  }

  return topProducts;
};
