import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { 
  LayoutGrid, CreditCard, User, LogIn, LogOut, Tags, ChevronLeft, ChevronRight,
  Shirt, Footprints, Briefcase, Flame, Sparkles, Glasses, Wind, Moon, Droplet, 
  Gamepad, Dumbbell, Smartphone, Watch, Headphones, Cpu, Video, Layers, ShoppingBag, Crown
} from 'lucide-react';

const CATEGORY_ICONS = {
  '32': Shirt,          // Hoodie
  '40': Footprints,     // Socks
  '45': Briefcase,      // Suitcase
  '11': Footprints,     // Shoes
  '33': Flame,          // Down Jacket
  '12': Shirt,          // Coat
  '14': Shirt,          // T-shirts
  '15': Layers,         // Pants
  '26': ShoppingBag,    // Hat & Bags
  '34': Crown,          // Suit
  '35': Shirt,          // Long Sleeve
  '39': Sparkles,       // Accessories
  '27': Glasses,        // Belt & Glasses
  '30': Wind,           // Gloves & Scarf
  '31': Moon,           // Underwear & Sleepwear
  '44': Droplet,        // Perfume
  '37': Gamepad,        // Toy
  '16': Sparkles,       // Accessories (Misc)
  '36': Dumbbell,       // Sports Goods
  '38': Smartphone,     // Phone Case
  '20': Watch,          // Watches
  '21': Smartphone,     // Cell Phone
  '22': Headphones,     // Earphone
  '23': Cpu,            // Computer Accessories
  '24': Video           // Audio & Video
};

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
  const { 
    category: selectedCategory, 
    setCategory, 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleSidebarCollapsed, 
    token, 
    logout 
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    setCategory(catId);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', gap: '0.5rem' }}>
        {!sidebarCollapsed && (
          <Link to="/" style={{ display: 'block' }}>
            <h1 className="sidebar-title">CSSDealsWeb</h1>
          </Link>
        )}
        <button 
          onClick={toggleSidebarCollapsed} 
          className="sidebar-collapse-btn"
          title={sidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {/* Navegação Global */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link 
            to="/" 
            className={`sidebar-link ${location.pathname === '/' && (!selectedCategory || selectedCategory.length === 0 || selectedCategory === 'all') ? 'active' : ''}`}
            onClick={() => setCategory('all')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <LayoutGrid size={18} style={{ marginRight: sidebarCollapsed ? '0' : '0.75rem' }} />
            <span>Marketplace</span>
          </Link>
          
          {/* Temporariamente ocultado:
          <Link 
            to="/plans" 
            className={`sidebar-link ${location.pathname === '/plans' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <CreditCard size={18} style={{ marginRight: sidebarCollapsed ? '0' : '0.75rem' }} />
            <span>Planos & Preços</span>
          </Link>
          */}

          {token && (
            <>
              <Link 
                to="/profile" 
                className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <User size={18} style={{ marginRight: sidebarCollapsed ? '0' : '0.75rem' }} />
                <span>Meu Perfil</span>
              </Link>
              <button 
                onClick={logout} 
                className="sidebar-link" 
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <LogOut size={18} style={{ marginRight: sidebarCollapsed ? '0' : '0.75rem' }} />
                <span>Sair</span>
              </button>
            </>
          )}
        </div>

        {/* Separador de Categorias */}
        {!sidebarCollapsed && (
          <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tags size={12} /> Categorias
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sortedCategories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.id] || Tags;
            const isCatActive = Array.isArray(selectedCategory)
              ? (selectedCategory.length === 1 && selectedCategory[0] === String(cat.id))
              : selectedCategory === String(cat.id);
            return (
              <button
                key={cat.id}
                className={`sidebar-link ${isCatActive ? 'active' : ''}`}
                onClick={() => handleCategoryClick(String(cat.id))}
                style={{ 
                  width: '100%', 
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.75rem' }}>
                  <IconComponent 
                    size={18} 
                    style={{ 
                      color: isCatActive ? 'white' : 'var(--text-secondary)',
                      flexShrink: 0
                    }} 
                  />
                  <span>{cat.name}</span>
                </div>
                {!sidebarCollapsed && isCatActive && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    marginRight: '0.5rem'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
