let moduleMapCache = {}

export const setModuleMapCache = (map) => {
  moduleMapCache = map
}

export const getModuleName = (moduloId) => {
  const id = String(moduloId)
  return moduleMapCache[id] || `Módulo ${id}`
}