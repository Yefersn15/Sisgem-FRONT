// src/components/store/StoreTopNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStoreMenuSections } from './storeNavConfig';

const isActivePath = (pathname, item) =>
  pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to + '/'));

const isSectionActive = (pathname, section) => section.items.some(item => isActivePath(pathname, item));

const StoreTopNav = ({ compact = false, onToggleCompact }) => {
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();

  const visibleSections = getStoreMenuSections({ isAdmin, hasPermission })
    .filter(section => !section.condition || section.condition())
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.module || hasPermission(item.module) || isAdmin),
    }))
    .filter(section => section.items.length > 0);

  return (
    <nav className="app-store-topnav px-3 py-2 d-flex align-items-center gap-1 flex-wrap">
      {visibleSections.map(section => (
        <div className="dropdown" key={section.key}>
          <button
            className={`btn btn-sm store-topnav-link dropdown-toggle ${isSectionActive(location.pathname, section) ? 'active' : ''}`}
            data-bs-toggle="dropdown"
            title={compact ? section.title : undefined}
          >
            <i className={`fas ${section.icon} ${compact ? '' : 'me-1'}`}></i>
            {!compact && section.title}
          </button>
          <ul className="dropdown-menu">
            {section.items.map(item => (
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

export default StoreTopNav;
