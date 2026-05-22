import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { useDebounce } from '../hooks/useDebounce';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/Skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_SIZES = {
  '12': ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], // Coat
  '33': ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], // Down Jacket
  '32': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], // Hoodie
  '35': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], // Long Sleeve
  '15': [
    'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL',
    '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42'
  ], // Pants
  '11': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'], // Shoes
  '34': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], // Suit
  '14': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] // T-shirts
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

const sortedCategories = [...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name));

export default function Home() {
  const { 
    category, 
    toggleCategory,
    setCategory,
    selectedFromSidebar,
    search, 
    sort, 
    setSort, 
    minPrice, 
    setMinPrice, 
    maxPrice, 
    setMaxPrice,
    size,
    setSize
  } = useStore();

  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const catDropdownRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
        setCategoriesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const debouncedSearch = useDebounce(search, 500);
  
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  
  const debouncedMinPrice = useDebounce(localMinPrice, 500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 500);
  
  const [page, setPage] = useState(1);
  const limit = 25;

  // Sync store changes back to local inputs (e.g. on resetFilters)
  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  // Sync debounced inputs to store
  useEffect(() => {
    setMinPrice(debouncedMinPrice);
  }, [debouncedMinPrice, setMinPrice]);

  useEffect(() => {
    setMaxPrice(debouncedMaxPrice);
  }, [debouncedMaxPrice, setMaxPrice]);

  // Reset page when search, category, prices, or size change
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, sort, debouncedMinPrice, debouncedMaxPrice, size]);

  const { data, isLoading, isError, error } = useProducts({
    page,
    limit,
    category,
    search: debouncedSearch,
    sort,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    size
  });

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(p => p + 1);
    }
  };

  const activeCategoriesWithSizes = Array.isArray(category) 
    ? category.filter(catId => CATEGORY_SIZES[catId] !== undefined)
    : (CATEGORY_SIZES[category] ? [category] : []);

  const availableSizes = Array.from(new Set(
    activeCategoriesWithSizes.flatMap(catId => CATEGORY_SIZES[catId] || [])
  ));

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];
  const sortedAvailableSizes = [...availableSizes].sort((a, b) => {
    const isANum = !isNaN(a);
    const isBNum = !isNaN(b);
    if (isANum && isBNum) {
      return parseInt(a) - parseInt(b);
    }
    if (isANum) return 1;
    if (isBNum) return -1;
    const aIdx = SIZE_ORDER.indexOf(a);
    const bIdx = SIZE_ORDER.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) {
      return aIdx - bIdx;
    }
    return a.localeCompare(b);
  });

  const getCategoryTitle = () => {
    if (!category || category.length === 0 || category === 'all') {
      return 'Todos os Produtos';
    }
    const catArray = Array.isArray(category) ? category : [category];
    const names = catArray
      .map(catId => CATEGORIES.find(c => String(c.id) === String(catId))?.name)
      .filter(Boolean);
    return names.join(', ');
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          {getCategoryTitle()}
        </h2>
        
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="price-filter-container">
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Preço (¥):</span>
            <input
              type="number"
              className="price-input"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
            />
            <span style={{ color: 'var(--text-tertiary)' }}>-</span>
            <input
              type="number"
              className="price-input"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
            />
          </div>

          {/* Filtro de Categorias Multi-seleção */}
          {!selectedFromSidebar && (
            <div ref={catDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="filter-select"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  minWidth: '180px',
                  height: '42px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  padding: '0 1rem',
                  border: '1px solid var(--border-color)',
                  outline: 'none'
                }}
              >
                <span>
                  {category.length === 0 
                    ? 'Todas as Categorias' 
                    : `${category.length} selecionada(s)`}
                </span>
                <span style={{ 
                  transition: 'transform 0.2s', 
                  transform: categoriesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  fontSize: '0.7rem',
                  opacity: 0.7
                }}>▼</span>
              </button>

              {categoriesDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.35rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  width: '260px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '0.5rem'
                }}>
                  <div 
                    onClick={() => {
                      setCategory('all');
                      setCategoriesDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: category.length === 0 ? '700' : 'normal',
                      backgroundColor: category.length === 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: category.length === 0 ? 'var(--accent-primary)' : 'var(--text-primary)',
                      marginBottom: '0.25rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    <span>Todas as Categorias</span>
                    {category.length === 0 && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                  </div>

                  {sortedCategories.map((cat) => {
                    const isSelected = category.includes(String(cat.id));
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(String(cat.id))}
                        style={{
                          padding: '0.5rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: isSelected ? '600' : 'normal',
                          transition: 'background-color 0.15s',
                          marginTop: '0.15rem'
                        }}
                        className="cat-dropdown-item"
                      >
                        <span>{cat.name}</span>
                        {isSelected && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <select 
            className="filter-select" 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Mais Recentes</option>
            <option value="oldest">Mais Antigos</option>
          </select>
        </div>
      </div>

      {/* Sizing Filter Badges */}
      {sortedAvailableSizes.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Tamanho:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSize('')}
              className={`size-badge-btn ${size === '' ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: '1px solid var(--border)',
                backgroundColor: size === '' ? 'var(--primary)' : 'var(--bg-card)',
                color: size === '' ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Todos
            </button>
            {sortedAvailableSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`size-badge-btn ${size === s ? 'active' : ''}`}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: '1px solid var(--border)',
                  backgroundColor: size === s ? 'var(--primary)' : 'var(--bg-card)',
                  color: size === s ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : isError ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '3rem' }}>
          <h3>Erro ao carregar produtos.</h3>
          <p>{error?.message || 'Tente novamente mais tarde.'}</p>
        </div>
      ) : data?.data?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-tertiary)' }}>
          <h3>Nenhum produto encontrado.</h3>
          <p>Tente ajustar os filtros ou termo de busca.</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {data?.data?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn-icon" 
                onClick={handlePrevPage} 
                disabled={page === 1}
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="page-info">
                Página {page} de {data.pagination.totalPages}
              </span>
              
              <button 
                className="btn-icon" 
                onClick={handleNextPage} 
                disabled={page >= data.pagination.totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
