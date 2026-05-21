import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { useDebounce } from '../hooks/useDebounce';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/Skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const { 
    category, 
    search, 
    sort, 
    setSort, 
    minPrice, 
    setMinPrice, 
    maxPrice, 
    setMaxPrice 
  } = useStore();
  
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

  // Reset page when search, category, or prices change
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, sort, debouncedMinPrice, debouncedMaxPrice]);

  const { data, isLoading, isError, error } = useProducts({
    page,
    limit,
    category,
    search: debouncedSearch,
    sort,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice
  });

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(p => p + 1);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          {category === 'all' ? 'Todos os Produtos' : 'Produtos da Categoria'}
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
