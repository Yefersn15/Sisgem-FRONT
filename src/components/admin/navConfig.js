// src/components/admin/navConfig.js
export const DASHBOARD_ITEM = { to: '/admin', icon: 'fa-home', label: 'Dashboard', exact: true };

export const NAV_GROUPS = [
  {
    key: 'inventario',
    label: 'Inventario',
    icon: 'fa-boxes',
    permissions: ['Inventario', 'Productos'],
    items: [
      { to: '/admin/productos', icon: 'fa-boxes', label: 'Productos' },
      { to: '/admin/marcas', icon: 'fa-tag', label: 'Marcas' },
      { to: '/admin/categorias', icon: 'fa-folder', label: 'Categorías' },
    ],
  },
  {
    key: 'contenido',
    label: 'Contenido',
    icon: 'fa-images',
    permissions: ['Banners'],
    items: [
      { to: '/admin/banners', icon: 'fa-images', label: 'Banners' },
    ],
  },
  {
    key: 'ventas',
    label: 'Ventas',
    icon: 'fa-shopping-cart',
    permissions: ['Ventas'],
    items: [
      { to: '/admin/ventas', icon: 'fa-shopping-cart', label: 'Ventas' },
      { to: '/admin/pedidos', icon: 'fa-box', label: 'Pedidos' },
      { to: '/admin/domicilios', icon: 'fa-truck', label: 'Domicilios' },
      { to: '/admin/pagos', icon: 'fa-money-bill-wave', label: 'Pagos' },
    ],
  },
  {
    key: 'sistema',
    label: 'Sistema',
    icon: 'fa-cogs',
    permissions: ['Usuarios', 'Configuración'],
    items: [
      { to: '/admin/usuarios', icon: 'fa-users', label: 'Usuarios', permission: 'Usuarios' },
      { to: '/admin/roles', icon: 'fa-user-shield', label: 'Roles', permission: 'Configuración' },
      { to: '/admin/configuracion', icon: 'fa-store', label: 'Configuración', permission: 'Configuración' },
    ],
  },
];
