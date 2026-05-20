import React, { useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400?text=No+Image'];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openSource = () => {
    window.open(product.source_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="product-card">
        <div className="product-image-container">
          <img 
            src={images[currentImageIndex]} 
            alt={product.title} 
            className="product-image"
            loading="lazy"
            onClick={() => setLightboxOpen(true)}
            style={{ cursor: 'pointer' }}
          />
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', maxWidth: 'calc(100% - 2rem)', overflow: 'hidden', zIndex: 2 }}>
            <div className="product-category-badge" style={{ position: 'static', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
              {product.category_name || 'Produto'}
            </div>
            {(() => {
              if (!Array.isArray(product.skus) || product.skus.length === 0) return null;
              
              const sizes = new Set();
              const colors = new Set();
              
              product.skus.forEach(sku => {
                if (sku.size) sizes.add(sku.size);
                if (sku.color) colors.add(sku.color);
                
                if (!sku.color && sku.skuNames) {
                  const matchColor = sku.skuNames.match(/(?:Color classification|Color):([^;]+)/i);
                  if (matchColor) colors.add(matchColor[1].trim());
                }
                if (!sku.size && sku.skuNames) {
                  const matchSize = sku.skuNames.match(/Size:([^;]+)/i);
                  if (matchSize) sizes.add(matchSize[1].trim());
                }
              });
              
              const sizesArr = Array.from(sizes);
              const colorsArr = Array.from(colors);
              
              const sizeText = sizesArr.length > 0 ? (sizesArr.length > 3 ? `${sizesArr.slice(0, 3).join(', ')}...` : sizesArr.join(', ')) : null;
              const colorText = colorsArr.length > 0 ? (colorsArr.length > 2 ? `${colorsArr.slice(0, 2).join(', ')}...` : colorsArr.join(', ')) : null;

              return (
                <>
                  {sizeText && (
                    <div className="product-category-badge" style={{ position: 'static', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                      Size: {sizeText}
                    </div>
                  )}
                  {colorText && (
                    <div className="product-category-badge" style={{ position: 'static', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                      Color: {colorText}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          
          {images.length > 1 && (
            <>
              <button 
                className="carousel-btn prev"
                onClick={prevImage}
                style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '0.25rem' }}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className="carousel-btn next"
                onClick={nextImage}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '0.25rem' }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 1rem', background: 'var(--bg-tertiary)' }}>
            {images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${product.title} thumb ${idx}`} 
                onClick={() => setCurrentImageIndex(idx)}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  objectFit: 'cover', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  border: currentImageIndex === idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  flexShrink: 0
                }} 
              />
            ))}
          </div>
        )}
        
        <div className="product-info">
          <h3 className="product-title" title={product.title}>{product.title}</h3>
          
          <div className="product-meta">
            {(() => {
              let priceYuanStr = 'Preço indisponível';
              let priceRealStr = '';
              const YUAN_TO_REAL = 0.75; // Taxa de conversão aproximada
              
              const prices = Array.isArray(product.skus) ? product.skus.map(s => Number(s.price)).filter(p => !isNaN(p) && p > 0) : [];
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                if (minPrice === maxPrice) {
                  priceYuanStr = `¥${minPrice.toFixed(2)}`;
                  priceRealStr = `(~ R$ ${(minPrice * YUAN_TO_REAL).toFixed(2)})`;
                } else {
                  priceYuanStr = `¥${minPrice.toFixed(2)} - ¥${maxPrice.toFixed(2)}`;
                  priceRealStr = `(~ R$ ${(minPrice * YUAN_TO_REAL).toFixed(2)} a R$ ${(maxPrice * YUAN_TO_REAL).toFixed(2)})`;
                }
              } else if (product.price) {
                const p = Number(product.price);
                if (!isNaN(p) && p > 0) {
                  priceYuanStr = `¥${p.toFixed(2)}`;
                  priceRealStr = `(~ R$ ${(p * YUAN_TO_REAL).toFixed(2)})`;
                }
              }
              
              return (
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {priceYuanStr}
                  {priceRealStr && <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '400' }}>{priceRealStr}</span>}
                </p>
              );
            })()}
            <p><strong>Atualizado em:</strong> {new Date(product.updated_at).toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div className="product-footer" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <button 
              className="btn-primary" 
              onClick={() => window.open(`https://cssdeals.com/product-detail.html?itemid=${product.id}`, '_blank', 'noopener,noreferrer')} 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ExternalLink size={16} />
              CSSDeals
            </button>
            <button 
              className="btn-primary" 
              onClick={openSource} 
              style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              <ExternalLink size={16} />
              Source Link
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }} 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'white', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', zIndex: 10000 }}
          >
            &times;
          </button>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={images[currentImageIndex]} 
              alt="Fullscreen" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} 
              onClick={(e) => e.stopPropagation()}
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'white', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  onClick={nextImage} 
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'white', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
