import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar states
  isMobileSidebarCollapsed: boolean;
  isDesktopSidebarCollapsed: boolean;
  
  // Actions
  toggleMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
  setMobileSidebarCollapsed: (collapsed: boolean) => void;
  setDesktopSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial states
      isMobileSidebarCollapsed: true,
      isDesktopSidebarCollapsed: false,
      
      // Toggle functions
      toggleMobileSidebar: () => set((state) => ({ 
        isMobileSidebarCollapsed: !state.isMobileSidebarCollapsed 
      })),
      
      toggleDesktopSidebar: () => set((state) => ({ 
        isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed 
      })),
      
      // Set functions
      setMobileSidebarCollapsed: (collapsed: boolean) => set({ 
        isMobileSidebarCollapsed: collapsed 
      }),
      
      setDesktopSidebarCollapsed: (collapsed: boolean) => set({ 
        isDesktopSidebarCollapsed: collapsed 
      }),
    }),
    {
      name: 'ui-storage', // Lưu vào localStorage
      partialize: (state) => ({ 
        isDesktopSidebarCollapsed: state.isDesktopSidebarCollapsed 
      }), // Chỉ persist trạng thái desktop sidebar
    }
  )
);

