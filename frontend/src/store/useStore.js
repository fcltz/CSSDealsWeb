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
      setCategory: (category) => set({ category }),
      sort: 'recent',
      setSort: (sort) => set({ sort }),
      
      // Reset filtros
      resetFilters: () => set({ search: '', category: 'all', sort: 'recent' })
    }),
    {
      name: 'cssdeals-storage',
      partialize: (state) => ({ theme: state.theme }), // Persiste apenas o tema
    }
  )
);

export default useStore;
