// src/components/store/StoreSidebarNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStoreMenuSections } from './storeNavConfig';

const OFFCANVAS_ID = 'storeSidebarOffcanvas';

const isActivePath = (pathname, item) =>
  pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to + '/'));

// Bootstrap intercepta el click de cualquier <a data-bs-dismiss="offcanvas">
// y le hace preventDefault() antes de que React Router pueda navegar, dejando
// el menú "muerto". Por eso, en vez de poner data-bs-dismiss en el Link,
// disparamos un click en el botón de cerrar (que sí es un <button> normal
// y ya tiene el listener de Bootstrap enganchado), sin tocar el evento del Link.
const closeOffcanvas = () => {
  document.querySelector(`#${OFFCANVAS_ID} .btn-close`)?.click();
};

const StoreSidebarNav = () => {
  const location = useLocation();
  const { role, user, hasPermission } = useAuth();
  const isAdmin = role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user?.rol_id === 5 || user?.rol === 'ADMIN' || user?.rol === 'Administrador';

  const visibleSections = getStoreMenuSections({ isAdmin, hasPermission })
    .filter(section => !section.condition || section.condition())
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.module || hasPermission(item.module) || isAdmin),
    }))
    .filter(section => section.items.length > 0);

  return (
    <>
      <button
        type="button"
        className="app-store-sidebar-trigger"
        data-bs-toggle="offcanvas"
        data-bs-target={`#${OFFCANVAS_ID}`}
        aria-controls={OFFCANVAS_ID}
        title="Abrir menú"
        aria-label="Abrir menú"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      <div
        className="offcanvas offcanvas-start app-store-sidebar"
        tabIndex="-1"
        id={OFFCANVAS_ID}
        aria-labelledby={`${OFFCANVAS_ID}Label`}
      >
        <div className="offcanvas-header">
          <small className="text-muted fw-bold" id={`${OFFCANVAS_ID}Label`}>Menú</small>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
        </div>
        <div className="offcanvas-body pt-0">
          <ul className="nav flex-column">
            {visibleSections.map(section => (
              <React.Fragment key={section.key}>
                <li className="nav-item mt-3">
                  <small className="text-muted fw-bold">{section.title}</small>
                </li>
                {section.items.map(item => (
                  <li className="nav-item" key={item.to}>
                    <Link
                      to={item.to}
                      className={`nav-link ${isActivePath(location.pathname, item) ? 'active' : ''}`}
                      onClick={closeOffcanvas}
                    >
                      <i className={`fas ${item.icon} me-2`}></i>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default StoreSidebarNav;
