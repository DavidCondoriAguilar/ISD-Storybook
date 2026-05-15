import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * STORE GLOBAL DE LA APLICACIÓN (ISD Command Center)
 * Maneja el estado compartido sin necesidad de Prop Drilling.
 */
export const useAppStore = create(
  persist(
    (set) => ({
      // --- ESTADO: TEMA ---
      theme: 'light',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),

      // --- ESTADO: FILTROS DE TIEMPO (Compartido) ---
      globalTimeRange: 'all',
      globalStartDate: '',
      globalEndDate: '',
      setGlobalDateFilter: (range, start, end) => {
        set({ globalTimeRange: range, globalStartDate: start, globalEndDate: end });
      },

      // --- ESTADO: UI ---
      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      
      activeTooltip: null,
      setActiveTooltip: (tooltip) => set({ activeTooltip: tooltip }),

      // --- ESTADO: DATOS GLOBALES (Opcional para futuro) ---
      lastRefresh: new Date().toISOString(),
      triggerRefresh: () => set({ lastRefresh: new Date().toISOString() })
    }),
    {
      name: 'isd-app-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        globalTimeRange: state.globalTimeRange,
        globalStartDate: state.globalStartDate,
        globalEndDate: state.globalEndDate
      })
    }
  )
);
