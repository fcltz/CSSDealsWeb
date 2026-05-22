import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      sidebarCollapsed: false,
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Filtros
      search: '',
      setSearch: (search) => set({ search }),
      category: [],
      selectedFromSidebar: false,
      setCategory: (catId) => set({ 
        category: catId === 'all' ? [] : [String(catId)], 
        selectedFromSidebar: catId !== 'all',
        size: '' 
      }),
      toggleCategory: (catId) => set((state) => {
        const current = Array.isArray(state.category) ? state.category : [];
        const next = current.includes(catId)
          ? current.filter(id => id !== catId)
          : [...current, catId];
        return { category: next, selectedFromSidebar: false, size: '' };
      }),
      sort: 'recent',
      setSort: (sort) => set({ sort }),
      minPrice: '',
      setMinPrice: (minPrice) => set({ minPrice }),
      maxPrice: '',
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      size: '',
      setSize: (size) => set({ size }),
      
      // Reset filtros
      resetFilters: () => set({ search: '', category: [], selectedFromSidebar: false, sort: 'recent', minPrice: '', maxPrice: '', size: '' }),

      // Autenticação & Perfil
      user: null,
      token: null,
      profile: null,
      authLoading: false,
      authError: null,

      login: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { session, user } = res.data;
          set({ token: session.access_token, user, authLoading: false });
          // Após login de sucesso, busca o perfil correspondente
          await get().fetchProfile();
          return { success: true };
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Erro ao realizar login. Verifique suas credenciais.';
          const dbDetails = error.response?.data?.details;
          set({ authError: dbDetails ? `${errMsg} (${dbDetails})` : errMsg, authLoading: false });
          return { success: false, error: errMsg };
        }
      },

      register: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          await api.post('/auth/register', { email, password });
          set({ authLoading: false });
          return { success: true };
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Erro ao realizar cadastro.';
          const dbDetails = error.response?.data?.details;
          set({ authError: dbDetails ? `${errMsg} (${dbDetails})` : errMsg, authLoading: false });
          return { success: false, error: errMsg };
        }
      },

      logout: () => {
        set({ token: null, user: null, profile: null, authError: null });
      },

      fetchProfile: async () => {
        if (!get().token) return;
        try {
          const res = await api.get('/profile');
          set({ profile: res.data });
        } catch (error) {
          console.error('Erro ao buscar perfil:', error.response?.data?.error || error.message);
          // Se o token estiver inválido/expirado, desloga o usuário
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },

      updateDiscordId: async (discord_id) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await api.put('/profile/discord', { discord_id });
          set({ profile: res.data.profile, authLoading: false });
          return { success: true };
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Erro ao atualizar ID do Discord.';
          set({ authError: errMsg, authLoading: false });
          return { success: false, error: errMsg };
        }
      },

      updateAlertFilters: async (alert_categories, alert_sizes) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await api.put('/profile/filters', { alert_categories, alert_sizes });
          set({ profile: res.data.profile, authLoading: false });
          return { success: true };
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Erro ao atualizar filtros de alerta.';
          set({ authError: errMsg, authLoading: false });
          return { success: false, error: errMsg };
        }
      },

      subscribePlan: async (plan) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await api.put('/profile/plan', { plan });
          set({ profile: res.data.profile, authLoading: false });
          return { success: true };
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Erro ao atualizar plano.';
          set({ authError: errMsg, authLoading: false });
          return { success: false, error: errMsg };
        }
      }
    }),
    {
      name: 'cssdeals-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        token: state.token, 
        user: state.user, 
        profile: state.profile 
      }), // Persiste tema, token, dados do usuário e perfil
    }
  )
);

export default useStore;
