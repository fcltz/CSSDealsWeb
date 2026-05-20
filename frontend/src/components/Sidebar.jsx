import React from 'react';
import useStore from '../store/useStore';
import { LayoutGrid } from 'lucide-react';

const CATEGORIES = [
  { id: '32', name: 'Hoodie' },
  { id: '40', name: 'Socks' },
  { id: '45', name: 'Suitcase' },
  { id: '11', name: 'Shoes' },
  { id: '33', name: 'Down Jacket' },
  { id: '12', name: 'Coat' },
  { id: '14', name: 'T-shirts' },
  { id: '15', name: 'Pants' },
  { id: '26', name: 'Hat & Bags' },
  { id: '34', name: 'Suit' },
  { id: '35', name: 'Long Sleeve' },
  { id: '39', name: 'Accessories' },
  { id: '27', name: 'Belt & Glasses' },
  { id: '30', name: 'Gloves & Scarf' },
  { id: '31', name: 'Underwear & Sleepwear' },
  { id: '44', name: 'Perfume' },
  { id: '37', name: 'Toy' },
  { id: '16', name: 'Accessories (Misc)' },
  { id: '36', name: 'Sports Goods' },
  { id: '38', name: 'Phone Case' },
  { id: '20', name: 'Watches' },
  { id: '21', name: 'Cell Phone' },
  { id: '22', name: 'Earphone' },
  { id: '23', name: 'Computer Accessories' },
  { id: '24', name: 'Audio & Video' }
];

// Sort alphabetically
const sortedCategories = [...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name));

export default function Sidebar() {
  const { category: selectedCategory, setCategory, sidebarOpen } = useStore();

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">CSSDealsWeb</h1>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-link ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setCategory('all')}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <LayoutGrid size={18} style={{ marginRight: '0.75rem' }} />
          Todos
        </button>
        
        {sortedCategories.map((cat) => (
          <button
            key={cat.id}
            className={`sidebar-link ${selectedCategory === String(cat.id) ? 'active' : ''}`}
            onClick={() => setCategory(String(cat.id))}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <span style={{ marginLeft: '1.8rem' }}>{cat.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
