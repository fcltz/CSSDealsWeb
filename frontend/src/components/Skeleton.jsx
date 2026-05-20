import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton" style={{ height: '50%', width: '100%' }}></div>
      <div className="product-info">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
        <div style={{ marginTop: 'auto' }}>
          <div className="skeleton skeleton-text short" style={{ height: '36px', borderRadius: 'var(--radius-md)' }}></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="loading-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
