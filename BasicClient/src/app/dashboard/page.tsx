'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { 
  Coffee, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, 
  Clock, Star, RefreshCw, AlertCircle, BarChart3, Activity 
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency, getCurrencyTextSize, formatDate, getTimestampWithSource, debugOrderTimestamp } from '@/lib/utils';
import { dashboardService, DashboardStats, RecentOrder, TopProduct } from '@/services/dashboardService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Loading skeleton component
const StatCardSkeleton = () => (
  <Card className="card-modern">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);

  // 🚀 ENHANCED QUERIES WITH AGGRESSIVE CACHE INVALIDATION
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', refreshKey],
    queryFn: () => dashboardService.getAnalyticsDashboardStats(),
    refetchInterval: 30000,
    staleTime: 0, // Consider data stale immediately
    gcTime: 1000 * 60, // Cache for 1 minute only (renamed from cacheTime)
  });

  const { 
    data: recentOrders, 
    isLoading: ordersLoading 
  } = useQuery<RecentOrder[]>({
    queryKey: ['recent-orders', refreshKey],
    queryFn: () => dashboardService.getRecentOrders(5),
    refetchInterval: 5000, // 🎯 More aggressive refresh for real-time feel
    staleTime: 0,
    gcTime: 1000 * 30, // Shorter cache time
  });

  const { 
    data: topProducts, 
    isLoading: productsLoading 
  } = useQuery<TopProduct[]>({
    queryKey: ['top-products', refreshKey],
    queryFn: () => dashboardService.getAnalyticsTopProducts(5),
    refetchInterval: 60000,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Calculate time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const statsCards = stats ? [
    {
      title: 'Doanh thu hôm nay',
      value: formatCompactCurrency(stats.revenue.today),
      fullValue: formatCurrency(stats.revenue.today),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      change: `${stats.revenue.changeType === 'increase' ? '+' : stats.revenue.changeType === 'decrease' ? '-' : ''}${stats.revenue.change.toFixed(1)}%`,
      changeType: stats.revenue.changeType,
      description: `So với hôm qua: ${formatCompactCurrency(stats.revenue.yesterday)}`,
      textSize: getCurrencyTextSize(stats.revenue.today),
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCompactCurrency(stats.revenue.thisMonth),
      fullValue: formatCurrency(stats.revenue.thisMonth),
      icon: BarChart3,
      gradient: 'from-indigo-500 to-indigo-600',
      change: `${stats.revenue.monthlyChangeType === 'increase' ? '+' : stats.revenue.monthlyChangeType === 'decrease' ? '-' : ''}${stats.revenue.monthlyChange.toFixed(1)}%`,
      changeType: stats.revenue.monthlyChangeType,
      description: `So với tháng trước: ${formatCompactCurrency(stats.revenue.lastMonth)}`,
      textSize: getCurrencyTextSize(stats.revenue.thisMonth),
    },
    {
      title: 'Đơn hàng hôm nay',
      value: stats.orders.today.toString(),
      fullValue: `${stats.orders.today} đơn hàng`,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-600',
      change: `${stats.orders.changeType === 'increase' ? '+' : stats.orders.changeType === 'decrease' ? '-' : ''}${stats.orders.change.toFixed(1)}%`,
      changeType: stats.orders.changeType,
      description: `Đang xử lý: ${stats.orders.pending} | Hoàn thành: ${stats.orders.completed}`,
      textSize: 'text-3xl xl:text-4xl',
    },
    {
      title: 'Đơn hàng tháng này',
      value: stats.orders.thisMonth.toString(),
      fullValue: `${stats.orders.thisMonth} đơn hàng`,
      icon: Activity,
      gradient: 'from-cyan-500 to-cyan-600',
      change: `${stats.orders.monthlyChangeType === 'increase' ? '+' : stats.orders.monthlyChangeType === 'decrease' ? '-' : ''}${stats.orders.monthlyChange.toFixed(1)}%`,
      changeType: stats.orders.monthlyChangeType,
      description: `So với tháng trước: ${stats.orders.lastMonth} đơn`,
      textSize: 'text-3xl xl:text-4xl',
    },
    {
      title: 'Sản phẩm',
      value: stats.products.total.toString(),
      fullValue: `${stats.products.total} sản phẩm`,
      icon: Coffee,
      gradient: 'from-amber-500 to-orange-500',
      change: `${stats.products.categories} danh mục`,
      changeType: 'neutral' as const,
      description: stats.products.lowStock > 0 ? `${stats.products.lowStock} sản phẩm sắp hết` : 'Tất cả còn hàng',
      textSize: 'text-3xl xl:text-4xl',
    },
    {
      title: 'Tỷ lệ lấp đầy bàn',
      value: `${stats.tables.occupied}/${stats.tables.total}`,
      fullValue: `${stats.tables.occupied}/${stats.tables.total} bàn`,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      change: `${stats.tables.occupancyRate.toFixed(1)}%`,
      changeType: stats.tables.occupancyRate > 70 ? 'increase' : stats.tables.occupancyRate < 30 ? 'decrease' : 'neutral',
      description: `${stats.tables.available} bàn trống`,
      textSize: 'text-3xl xl:text-4xl',
    },
  ] : [];

  // ✅ CLEAN ORDER DISPLAY COMPONENT
  const OrderCard = ({ order }: { order: RecentOrder }) => {
    return (
      <div 
        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-blue-50 hover:to-blue-100/50 transition-all duration-300 border border-gray-200/50"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
            {order.tableName.split(' ')[1] || 'T'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">#{order.id}</p>
            <p className="text-sm text-gray-600">{order.tableName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {/* ✅ CLEAN TIMESTAMP DISPLAY */}
              <span>{formatDate(order.displayTimestamp)}</span>
              <span>•</span>
              <span>{order.userFullName}</span>
              
              {/* Simple payment indicator */}
              {order.status === 'Paid' && (
                <span className="text-green-600 ml-1">💳</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            order.status === 'Paid' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : order.status === 'Ordering'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {order.status === 'Paid' ? '✅ Hoàn thành' : 
             order.status === 'Ordering' ? '🔄 Đang order' : '❌ Đã hủy'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white rounded-3xl mx-6 mt-6 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-blue-500/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 via-indigo-400/5 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-400/10 via-blue-400/5 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  {statsLoading ? 'Đang tải...' : 'Hệ thống hoạt động'}
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                {getGreeting()}, {user?.fullName}! 👋
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Tổng quan hoạt động kinh doanh hôm nay
              </p>
              {stats && (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <DollarSign className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-medium">Hôm nay: {formatCompactCurrency(stats.revenue.today)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <BarChart3 className="w-4 h-4 text-blue-300" />
                    <span className="text-white font-medium">Tháng: {formatCompactCurrency(stats.revenue.thisMonth)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <ShoppingCart className="w-4 h-4 text-purple-300" />
                    <span className="text-white font-medium">{stats.orders.today} đơn hàng</span>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="bg-white/15 border-white/30 text-white hover:bg-white/25 hover:border-white/40 backdrop-blur-sm transition-all duration-300"
                disabled={statsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <div className="w-28 h-28 bg-gradient-to-br from-white/15 to-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                <Coffee className="w-14 h-14 text-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Error handling */}
        {statsError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>Không thể tải dữ liệu dashboard. Vui lòng thử lại.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchStats()}
                  className="ml-auto"
                >
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsLoading ? (
            Array(6).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const isPositive = stat.changeType === 'increase';
              const isNegative = stat.changeType === 'decrease';
              
              return (
                <Card key={stat.title} className="card-modern hover-lift group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <div className="space-y-1">
                          <p className={`font-bold tracking-tight ${stat.textSize} break-words`} title={stat.fullValue}>
                            {stat.value}
                          </p>
                          <div className="flex items-center space-x-2">
                            {stat.changeType !== 'neutral' && (
                              <div className={`flex items-center space-x-1 ${
                                isPositive ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {isPositive ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                  {stat.change}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🎯 ENHANCED RECENT ORDERS WITH SMART TIMESTAMPS */}
          <div className="lg:col-span-2">
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Đơn hàng gần đây
                  </CardTitle>
                  <Link href="/dashboard/orders">
                    <Button variant="outline" size="sm">
                      Xem tất cả
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 border rounded-xl animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))
                ) : recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order: RecentOrder) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có đơn hàng nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Products with Real Data */}
          <div>
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Sản phẩm bán chạy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {productsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 border rounded-xl animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : topProducts && topProducts.length > 0 ? (
                  topProducts.map((product: TopProduct, index: number) => (
                    <div key={product.productId} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-600">{product.totalSold} đã bán</p>
                          <p className="text-xs text-gray-500">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{product.categoryName}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Coffee className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có dữ liệu bán hàng</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/dashboard/pos">
            <Card className="card-modern hover-lift cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Bắt đầu POS</h3>
                <p className="text-sm text-gray-600">Tạo đơn hàng mới</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/orders">
            <Card className="card-modern hover-lift cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Đơn hàng</h3>
                <p className="text-sm text-gray-600">Quản lý đơn hàng</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/tables">
            <Card className="card-modern hover-lift cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quản lý bàn</h3>
                <p className="text-sm text-gray-600">Tình trạng bàn</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="card-modern hover-lift cursor-pointer group" onClick={handleRefresh}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Báo cáo</h3>
              <p className="text-sm text-gray-600">Thống kê chi tiết</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}