'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  LayoutDashboard,
  Coffee,
  Package,
  Users,
  ShoppingCart,
  TableProperties,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Tags,
  BarChart3,
  FileText
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/Logo';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Staff', 'Cashier', 'Manager'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'POS',
    href: '/dashboard/pos',
    icon: Coffee,
    roles: ['Staff', 'Cashier', 'Manager'],
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'Đơn hàng',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    roles: ['Cashier', 'Manager'],
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Sản phẩm',
    href: '/dashboard/products',
    icon: Package,
    roles: ['Manager'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Danh mục',
    href: '/dashboard/categories',
    icon: Tags,
    roles: ['Manager'],
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Bàn',
    href: '/dashboard/tables',
    icon: TableProperties,
    roles: ['Manager'],
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    title: 'Nhân viên',
    href: '/dashboard/users',
    icon: Users,
    roles: ['Manager'],
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Báo cáo',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: ['Cashier', 'Manager'],
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Hướng dẫn',
    href: '/dashboard/docs',
    icon: FileText,
    roles: ['Staff', 'Cashier', 'Manager'],
    color: 'from-gray-500 to-gray-600'
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { 
    isMobileSidebarCollapsed, 
    isDesktopSidebarCollapsed,
    toggleMobileSidebar,
    toggleDesktopSidebar,
    setMobileSidebarCollapsed
  } = useUIStore();

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white"
        onClick={toggleMobileSidebar}
      >
        {!isMobileSidebarCollapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex fixed top-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white transition-all duration-300"
        style={{ 
          left: isDesktopSidebarCollapsed ? '68px' : '232px'
        }}
        onClick={toggleDesktopSidebar}
      >
        {isDesktopSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        // Mobile
        isMobileSidebarCollapsed ? "-translate-x-full" : "translate-x-0",
        // Desktop
        "md:translate-x-0",
        // Width
        isDesktopSidebarCollapsed ? "md:w-16" : "md:w-60",
        "w-60"
      )}>
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50">
          {/* Header */}
          <div className={cn(
            "border-b border-gray-200/50 transition-all duration-300",
            isDesktopSidebarCollapsed ? "p-3" : "p-5"
          )}>
            <div className={cn(
              "flex items-center transition-all duration-300",
              isDesktopSidebarCollapsed ? "justify-center" : "space-x-3"
            )}>
              <LogoIcon size="md" />
              {!isDesktopSidebarCollapsed && (
                <div>
                  <h2 className="text-lg font-bold text-gradient">basic. POS</h2>
                  <p className="text-xs text-gray-500">Cà phê và bia</p>
                </div>
              )}
            </div>
            {user && !isDesktopSidebarCollapsed && (
              <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/50">
                <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 overflow-y-auto custom-scrollbar transition-all duration-300",
            isDesktopSidebarCollapsed ? "p-2 space-y-1" : "p-3 space-y-1.5"
          )}>
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <div key={item.href} className="relative group">
                  <Link href={item.href} className="block">
                    <div className={cn(
                      "group relative flex items-center rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm" 
                        : "hover:bg-gray-50 hover:shadow-sm",
                      isDesktopSidebarCollapsed 
                        ? "justify-center p-2.5" 
                        : "space-x-3 px-3 py-2.5"
                    )}>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 flex-shrink-0",
                        isActive 
                          ? `bg-gradient-to-br ${item.color} shadow-lg` 
                          : "bg-gray-100 group-hover:bg-gray-200"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-white" : "text-gray-600 group-hover:text-gray-700"
                        )} />
                      </div>
                      
                      {!isDesktopSidebarCollapsed && (
                        <>
                          <span className={cn(
                            "font-medium transition-colors flex-1",
                            isActive ? "text-blue-900" : "text-gray-700 group-hover:text-gray-900"
                          )}>
                            {item.title}
                          </span>

                          <ChevronRight className={cn(
                            "w-4 h-4 transition-all duration-200",
                            isActive 
                              ? "text-blue-600 translate-x-1" 
                              : "text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1"
                          )} />
                        </>
                      )}
                    </div>
                  </Link>

                  {/* Tooltip cho collapsed state */}
                  {isDesktopSidebarCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={cn(
            "border-t border-gray-200/50 transition-all duration-300",
            isDesktopSidebarCollapsed ? "p-2" : "p-3"
          )}>
            <Button
              variant="outline"
              className={cn(
                "w-full h-auto bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all duration-200",
                isDesktopSidebarCollapsed 
                  ? "justify-center p-2.5" 
                  : "justify-start gap-3 py-2.5 px-3"
              )}
              onClick={logout}
            >
              <div className="p-1 rounded-lg bg-red-200 flex-shrink-0">
                <LogOut className="h-4 w-4 text-red-700" />
              </div>
              {!isDesktopSidebarCollapsed && (
                <span className="font-medium">Đăng xuất</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isMobileSidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarCollapsed(true)}
        />
      )}
    </>
  );
}