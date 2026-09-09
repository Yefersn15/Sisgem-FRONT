// src/components/header/storeNavConfig.js
// Secciones del menú de la tienda (no-admin), agrupadas igual que el navConfig del admin
// para poder alimentar tanto una barra lateral como una barra superior.
export const getStoreMenuSections = ({ isAdmin, hasPermission }) => [
  {
    key: 'tienda',
    title: 'Tienda',
    icon: 'fa-store',
    // `flat: true` hace que Header.jsx renderice estos items como enlaces
    // sueltos en la barra (como Biblioteca_ReactVite hace con Catálogo/
    // Autores/Editoriales/Categorías), no agrupados detrás de un
    // desplegable "Tienda" — Productos/Marcas/Categorías son secciones
    // igual de importantes como para no esconderlas un clic más adentro.
    flat: true,
    // El carrito no va aquí: el header público ya tiene su propio ícono con
    // contador de artículos, así que listarlo también en este menú sería
    // redundante.
    items: [
      { to: '/productos', icon: 'fa-box', label: 'Productos' },
      { to: '/marcas', icon: 'fa-tag', label: 'Marcas' },
      { to: '/categorias', icon: 'fa-folder', label: 'Categorías' },
    ],
  },
  {
    key: 'administracion',
    title: 'Administración',
    icon: 'fa-cube',
    condition: () => isAdmin
      || hasPermission('Ventas') || hasPermission('Usuarios') || hasPermission('Configuración')
      || hasPermission('Reportes') || hasPermission('Inventario') || hasPermission('Productos')
      || hasPermission('Caja'),
    items: isAdmin ? [
      { to: '/admin', icon: 'fa-home', label: 'Dashboard' },
      { to: '/admin/productos', icon: 'fa-boxes', label: 'Productos', module: 'Inventario' },
      { to: '/admin/marcas', icon: 'fa-tag', label: 'Marcas', module: 'Inventario' },
      { to: '/admin/categorias', icon: 'fa-folder', label: 'Categorías', module: 'Inventario' },
      { to: '/admin/ventas', icon: 'fa-shopping-cart', label: 'Ventas', module: 'Ventas' },
      { to: '/admin/pedidos', icon: 'fa-box', label: 'Pedidos', module: 'Ventas' },
      { to: '/admin/domicilios', icon: 'fa-truck', label: 'Domicilios', module: 'Ventas' },
      { to: '/admin/pagos', icon: 'fa-money-bill-wave', label: 'Pagos', module: 'Ventas' },
      { to: '/admin/caja', icon: 'fa-cash-register', label: 'Caja', module: 'Caja' },
      { to: '/admin/usuarios', icon: 'fa-users', label: 'Usuarios', module: 'Usuarios' },
      { to: '/admin/roles', icon: 'fa-user-shield', label: 'Roles', module: 'Configuración' },
      { to: '/admin/configuracion', icon: 'fa-store', label: 'Configuración', module: 'Configuración' },
    ] : [
      { to: '/admin', icon: 'fa-cube', label: 'Panel Admin' },
      ...(hasPermission('Inventario') || hasPermission('Productos') ? [
        { to: '/admin/productos', icon: 'fa-boxes', label: 'Productos', module: 'Inventario' },
        { to: '/admin/marcas', icon: 'fa-tag', label: 'Marcas', module: 'Inventario' },
        { to: '/admin/categorias', icon: 'fa-folder', label: 'Categorías', module: 'Inventario' },
      ] : []),
      ...(hasPermission('Ventas') ? [
        { to: '/admin/ventas', icon: 'fa-shopping-cart', label: 'Ventas', module: 'Ventas' },
        { to: '/admin/pedidos', icon: 'fa-box', label: 'Pedidos', module: 'Ventas' },
        { to: '/admin/domicilios', icon: 'fa-truck', label: 'Domicilios', module: 'Ventas' },
        { to: '/admin/pagos', icon: 'fa-money-bill-wave', label: 'Pagos', module: 'Ventas' },
      ] : []),
      ...(hasPermission('Caja') ? [
        { to: '/admin/caja', icon: 'fa-cash-register', label: 'Caja', module: 'Caja' },
      ] : []),
      ...(hasPermission('Usuarios') ? [
        { to: '/admin/usuarios', icon: 'fa-users', label: 'Usuarios', module: 'Usuarios' },
      ] : []),
      ...(hasPermission('Configuración') ? [
        { to: '/admin/roles', icon: 'fa-user-shield', label: 'Roles', module: 'Configuración' },
        { to: '/admin/configuracion', icon: 'fa-store', label: 'Configuración', module: 'Configuración' },
      ] : []),
    ],
  },
];
