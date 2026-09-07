export const getRolNombre = (rol) => {
  if (!rol) return 'Sin rol';
  return typeof rol === 'string' ? rol : (rol.nombre || 'Sin rol');
};
