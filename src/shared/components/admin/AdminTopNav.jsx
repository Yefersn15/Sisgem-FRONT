// src/shared/components/admin/AdminTopNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { DASHBOARD_ITEM, NAV_GROUPS } from './navConfig';

const isActivePath = (pathname, item) =>
  item.exact ? pathname === item.to : (pathname === item.to || pathname.startsWith(item.to + '/'));

const isGroupActive = (pathname, group) => group.items.some(item => isActivePath(pathname, item));

const AdminTopNav = ({ compact = false, onToggleCompact }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const visibleGroups = NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasPermission(item.permission || group.permissions[0]) || group.permissions.some(p => hasPermission(p))),
    }))
    .filter(group => group.permissions.some(p => hasPermission(p)) && group.items.length > 0);

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

      {visibleGroups.map(group => (
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
            {group.items.map(item => (
              <li key={item.to}>
                <Link to={item.to} className={`dropdown-item ${isActivePath(location.pathname, item) ? 'active' : ''}`}>
                  <i className={`fas ${item.icon} me-2`}></i>{item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="ms-auto d-flex align-items-center gap-2">
        <Link to="/" className="btn btn-sm btn-outline-theme" title={compact ? 'Volver a la tienda' : undefined}>
          <i className={`fas fa-store ${compact ? '' : 'me-1'}`}></i>
          {!compact && 'Volver a la tienda'}
        </Link>
        <button
          type="button"
          className="btn btn-sm btn-outline-theme"
          onClick={onToggleCompact}
          title={compact ? 'Expandir menú' : 'Compactar menú'}
          aria-label={compact ? 'Expandir menú' : 'Compactar menú'}
        >
          <i className={`fas ${compact ? 'fa-angles-down' : 'fa-angles-up'}`}></i>
        </button>
      </div>
    </nav>
  );
};

export default AdminTopNav;
