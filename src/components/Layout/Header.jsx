import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell, Settings, Moon, Sun } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const Header = () => {
    const { user, isDark, setIsDark } = useFinance();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Transactions', path: '/transactions' },
        { name: 'Wallet', path: '/wallet' },
        { name: 'Goals', path: '/goals' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Reports', path: '/reports' },
    ];

    return (
        <header style={{ backgroundColor: 'var(--jm-white)', borderBottom: '1px solid var(--jm-light-gray)', padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Brand Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--jm-dark-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        F
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--jm-dark-blue)' }}>
                        Finadash
                    </span>
                </div>

                {/* Top Navigation Tabs */}
                <nav style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Action Icons & Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="var(--jm-dark-gray)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            style={{
                                padding: '0.5rem 1rem 0.5rem 2.2rem',
                                borderRadius: '8px',
                                border: 'var(--border-input)',
                                backgroundColor: 'var(--jm-light-gray)',
                                outline: 'none',
                                width: '200px'
                            }}
                        />
                    </div>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setIsDark(!isDark)}>
                        {isDark ? <Sun size={20} color="var(--jm-dark-gray)" /> : <Moon size={20} color="var(--jm-dark-gray)" />}
                    </button>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', position: 'relative' }}>
                        <Bell size={20} color="var(--jm-dark-gray)" />
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: 'var(--jm-dark-blue)', borderRadius: '50%' }}></span>
                    </button>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <Settings size={20} color="var(--jm-dark-gray)" />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--jm-light-gray)', paddingLeft: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user.name}</div>
                            <div style={{ color: 'var(--jm-dark-gray)', fontSize: '0.75rem' }}>{user.email}</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--jm-light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 0.5rem;
          color: var(--jm-dark-gray);
          font-weight: 500;
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: var(--jm-dark-blue);
        }
        .nav-link.active {
          color: var(--jm-dark-blue);
          font-weight: 600;
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--jm-dark-blue);
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }
      `}</style>
        </header>
    );
};

export default Header;
