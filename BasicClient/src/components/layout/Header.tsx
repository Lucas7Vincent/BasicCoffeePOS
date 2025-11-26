'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Bell, User, Search, Settings, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left side - Search */}
      <div className="flex-1 max-w-md">
        
      </div>
      
      {/* Right side - User info */}
      <div className="flex items-center gap-3">
        {/* <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </Button> */}
        
        {/* <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Button> */}
        
        <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.fullName || 'Người dùng'}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}