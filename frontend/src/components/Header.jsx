import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../utils/api';

export default function Header({ showLogout = false }) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/login';
  };

  return (
    <header style={{
      background: 'var(--color-bg-elevated)',
      borderBottom: '2px solid var(--color-border)',
      padding: 'var(--space-lg) 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-md)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
          letterSpacing: '-0.02em'
        }}>
          <span style={{ color: 'var(--color-accent-primary)' }}>OnSite</span>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            marginLeft: 'var(--space-sm)',
            color: 'var(--color-text-tertiary)',
            verticalAlign: 'middle'
          }}>v1.0</span>
        </Link>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost btn-sm"
            aria-label="Toggle theme"
            style={{
              fontSize: '1.25rem',
              padding: '0.5rem'
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Hamburger Menu (when logged in) */}
          {showLogout && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn-ghost btn-sm"
                aria-label="Menu"
                style={{
                  fontSize: '1.5rem',
                  padding: '0.5rem',
                  lineHeight: 1
                }}
              >
                ☰
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999
                    }}
                    onClick={() => setMenuOpen(false)}
                  />

                  {/* Menu Dropdown */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      background: 'var(--color-bg-elevated)',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '200px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: 'var(--space-md) var(--space-lg)',
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      to="/vendors"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: 'var(--space-md) var(--space-lg)',
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      🏢 Vendors
                    </Link>
                    <Link
                      to="/ivrs"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: 'var(--space-md) var(--space-lg)',
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      📋 IVRs
                    </Link>
                    <Link
                      to="/debug"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: 'var(--space-md) var(--space-lg)',
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      🔧 Debug
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 'var(--space-md) var(--space-lg)',
                        color: 'var(--color-error)',
                        textDecoration: 'none',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
