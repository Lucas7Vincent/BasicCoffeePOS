/**
 * 🎨 LOGO COMPONENT
 * 
 * Centralized logo component với support cho custom size và styling
 * Sử dụng image URL thay vì icon
 * 
 * @version 1.0
 */
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10', 
  lg: 'w-12 h-12',
  xl: 'w-20 h-20'
};

export function Logo({ 
  size = 'md', 
  className = '',
  showText = false,
  variant = 'default'
}: LogoProps) {
  // 🎨 LOGO OPTIONS - Chọn 1 trong các option dưới đây:
  
  // Option 1: Custom Facebook image (current)
  const logoUrl = "https://scontent.fhan5-3.fna.fbcdn.net/v/t39.30808-6/537676991_122100591254988663_1699899582404898173_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=PPAcGCgu-d8Q7kNvwGhG_YK&_nc_oc=AdkliDoLX6nlIClCwCHEqRBBWYpLVdQIRNvKvRFC140-d3zcbZ7N6vATjW0PHkBNxIQ2TOn9k0bh8s2dzp-u3vbQ&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_gid=WFbEOLV9XfwIAKsGCNjMtQ&oh=00_AfjNMcNUc3AR2nToS1a2WjMZNgzQJi7e17PsM3EfgeXokw&oe=692CF925";
  
  // Option 2: Coffee cup with steam
  // const logoUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&crop=center";
  
  // Option 3: Coffee shop interior
  // const logoUrl = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=300&fit=crop&crop=center";
  
  // Option 4: Latte art
  // const logoUrl = "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop&crop=center";
  
  // Option 5: Beer glass
  // const logoUrl = "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=300&fit=crop&crop=center";
  
  // Option 6: Coffee + Beer combination
  // const logoUrl = "https://images.unsplash.com/photo-1517899818563-2580c5ae3834?w=300&h=300&fit=crop&crop=center";
  
  // Option 7: Custom upload (replace với URL ảnh của bạn)
  // const logoUrl = "/path/to/your/custom-logo.png";
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "rounded-2xl overflow-hidden flex-shrink-0 shadow-lg",
        sizeMap[size]
      )}>
        {/* ✅ Use regular img tag for external URLs to avoid Next.js optimization issues */}
        <img
          src={logoUrl}
          alt="basic. POS Logo"
          className="w-full h-full object-cover"
          loading={size === 'xl' ? 'eager' : 'lazy'}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f59e0b" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="middle" fill="white"%3E☕%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      
      {showText && (
        <div>
          <h2 className={cn(
            "font-bold",
            variant === 'white' ? 'text-white' : 
            variant === 'dark' ? 'text-gray-900' : 'text-gradient',
            size === 'xl' ? 'text-5xl' : 
            size === 'lg' ? 'text-2xl' : 'text-lg'
          )}>
            basic.
          </h2>
          <p className={cn(
            "text-xs",
            variant === 'white' ? 'text-white/80' : 
            variant === 'dark' ? 'text-gray-600' : 'text-gray-500'
          )}>
            cà phê và bia
          </p>
        </div>
      )}
    </div>
  );
}

// Alternative logos for different contexts
export function LogoIcon({ size = 'md', className = '' }: Pick<LogoProps, 'size' | 'className'>) {
  // 🎨 Same logo URL as main Logo component
  const logoUrl = "https://scontent.fhan5-3.fna.fbcdn.net/v/t39.30808-6/537676991_122100591254988663_1699899582404898173_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=PPAcGCgu-d8Q7kNvwGhG_YK&_nc_oc=AdkliDoLX6nlIClCwCHEqRBBWYpLVdQIRNvKvRFC140-d3zcbZ7N6vATjW0PHkBNxIQ2TOn9k0bh8s2dzp-u3vbQ&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_gid=WFbEOLV9XfwIAKsGCNjMtQ&oh=00_AfjNMcNUc3AR2nToS1a2WjMZNgzQJi7e17PsM3EfgeXokw&oe=692CF925";
  
  return (
    <div className={cn(
      "rounded-2xl overflow-hidden shadow-lg",
      sizeMap[size],
      className
    )}>
      {/* ✅ Use regular img tag for external URLs */}
      <img
        src={logoUrl}
        alt="basic. POS"
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f59e0b" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="middle" fill="white"%3E☕%3C/text%3E%3C/svg%3E';
        }}
      />
    </div>
  );
}

export default Logo;
