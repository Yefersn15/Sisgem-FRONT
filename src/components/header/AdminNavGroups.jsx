// src/components/header/AdminNavGroups.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DASHBOARD_ITEM, NAV_GROUPS } from './navConfig';

const isActivePath = (pathname, item) =>
  item.exact ? pathname === item.to : (pathname === item.to || pathname.startsWith(item.to + '/'));
const isGroupActive = (pathname, group) => group.items.some((item) => isActivePath(pathname, item));

const useVisibleGroups = () => {
  const { hasPermission } = useAuth();
  return NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(item.permission || group.permissions[0]) || group.permissions.some((p) => hasPermission(p))),
    }))
    .filter((group) => group.permissions.some((p) => hasPermission(p)) && group.items.length > 0);
};

// Menú del panel admin, agrupado en secciones (Inventario, Contenido, Ventas,
// Sistema — ver navConfig.js), en sus tres variantes: 'lateral' (barra
// lateral de escritorio), 'topbar' (fila de dropdowns) y 'mobile' (el mismo
// menú vertical, siempre con etiquetas, dentro del colapsable de móvil).
// Antes cada variante vivía duplicada en su propio archivo
// (AdminSidebarNav.jsx / AdminTopNav.jsx, sin variante de móvil) con la
// misma lógica de filtrado por permisos repetida en los dos; ahora es un
// único componente reutilizable, igual que el Navbar de Biblioteca_ReactVite
// (components/header/Navbar.jsx). Antes, además, los encabezados de sección
// se ocultaban con `d-none d-lg-block` por debajo de 992px sin ocultar
// también el espacio en blanco que dejaban: se veía como una lista plana de
// iconos con huecos raros. Aquí la variante 'lateral' siempre muestra su
// etiqueta (el modo compacto real es "Solo iconos", una preferencia
// explícita, no algo atado al ancho de pantalla) y 'mobile' hace lo mismo.
const AdminNavGroups = ({ variant, compact = false, onNavigate }) => {
  const location = useLocation();
  const visibleGroups = useVisibleGroups();

  if (variant === 'topbar') {
    return (
      <nav className="app-admin-topnav px-3 py-2 d-flex align-items-center gap-1 flex-wrap">
        <Link
          to={DASHBOARD_ITEM.to}
          className={`btn btn-sm admin-topnav-link ${isActivePath(location.pathname, DASHBOARD_ITEM) ? 'active' : ''}`}
          title={compact ? DASHBOARD_ITEM.label : undefined}
        >
          <i className={`fas ${DASHBOARD_ITEM.icon} ${compact ? '' : 'me-1'}`}></i>
          {!compact && DASHBOARD_ITEM.label}
        </Link>

        {visibleGroups.map((group) => (
          <div className="dropdown" key={group.key}>
            <button
              className={`btn btn-sm admin-topnav-link dropdown-toggle ${isGroupActive(location.pathname, group) ? 'active' : ''}`}
              data-bs-toggle="dropdown"
              title={compact ? group.label : undefined}
            >
              <i className={`fas ${group.icon} ${compact ? '' : 'me-1'}`}></i>
              {!compact && group.label}
            </button>
            <ul className="dropdown-menu">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={`dropdown-item ${isActivePath(location.pathname, item) ? 'active' : ''}`}>
                    <i className={`fas ${item.icon} me-2`}></i>{item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    );
  }

  // 'siempreConEtiqueta' ignora la preferencia "Solo iconos" en el
  // colapsable de móvil (ahí un menú de solo iconos no tiene sentido),
  // sin afectar a la barra lateral de escritorio, que sí debe respetarla.
  const ocultarEtiqueta = compact && variant !== 'mobile';

  return (
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link
          to={DASHBOARD_ITEM.to}
          className={`nav-link ${isActivePath(location.pathname, DASHBOARD_ITEM) ? 'active' : ''} ${ocultarEtiqueta ? 'text-center' : ''}`}
          title={ocultarEtiqueta ? DASHBOARD_ITEM.label : undefined}
          onClick={onNavigate}
        >
          <i className={`fas ${DASHBOARD_ITEM.icon} ${ocultarEtiqueta ? '' : 'me-2'}`}></i>
          {!ocultarEtiqueta && DASHBOARD_ITEM.label}
        </Link>
      </li>

      {visibleGroups.map((group) => (
        <React.Fragment key={group.key}>
          {ocultarEtiqueta ? (
            <li className="nav-item mt-3"><hr className="my-1" /></li>
          ) : (
            <li className="nav-item mt-3">
              <small className="text-muted fw-bold">{group.label}</small>
            </li>
          )}
          {group.items.map((item) => (
            <li className="nav-item" key={item.to}>
              <Link
                to={item.to}
                className={`nav-link ${isActivePath(location.pathname, item) ? 'active' : ''} ${ocultarEtiqueta ? 'text-center' : ''}`}
                title={ocultarEtiqueta ? item.label : undefined}
                onClick={onNavigate}
              >
                <i className={`fas ${item.icon} ${ocultarEtiqueta ? '' : 'me-2'}`}></i>
                {!ocultarEtiqueta && item.label}
              </Link>
            </li>
          ))}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default AdminNavGroups;
