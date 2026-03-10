import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--jm-light-gray)' }}>
            <Header />
            <main className="main-content" style={{ flex: 1 }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
