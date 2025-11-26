'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coffee, Eye, EyeOff } from 'lucide-react';
import { LogoIcon } from '@/components/ui/Logo';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data);
      router.push('/dashboard');
    } catch (error) {
      // Error handled by store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f5f1e8 0%, #ede7d9 50%, #e8dcc0 100%)'
    }}>
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Coffee Bean Decorations */}
        <div 
          className="absolute opacity-5 transform rotate-12"
          style={{
            top: '10%',
            left: '5%',
            width: '80px',
            height: '80px',
            background: '#c85a54',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
          }}
        />
        <div 
          className="absolute opacity-5 transform -rotate-45"
          style={{
            top: '70%',
            right: '8%',
            width: '60px',
            height: '60px',
            background: '#c85a54',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
          }}
        />
        <div 
          className="absolute opacity-5 transform rotate-45"
          style={{
            bottom: '15%',
            left: '10%',
            width: '100px',
            height: '100px',
            background: '#c85a54',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Main Container */}
        <div className="w-full max-w-md">
          {/* Logo & Brand Section */}
          <div className="text-center mb-12">
            <div className="relative">
              {/* Logo + Brand Name - Horizontal Layout */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
                {/* Logo Icon */}
                <div className="transform hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <LogoIcon size="xl" />
                </div>
                
                {/* Brand Name */}
                <div className="text-left">
                  <h1 
                    className="text-4xl sm:text-5xl font-light leading-none tracking-wider"
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      color: '#c85a54'
                    }}
                  >
                    basic.
                  </h1>
                  <div 
                    className="text-xs sm:text-sm tracking-wider mt-1"
                    style={{ color: '#c85a54' }}
                  >
                    cà phê và bia.
                  </div>
                </div>
              </div>
              
              {/* Decorative line */}
              <div 
                className="w-12 h-1 mx-auto rounded-full"
                style={{ backgroundColor: '#c85a54' }}
              />
            </div>
            
            <p className="mt-8 text-gray-600 font-light">
              Chào mừng 2 thằng em Đức và Trân trở lại.
            </p>
          </div>

          {/* Login Form */}
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px 0 rgba(200, 90, 84, 0.15)',
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium tracking-wide text-amber-800"
                >
                  Tên đăng nhập
                </label>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="Nhập tên đăng nhập của bạn"
                  disabled={isLoading}
                  className="w-full px-4 py-4 rounded-2xl border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300 bg-white bg-opacity-80"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm font-light">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium tracking-wide text-amber-800"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu của bạn"
                    disabled={isLoading}
                    className="w-full px-4 py-4 pr-12 rounded-2xl border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300 bg-white bg-opacity-80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm font-light">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl text-white font-medium tracking-wide transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: isLoading 
                    ? 'linear-gradient(135deg, #a64a44 0%, #8b3a35 100%)'
                    : 'linear-gradient(135deg, #c85a54 0%, #a64a44 100%)',
                  boxShadow: '0 4px 15px 0 rgba(200, 90, 84, 0.3)'
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500 font-light">
              © 2025 basic. POS. Hệ thống quản lý POS cho 2 thằng em Đức và Trân.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}