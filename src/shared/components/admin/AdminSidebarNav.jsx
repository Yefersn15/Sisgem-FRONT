// src/shared/components/admin/AdminSidebarNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { DASHBOARD_ITEM, NAV_GROUPS } from './navConfig';

const isActivePath = (pathname, item) =>
  item.exact ? pathname === item.to : (pathname === item.to || pathname.startsWith(item.to + '/'));

const AdminSidebarNav = ({ compact = false, onToggleCompact }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const visibleGroups = NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasPermission(item.permission || group.permissions[0]) || group.permissions.some(p => hasPermission(p))),
    }))
    .filter(group => group.permissions.some(p => hasPermission(p)) && group.items.length > 0);

  return (
    <nav
      className="app-admin-sidebar p-3"
      style={{ width: compact ? '72px' : '250px', minHeight: 'calc(100vh - var(--topbar-height) - 50px)' }}
    >
      <div className={`mb-3 d-none d-lg-flex align-items-center ${compact ? 'justify-content-center' : 'justify-content-between'}`}>
        {!compact && <small className="text-muted fw-bold">Menú principal</small>}
        <button
          type="button"
          className="btn btn-outline-theme btn-sm"
          onClick={onToggleCompact}
          title={compact ? 'Expandir menú' : 'Compactar menú'}
          aria-label={compact ? 'Expandir menú' : 'Compactar menú'}
        >
          <i className={`fas ${compact ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
        </button>
      </div>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link
            to={DASHBOARD_ITEM.to}
            className={`nav-link ${isActivePath(location.pathname, DASHBOARD_ITEM) ? 'active' : ''} ${compact ? 'text-center' : ''}`}
            title={compact ? DASHBOARD_ITEM.label : undefined}
          >
            <i className={`fas ${DASHBOARD_ITEM.icon} ${compact ? '' : 'me-2'}`}></i>
            {!compact && DASHBOARD_ITEM.label}
          </Link>
        </li>

        {visibleGroups.map(group => (
          <React.Fragment key={group.key}>
            {!compact && (
              <li className="nav-item mt-3">
                <small className="text-muted fw-bold d-none d-lg-block">{group.label}</small>
              </li>
            )}
            {compact && <li className="nav-item mt-3"><hr className="my-1" /></li>}
            {group.items.map(item => (
              <li className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link ${isActivePath(location.pathname, item) ? 'active' : ''} ${compact ? 'text-center' : ''}`}
                  title={compact ? item.label : undefined}
                >
                  <i className={`fas ${item.icon} ${compact ? '' : 'me-2'}`}></i>
                  {!compact && item.label}
                </Link>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>

      <hr className="border-secondary my-3" />

      <Link to="/" className="btn btn-outline-theme btn-sm w-100" title={compact ? 'Volver a la tienda' : undefined}>
        <i className={`fas fa-store ${compact ? '' : 'me-2'}`}></i>
        {!compact && 'Volver a la tienda'}
      </Link>
    </nav>
  );
};

export default AdminSidebarNav;
