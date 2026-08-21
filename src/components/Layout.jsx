import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useStoreLayoutMode } from '../shared/components/store/useStoreLayoutMode';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';
import StoreSidebarNav from '../shared/components/store/StoreSidebarNav';
import StoreTopNav from '../shared/components/store/StoreTopNav';

const Layout = ({ children }) => {
  const { isTopbar, isCompact, setOrientation, toggleCompact } = useStoreLayoutMode();
  const [headerRef, headerHeight] = useMeasuredHeight();

  return (
    <div>
      <Header navRef={headerRef} isTopbar={isTopbar} onOrientationChange={setOrientation} />
      <div style={{ paddingTop: headerHeight }}>
        {isTopbar ? (
          <>
            <StoreTopNav compact={isCompact} onToggleCompact={toggleCompact} />
            <main className="app-store-main-content">{children}</main>
          </>
        ) : (
          <>
            <StoreSidebarNav />
            <main className="app-store-main-content">{children}</main>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default Layout;
