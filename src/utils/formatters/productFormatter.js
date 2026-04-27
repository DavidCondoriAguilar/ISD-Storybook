let productMapCache = {}

export const setProductMapCache = (map) => {
  productMapCache = map
}

export const getProductName = (productoId) => {
  if (!productoId) return 'Producto General'
  const id = String(productoId)
  return productMapCache[id] || `Referencia #${id}`
}

export const sanitizarNombre = (n) => n ? n.replace('×', 'x').trim() : 'Sin Nombre'