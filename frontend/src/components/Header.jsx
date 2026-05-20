import React from 'react';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import useStore from '../store/useStore';

export default function Header() {
  const { theme, toggleTheme, search, setSearch, toggleSidebar } = useStore();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-icon" onClick={toggleSidebar} style={{ display: 'none' /* Will show via media query if needed */ }} className="mobile-menu-btn">
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
      
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
}
