import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useStoreLayoutMode } from './store/useStoreLayoutMode';
import { useVistaHomeLlamativa } from '../hooks/useVistaHomeLlamativa';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';
import StoreSidebarNav from './store/StoreSidebarNav';
import StoreTopNav from './store/StoreTopNav';

const Layout = ({ children }) => {
  const { isTopbar, isCompact, setOrientation, toggleCompact } = useStoreLayoutMode();
  const { vistaLlamativa, setVistaLlamativa } = useVistaHomeLlamativa();
  const [headerRef, headerHeight] = useMeasuredHeight();

  return (
    <div>
      <Header
        navRef={headerRef}
        isTopbar={isTopbar}
        onOrientationChange={setOrientation}
        vistaLlamativa={vistaLlamativa}
        setVistaLlamativa={setVistaLlamativa}
      />
      <div style={{ paddingTop: headerHeight }}>
        {isTopbar ? (
          <>
            <StoreTopNav compact={isCompact} onToggleCompact={toggleCompact} />
            <main className="app-store-main-content">{React.cloneElement(children, { vistaLlamativa })}</main>
          </>
        ) : (
          <>
            <StoreSidebarNav />
            <main className="app-store-main-content">{React.cloneElement(children, { vistaLlamativa })}</main>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default Layout;
