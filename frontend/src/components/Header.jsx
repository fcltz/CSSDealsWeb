import React from 'react';
import { Search, Moon, Sun, Menu, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Header() {
  const { theme, toggleTheme, search, setSearch, toggleSidebar, token, user } = useStore();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-icon mobile-menu-btn" onClick={toggleSidebar} style={{ display: 'none' /* Will show via media query if needed */ }}>
          <Menu size={20} />
        </button>
        <div className="search-bar">
          <Search size={18} color="var(--text-tertiary)" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {token && user && (
          <Link 
            to="/profile" 
            className="theme-toggle" 
            style={{ 
              textDecoration: 'none', 
              display: 'flex', 
              gap: '0.5rem', 
              width: 'auto', 
              padding: '0 1rem', 
              borderRadius: '20px',
              alignItems: 'center'
            }}
          >
            <User size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
