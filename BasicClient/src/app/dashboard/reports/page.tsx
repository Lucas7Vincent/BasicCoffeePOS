/**
 * 📊 ENHANCED ANALYTICS & REPORTS PAGE
 * 
 * ✨ FEATURES:
 * - 🎯 100% API Utilization: All 10 analytics APIs used
 * - 📈 Detailed Product Listings: 50 products with full metrics
 * - ⏰ Enhanced Hourly Analysis: Dual-axis charts + breakdown
 * - 🏷️ Fixed Categories Performance: Horizontal charts + tables  
 * - 💰 Detailed Discount Analysis: Multi-dimensional breakdown
 * - 📋 Professional Excel Export: 6 report types available
 * 
 * 🚀 EXPORT CAPABILITIES:
 * - Comprehensive Analytics (all-in-one workbook)
 * - Revenue Summary (key metrics)
 * - Daily Revenue (time series)
 * - Top Products (50 best sellers)
 * - Payment Methods (transaction analysis)
 * - Discount Analysis (promotion effectiveness)
 * 
 * 🎨 UX IMPROVEMENTS:
 * - Real-time loading states & skeletons
 * - Interactive dropdown exports
 * - Quick export buttons per tab
 * - Professional color schemes
 * - Error boundaries & fallbacks
 * 
 * @version 2.0 - Enterprise Ready
 * @author TechLead Team
 */
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatCompactCurrency, getCurrencyTextSize, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Clock,
  Percent,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Download,
  RefreshCw,
  AlertTriangle,
  FileText,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Color schemes for charts
const CHART_COLORS = {
  primary: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'],
  revenue: ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D'],
  products: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#172554'],
  categories: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
  payments: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95']
};

// ✅ LOADING SKELETON COMPONENTS
const CardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
    </CardHeader>
    <CardContent>
      <div className="h-80 bg-gray-100 rounded animate-pulse" />
    </CardContent>
  </Card>
);

// ✅ ERROR BOUNDARY COMPONENT
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class AnalyticsErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analytics Error:', error, errorInfo);
    toast.error('Có lỗi xảy ra khi tải dữ liệu analytics');
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Có lỗi xảy ra khi tải dữ liệu
          </h3>
          <p className="text-muted-foreground mb-4">
            Vui lòng thử lại sau hoặc liên hệ support
          </p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

// ✅ ADVANCED DATE FILTERS
interface DateRange {
  startDate: string;
  endDate: string;
}

interface AdvancedFiltersProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onApplyFilters?: (range: DateRange) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ dateRange, setDateRange, onApplyFilters }) => {
  const [tempRange, setTempRange] = useState(dateRange);
  const [quickFilter, setQuickFilter] = useState('');

  const quickFilters = [
    { label: 'Hôm nay', value: 'today' },
    { label: '7 ngày qua', value: '7days' },
    { label: '30 ngày qua', value: '30days' },
    { label: 'Tháng này', value: 'thisMonth' },
    { label: 'Tháng trước', value: 'lastMonth' }
  ];

  const applyQuickFilter = (filterType: string) => {
    const now = new Date();
    let startDate, endDate;

    switch (filterType) {
      case 'today':
        startDate = endDate = now.toISOString().split('T')[0];
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    const newRange = { startDate, endDate };
    setTempRange(newRange);
    setDateRange(newRange);
    setQuickFilter(filterType);
    onApplyFilters?.(newRange);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={quickFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => applyQuickFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={tempRange.startDate}
                onChange={(e) => setTempRange((prev: DateRange) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={tempRange.endDate}
                onChange={(e) => setTempRange((prev: DateRange) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={() => {
              setDateRange(tempRange);
              setQuickFilter('');
              onApplyFilters?.(tempRange);
            }}
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            Áp dụng bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ EXPORT FUNCTIONALITY
interface ExportControlsProps {
  analyticsData: any;
  dateRange: DateRange;
}

const ExportControls: React.FC<ExportControlsProps> = ({ analyticsData, dateRange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'comprehensive' | 'revenue-summary' | 'daily-revenue' | 'top-products' | 'payment-methods' | 'discount-analysis'>('comprehensive');

  const handleExcelExport = async (type: typeof exportType) => {
    try {
      setIsExporting(true);
      setExportType(type);
      
      console.log(`📊 Exporting Excel report: ${type}`);
      toast.loading('Đang tạo báo cáo Excel...', { id: 'excel-export' });

      const response = await apiClient.exportAnalyticsExcel(
        type,
        dateRange.startDate,
        dateRange.endDate,
        new Date().getFullYear(), // current year
        50, // limit for products
        undefined // categoryId
      );

      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on type and date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
      
      let filename = '';
      switch (type) {
        case 'comprehensive':
          filename = `comprehensive-analytics-${dateStr}-${timeStr}.xlsx`;
          break;
        case 'revenue-summary':
          filename = `revenue-summary-${dateStr}.xlsx`;
          break;
        case 'daily-revenue':
          filename = `daily-revenue-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
          break;
        case 'top-products':
          filename = `top-products-50-${dateStr}.xlsx`;
          break;
        case 'payment-methods':
          filename = `payment-methods-${dateStr}.xlsx`;
          break;
        case 'discount-analysis':
          filename = `discount-analysis-${dateStr}.xlsx`;
          break;
        default:
          filename = `analytics-report-${dateStr}.xlsx`;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Xuất báo cáo Excel thành công! File: ${filename}`, { id: 'excel-export' });
      
    } catch (error) {
      console.error('❌ Excel export error:', error);
      toast.error('Lỗi khi xuất báo cáo Excel. Vui lòng thử lại.', { id: 'excel-export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Comprehensive Report */}
      <Button 
        onClick={() => handleExcelExport('comprehensive')} 
        variant="default" 
        size="sm"
        disabled={isExporting}
        className="bg-green-600 hover:bg-green-700"
      >
        <Download className={`w-4 h-4 mr-2 ${isExporting && exportType === 'comprehensive' ? 'animate-spin' : ''}`} />
        {isExporting && exportType === 'comprehensive' ? 'Đang xuất...' : 'Báo cáo tổng hợp'}
      </Button>
      
      {/* Quick Export Dropdown */}
      <div className="relative group">
        <Button 
          variant="outline" 
          size="sm"
          className="border-green-600 text-green-600 hover:bg-green-50"
          disabled={isExporting}
        >
          <FileText className="w-4 h-4 mr-2" />
          Báo cáo khác
          <div className="ml-1 text-xs">▼</div>
        </Button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            <button
              onClick={() => handleExcelExport('revenue-summary')}
              disabled={isExporting}
              data-export-type="revenue-summary"
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Tổng quan doanh thu
            </button>
            <button
              onClick={() => handleExcelExport('daily-revenue')}
              disabled={isExporting}
              data-export-type="daily-revenue"
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Doanh thu theo ngày
            </button>
            <button
              onClick={() => handleExcelExport('top-products')}
              disabled={isExporting}
              data-export-type="top-products"
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <Package className="w-4 h-4 mr-2 text-purple-600" />
              Top sản phẩm bán chạy
            </button>
            <button
              onClick={() => handleExcelExport('payment-methods')}
              disabled={isExporting}
              data-export-type="payment-methods"
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-2 text-orange-600" />
              Phương thức thanh toán
            </button>
            <button
              onClick={() => handleExcelExport('discount-analysis')}
              disabled={isExporting}
              data-export-type="discount-analysis"
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <Percent className="w-4 h-4 mr-2 text-red-600" />
              Phân tích giảm giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReportsPageProps {}

export default function ReportsPage({}: ReportsPageProps) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // ✅ OPTIMIZED PARALLEL API CALLS với centralized loading state
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics-comprehensive', dateRange, refreshKey],
    queryFn: async () => {
      console.log('🚀 Fetching analytics data in parallel...');
      
      try {
        // ✅ Parallel API calls thay vì sequential
        const [revenueSummary, dailyRevenue, monthlyRevenue, yearlyRevenue, topProducts, productsRevenue,
               categoriesPerformance, discountAnalysis, paymentMethods, comprehensiveReport] = 
        await Promise.all([
          apiClient.getRevenueSummary(),
          apiClient.getDailyRevenue(dateRange.startDate, dateRange.endDate),
          apiClient.getMonthlyRevenue(),
          apiClient.getYearlyRevenue(),
          apiClient.getTopSellingProducts(50, dateRange.startDate, dateRange.endDate), // Increased limit for detailed listing
          apiClient.getProductsRevenue(dateRange.startDate, dateRange.endDate), // Added products revenue API
          apiClient.getCategoriesPerformance(dateRange.startDate, dateRange.endDate),
          apiClient.getDiscountAnalysis(dateRange.startDate, dateRange.endDate),
          apiClient.getPaymentMethodAnalysis(dateRange.startDate, dateRange.endDate),
          apiClient.getComprehensiveReport(dateRange.startDate, dateRange.endDate)
        ]);

        console.log('✅ All analytics data fetched successfully');
        
        return {
          revenueSummary,
          dailyRevenue,
          monthlyRevenue,
          yearlyRevenue,
          topProducts,
          productsRevenue,
          categoriesPerformance,
          discountAnalysis,
          paymentMethods,
          comprehensiveReport
        };
      } catch (error) {
        console.error('❌ Analytics fetch error:', error);
        toast.error('Lỗi khi tải dữ liệu analytics');
        throw error;
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // ✅ SMART REFRESH với debouncing
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['analytics-comprehensive'] });
      setRefreshKey(prev => prev + 1);
      toast.success('Dữ liệu đã được cập nhật!');
    } catch (error) {
      toast.error('Lỗi khi làm mới dữ liệu');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // ✅ AUTO REFRESH mỗi 5 phút khi component visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [handleRefresh]);

  // ✅ MEMOIZED DATA PROCESSING
  const processedData = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      ...analyticsData,
      // Add computed fields
      totalRevenue: analyticsData.revenueSummary?.today?.revenue + 
                   analyticsData.revenueSummary?.thisMonth?.revenue || 0,
      // Add trend calculations
      trends: {
        dailyGrowth: analyticsData.revenueSummary?.today?.growth || 0,
        monthlyGrowth: analyticsData.revenueSummary?.thisMonth?.growth || 0
      }
    };
  }, [analyticsData]);

  const onApplyFilters = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
    toast.success('Bộ lọc đã được áp dụng!');
  }, []);

  // ✅ MEMOIZED COMPONENTS for better performance
  const RevenueSummaryCards = React.memo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today Revenue */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Doanh thu hôm nay</p>
              <div className="flex items-center gap-2 mt-2">
                <p className={`font-bold text-green-800 ${getCurrencyTextSize(analyticsData?.revenueSummary?.today?.revenue || 0)}`}>
                  {formatCompactCurrency(analyticsData?.revenueSummary?.today?.revenue || 0)}
                </p>
                {analyticsData?.revenueSummary?.today?.growth !== undefined && (
                  <Badge variant={analyticsData.revenueSummary.today.growth >= 0 ? "default" : "destructive"} className="text-xs">
                    {analyticsData.revenueSummary.today.growth >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(analyticsData.revenueSummary.today.growth).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-green-600" />
          </div>
          <p className="text-xs text-green-500 mt-2">
            {analyticsData?.revenueSummary?.today?.orders || 0} đơn hàng
          </p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Doanh thu tháng này</p>
              <div className="flex items-center gap-2 mt-2">
                <p className={`font-bold text-blue-800 ${getCurrencyTextSize(analyticsData?.revenueSummary?.thisMonth?.revenue || 0)}`}>
                  {formatCompactCurrency(analyticsData?.revenueSummary?.thisMonth?.revenue || 0)}
                </p>
                {analyticsData?.revenueSummary?.thisMonth?.growth !== undefined && (
                  <Badge variant={analyticsData.revenueSummary.thisMonth.growth >= 0 ? "default" : "destructive"} className="text-xs">
                    {analyticsData.revenueSummary.thisMonth.growth >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(analyticsData.revenueSummary.thisMonth.growth).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <p className="text-xs text-blue-500 mt-2">
            {analyticsData?.revenueSummary?.thisMonth?.orders || 0} đơn hàng
          </p>
        </CardContent>
      </Card>

      {/* Year Revenue */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Doanh thu năm nay</p>
              <p className={`font-bold text-purple-800 mt-2 ${getCurrencyTextSize(analyticsData?.revenueSummary?.thisYear?.revenue || 0)}`}>
                {formatCompactCurrency(analyticsData?.revenueSummary?.thisYear?.revenue || 0)}
              </p>
            </div>
            <Activity className="h-12 w-12 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Giá trị đơn hàng TB</p>
              <p className={`font-bold text-amber-800 mt-2 ${getCurrencyTextSize(analyticsData?.comprehensiveReport?.revenueOverview?.averageOrderValue || 0)}`}>
                {formatCompactCurrency(analyticsData?.comprehensiveReport?.revenueOverview?.averageOrderValue || 0)}
              </p>
            </div>
            <Target className="h-12 w-12 text-amber-600" />
          </div>
          <p className="text-xs text-amber-500 mt-2">
            Trung bình mỗi đơn
          </p>
        </CardContent>
      </Card>
    </div>
  ));

  // ✅ MEMOIZED CHART COMPONENTS
  const DailyRevenueChart = React.memo(() => {
    const chartData = useMemo(() => 
      analyticsData?.dailyRevenue?.dailyRevenue?.map((item: any) => ({
        ...item,
        formattedDate: formatDate(item.date).split(' ')[0]
      })) || [], [analyticsData?.dailyRevenue]
    );
    
    if (!chartData.length) {
      return <ChartSkeleton />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Doanh thu theo ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatDate(value).split(' ')[0]}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Doanh thu']}
                  labelFormatter={(label) => `Ngày: ${formatDate(label)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={CHART_COLORS.revenue[0]} 
                  fill={CHART_COLORS.revenue[0]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  });

  const MonthlyRevenueChart = React.memo(() => {
    const chartData = useMemo(() => 
      analyticsData?.monthlyRevenue?.monthlyRevenue || [], 
      [analyticsData?.monthlyRevenue]
    );
    
    if (!chartData.length) {
      return <ChartSkeleton />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Doanh thu theo tháng ({analyticsData?.monthlyRevenue?.year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill={CHART_COLORS.primary[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  });

  const TopProductsChart = React.memo(() => {
    const chartData = useMemo(() => 
      analyticsData?.topProducts?.topProducts?.slice(0, 8) || [], 
      [analyticsData?.topProducts]
    );
    
    if (!chartData.length) {
      return <ChartSkeleton />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top sản phẩm bán chạy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => value.toString()} />
                <YAxis 
                  type="category" 
                  dataKey="productName" 
                  tick={{ fontSize: 11 }} 
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalQuantitySold' ? `${value} món` : formatCurrency(value as number),
                    name === 'totalQuantitySold' ? 'Số lượng bán' : 'Doanh thu'
                  ]}
                />
                <Bar dataKey="totalQuantitySold" fill={CHART_COLORS.products[0]} />
                <Bar dataKey="totalRevenue" fill={CHART_COLORS.products[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  });

  const CategoriesChart = React.memo(() => {
    const chartData = useMemo(() => 
      analyticsData?.categoriesPerformance?.categories || [], 
      [analyticsData?.categoriesPerformance]
    );
    
    if (!chartData.length) {
      return <ChartSkeleton />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Hiệu suất theo danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="totalRevenue"
                  nameKey="categoryName"
                  label={({ categoryName, percentage }) => `${categoryName}: ${percentage}%`}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS.categories[index % CHART_COLORS.categories.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Doanh thu']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  });

  const PaymentMethodsChart = React.memo(() => {
    const chartData = useMemo(() => 
      analyticsData?.paymentMethods?.paymentMethods || [], 
      [analyticsData?.paymentMethods]
    );
    
    if (!chartData.length) {
      return <ChartSkeleton />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Phương thức thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="totalAmount"
                  nameKey="paymentMethod"
                  label={({ paymentMethod, percentage }) => `${paymentMethod}: ${percentage}%`}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS.payments[index % CHART_COLORS.payments.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Tổng tiền']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  });

  const DiscountAnalysis = React.memo(() => {
    const discountData = analyticsData?.discountAnalysis;
    
    if (!discountData) {
      return <ChartSkeleton />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Phân tích giảm giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Tổng giảm giá</p>
              <p className="text-lg font-bold text-red-800">
                {formatCurrency(discountData?.summary?.totalDiscountAmount || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Đơn hàng có giảm giá</p>
              <p className="text-lg font-bold text-blue-800">
                {discountData?.summary?.discountedOrders || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">% Đơn có giảm giá</p>
              <p className="text-lg font-bold text-green-800">
                {discountData?.summary?.discountOrderPercentage || 0}%
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">Giảm giá TB</p>
              <p className="text-lg font-bold text-purple-800">
                {discountData?.summary?.averageDiscountPercentage || 0}%
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discountData?.discountTiers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value, 'Số đơn hàng']} />
                <Bar dataKey="orderCount" fill={CHART_COLORS.primary[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  });

  // ✅ DETAILED PRODUCTS LISTING COMPONENT
  const DetailedProductsList = React.memo(() => {
    const productsData = analyticsData?.productsRevenue?.products || [];
    const topProductsData = analyticsData?.topProducts?.topProducts || [];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Danh sách sản phẩm đã bán chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Sản phẩm</th>
                  <th className="text-left p-2 font-semibold">Danh mục</th>
                  <th className="text-right p-2 font-semibold">Đã bán</th>
                  <th className="text-right p-2 font-semibold">Doanh thu</th>
                  <th className="text-right p-2 font-semibold">Đơn giá</th>
                  <th className="text-right p-2 font-semibold">TB/đơn</th>
                </tr>
              </thead>
              <tbody>
                {topProductsData.map((product: any, index: number) => (
                  <tr key={product.productId} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <span className="font-medium">{product.productName}</span>
                      </div>
                    </td>
                    <td className="p-2 text-muted-foreground">{product.categoryName}</td>
                    <td className="text-right p-2 font-semibold">{product.totalQuantitySold}</td>
                    <td className="text-right p-2 font-semibold text-green-600">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                    <td className="text-right p-2">{formatCurrency(product.unitPrice)}</td>
                    <td className="text-right p-2">{product.averageQuantityPerOrder.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  });

  // ✅ ENHANCED HOURLY ANALYSIS WITH ORDER DETAILS
  const EnhancedHourlyAnalysis = React.memo(() => {
    const hourlyData = analyticsData?.comprehensiveReport?.hourlyAnalysis || [];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Phân tích theo giờ chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') return [formatCurrency(Number(value)), 'Doanh thu'];
                      if (name === 'orderCount') return [value, 'Số đơn'];
                      return [value, name];
                    }}
                    labelFormatter={(hour) => `Giờ ${hour}:00 - ${hour + 1}:00`}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="revenue" 
                    fill={CHART_COLORS.revenue[0]} 
                    name="revenue"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="orderCount" 
                    fill={CHART_COLORS.primary[0]} 
                    name="orderCount"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Detailed breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hourlyData
                .sort((a: any, b: any) => b.revenue - a.revenue)
                .slice(0, 6)
                .map((hour: any) => (
                  <div key={hour.hour} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{hour.hour}:00 - {hour.hour + 1}:00</span>
                      <Badge variant="outline">{hour.orderCount} đơn</Badge>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(hour.revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      TB: {formatCurrency(hour.averageOrderValue)} / đơn
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  // ✅ FIXED CATEGORIES PERFORMANCE COMPONENT
  const FixedCategoriesChart = React.memo(() => {
    const categoriesData = analyticsData?.categoriesPerformance?.categories || [];
    
    if (!categoriesData.length) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiệu suất danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Không có dữ liệu danh mục
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Hiệu suất theo danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart data={categoriesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <YAxis 
                    type="category"
                    dataKey="categoryName" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
                  />
                  <Bar 
                    dataKey="totalRevenue" 
                    fill={CHART_COLORS.categories[0]}
                    radius={[0, 2, 2, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Detailed table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Danh mục</th>
                    <th className="text-right p-2">Sản phẩm</th>
                    <th className="text-right p-2">Đã bán</th>
                    <th className="text-right p-2">Doanh thu</th>
                    <th className="text-right p-2">% Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesData.map((category: any) => (
                    <tr key={category.categoryId} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{category.categoryName}</td>
                      <td className="text-right p-2">{category.totalProducts}</td>
                      <td className="text-right p-2">{category.totalQuantitySold}</td>
                      <td className="text-right p-2 font-semibold text-green-600">
                        {formatCurrency(category.totalRevenue)}
                      </td>
                      <td className="text-right p-2">
                        <Badge variant="outline">{category.revenuePercentage}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  // ✅ DETAILED DISCOUNT ORDERS BREAKDOWN
  const DetailedDiscountAnalysis = React.memo(() => {
    const discountData = analyticsData?.discountAnalysis;
    
    if (!discountData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chi tiết đơn hàng giảm giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Không có dữ liệu giảm giá
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Chi tiết đơn hàng giảm giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 mb-1">Tổng doanh thu</div>
                <div className="text-2xl font-bold text-green-800">
                  {formatCurrency(discountData.summary.totalRevenue)}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm text-red-600 mb-1">Tổng giảm giá</div>
                <div className="text-2xl font-bold text-red-800">
                  {formatCurrency(discountData.summary.totalDiscountAmount)}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 mb-1">Đơn có giảm giá</div>
                <div className="text-2xl font-bold text-blue-800">
                  {discountData.summary.discountedOrders}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 mb-1">% Giảm TB</div>
                <div className="text-2xl font-bold text-purple-800">
                  {discountData.summary.averageDiscountPercentage}%
                </div>
              </div>
            </div>

            {/* Discount Tiers Breakdown */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Phân tích theo mức giảm giá</h4>
              <div className="space-y-2">
                {discountData.discountTiers.map((tier: any, index: number) => (
                  <div key={tier.tier} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={tier.tier === 'No Discount' ? 'secondary' : 'default'}
                        className="min-w-[80px] justify-center"
                      >
                        {tier.tier}
                      </Badge>
                      <span className="font-medium">{tier.orderCount} đơn hàng</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(tier.paidAmount)}
                      </div>
                      {tier.discountAmount > 0 && (
                        <div className="text-sm text-red-500">
                          Tiết kiệm: {formatCurrency(tier.discountAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart for discount distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Phân bố đơn hàng theo mức giảm</h4>
                <div style={{ width: '100%', height: '250px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={discountData.discountTiers}
                        dataKey="orderCount"
                        nameKey="tier"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ tier, percent }) => `${tier}: ${percent ? (percent * 100).toFixed(1) : 0}%`}
                      >
                        {discountData.discountTiers.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS.payments[index % CHART_COLORS.payments.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, 'Số đơn']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Tác động giảm giá</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-sm text-blue-600 mb-1">Tỷ lệ đơn có giảm giá</div>
                    <div className="text-xl font-bold text-blue-800">
                      {discountData.summary.discountOrderPercentage}%
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <div className="text-sm text-orange-600 mb-1">Tác động lên doanh thu</div>
                    <div className="text-xl font-bold text-orange-800">
                      -{discountData.summary.discountImpact}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  const ComprehensiveStats = React.memo(() => {
    const comprehensiveData = analyticsData?.comprehensiveReport;
    
    if (!comprehensiveData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiệu suất kinh doanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Khách hàng duy nhất:</span>
              <span className="font-semibold">{comprehensiveData?.performanceMetrics?.uniqueCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sản phẩm đã bán:</span>
              <span className="font-semibold">{comprehensiveData?.performanceMetrics?.uniqueProductsSold || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng món đã bán:</span>
              <span className="font-semibold">{comprehensiveData?.performanceMetrics?.totalItemsSold || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bàn đã sử dụng:</span>
              <span className="font-semibold">{comprehensiveData?.performanceMetrics?.tablesUsed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đơn hàng/ngày:</span>
              <span className="font-semibold">{comprehensiveData?.performanceMetrics?.ordersPerDay || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doanh thu/ngày:</span>
              <span className="font-semibold">{formatCurrency(comprehensiveData?.performanceMetrics?.revenuePerDay || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Giờ hoạt động mạnh nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(comprehensiveData?.hourlyAnalysis || [])
                .sort((a: any, b: any) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((hour: any, index: number) => (
                  <div key={hour.hour} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{hour.hour}:00 - {hour.hour + 1}:00</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(hour.revenue)}</div>
                      <div className="text-xs text-muted-foreground">{hour.orderCount} đơn</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekday Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiệu suất theo ngày trong tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(comprehensiveData?.weekdayAnalysis || [])
                .sort((a: any, b: any) => b.revenue - a.revenue)
                .map((day: any, index: number) => (
                  <div key={day.weekday} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{day.weekdayName}</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(day.revenue)}</div>
                      <div className="text-xs text-muted-foreground">{day.orderCount} đơn</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  });

  // ✅ ERROR HANDLING
  if (error) {
    return (
      <AnalyticsErrorBoundary>
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu analytics</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </Card>
        </div>
      </AnalyticsErrorBoundary>
    );
  }

  return (
    <AnalyticsErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Báo cáo & Phân tích</h1>
            <p className="text-muted-foreground mb-2">
              Tổng quan chi tiết về hiệu suất kinh doanh và xu hướng doanh thu
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
            </Button>
            <ExportControls analyticsData={processedData} dateRange={dateRange} />
          </div>
        </div>

        {/* ✅ ADVANCED FILTERS */}
        <AdvancedFilters 
          dateRange={dateRange} 
          setDateRange={setDateRange}
          onApplyFilters={onApplyFilters}
        />

        {/* ✅ IMPROVED LOADING STATE */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => <ChartSkeleton key={i} />)}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
              <TabsTrigger value="products">Sản phẩm</TabsTrigger>
              <TabsTrigger value="payments">Thanh toán</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <RevenueSummaryCards />
              <ComprehensiveStats />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <RevenueSummaryCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyRevenueChart />
                <MonthlyRevenueChart />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {/* Quick Export for Products */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Báo cáo sản phẩm</h3>
                <Button 
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-export-type="top-products"]')?.click()} 
                  variant="outline" 
                  size="sm"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Xuất Excel sản phẩm
                </Button>
              </div>
              <DetailedProductsList />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProductsChart />
                <FixedCategoriesChart />
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              {/* Quick Export for Payments */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Báo cáo thanh toán & giảm giá</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-export-type="payment-methods"]')?.click()} 
                    variant="outline" 
                    size="sm"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Excel thanh toán
                  </Button>
                  <Button 
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-export-type="discount-analysis"]')?.click()} 
                    variant="outline" 
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    Excel giảm giá
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentMethodsChart />
                <DiscountAnalysis />
              </div>
              <DetailedDiscountAnalysis />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <EnhancedHourlyAnalysis />
              <ComprehensiveStats />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AnalyticsErrorBoundary>
  );
}