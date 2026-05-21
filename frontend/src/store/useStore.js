import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Filtros
      search: '',
      setSearch: (search) => set({ search }),
      category: 'all',
      setCategory: (category) => set({ category, size: '' }),
      sort: 'recent',
      setSort: (sort) => set({ sort }),
      minPrice: '',
      setMinPrice: (minPrice) => set({ minPrice }),
      maxPrice: '',
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      size: '',
      setSize: (size) => set({ size }),
      
      // Reset filtros
      resetFilters: () => set({ search: '', category: 'all', sort: 'recent', minPrice: '', maxPrice: '', size: '' })
    }),
    {
      name: 'cssdeals-storage',
      partialize: (state) => ({ theme: state.theme }), // Persiste apenas o tema
    }
  )
);

export default useStore;
