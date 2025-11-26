/**
 * 📚 DOCUMENTATION PAGE
 * 
 * Hiển thị README documentation ngay trong ứng dụng
 * Bao gồm hướng dẫn sử dụng, API docs, và troubleshooting
 * 
 * @version 1.0
 */
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Zap,
  Settings,
  Database,
  Users,
  ShoppingCart,
  BarChart3,
  Code,
  Rocket,
  Shield,
  Coffee,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LogoIcon } from '@/components/ui/Logo';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Đã copy vào clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ children, language = 'bash', id }: { children: string; language?: string; id?: string }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        {id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(children, id)}
            className="h-6 text-gray-400 hover:text-white"
          >
            {copiedCode === id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        )}
      </div>
      <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border">
        <div className="flex justify-center items-center gap-3 mb-4">
          <LogoIcon size="lg" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            basic. POS
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Hệ thống Point of Sale cho 2 thằng em Đức và Trân
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">v2.0 - Enterprise Ready</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">Next.js 14</Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">TypeScript</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="features">Tính năng</TabsTrigger>
          <TabsTrigger value="setup">Cài đặt</TabsTrigger>
          <TabsTrigger value="usage">Sử dụng</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="troubleshooting">Hỗ trợ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Tổng quan hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                <strong>basic. POS</strong> là hệ thống Point of Sale toàn diện được thiết kế đặc biệt cho 2 thằng em Đức và Trân. Hệ thống cung cấp giao diện hiện đại, quản lý đơn hàng real-time, 
                và báo cáo analytics chi tiết.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 Mục tiêu</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Tối ưu quy trình bán hàng</li>
                    <li>• Analytics & reports chi tiết</li>
                    <li>• Interface thân thiện</li>
                    <li>• Responsive trên mọi thiết bị</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🏆 Điểm nổi bật</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Modern Stack (Next.js 14)</li>
                    <li>• Real-time updates</li>
                    <li>• Excel export chuyên nghiệp</li>
                    <li>• Enterprise ready</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Tech Stack</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <span className="px-2 py-1 bg-white rounded text-gray-700">Next.js 14</span>
                  <span className="px-2 py-1 bg-white rounded text-gray-700">TypeScript</span>
                  <span className="px-2 py-1 bg-white rounded text-gray-700">Express.js</span>
                  <span className="px-2 py-1 bg-white rounded text-gray-700">SQL Server</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* POS Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Point of Sale (POS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Giao diện bán hàng trực quan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Quản lý bàn (Table management)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Cart system real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    3 phương thức thanh toán
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Hệ thống giảm giá linh hoạt
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Management Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Quản lý & Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Quản lý sản phẩm & danh mục
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    User & staff management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Role-based access control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Order tracking & history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Activity logging & audit
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Revenue analytics chi tiết
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Product performance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Hourly & daily analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Payment method breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Excel export (6 loại báo cáo)
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-orange-600" />
                  Tính năng Kỹ thuật
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Mobile responsive design
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    API-first architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Type-safe với TypeScript
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Comprehensive error handling
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Hướng dẫn cài đặt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Yêu cầu hệ thống
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <strong>Node.js</strong><br/>
                    <span className="text-sm text-gray-600">≥ 18.0.0</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <strong>npm</strong><br/>
                    <span className="text-sm text-gray-600">≥ 9.0.0</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <strong>SQL Server</strong><br/>
                    <span className="text-sm text-gray-600">2019+</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <strong>Git</strong><br/>
                    <span className="text-sm text-gray-600">Latest</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Clone Repository
                </h4>
                <CodeBlock language="bash" id="clone">
{`git clone https://github.com/your-repo/CoffeeBeer-POS.git
cd CoffeeBeer-POS`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Cài đặt Backend
                </h4>
                <CodeBlock language="bash" id="backend-setup">
{`cd CafeBeerPOS
npm install

# Cấu hình database trong config/db.js
# Chạy SQL schema từ database/enterprise_schema.sql`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                  Cài đặt Frontend
                </h4>
                <CodeBlock language="bash" id="frontend-setup">
{`cd BasicClient
npm install

# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">5</span>
                  Chạy ứng dụng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Terminal 1 - Backend:</p>
                    <CodeBlock language="bash" id="run-backend">
{`cd CafeBeerPOS
npm run dev`}
                    </CodeBlock>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Terminal 2 - Frontend:</p>
                    <CodeBlock language="bash" id="run-frontend">
{`cd BasicClient
npm run dev`}
                    </CodeBlock>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Truy cập ứng dụng</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Frontend:</strong> http://localhost:3001</li>
                  <li>• <strong>Backend API:</strong> http://localhost:3000</li>
                  <li>• <strong>API Docs:</strong> http://localhost:3000/api-docs</li>
                  <li>• <strong>Login:</strong> admin / admin123</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* POS Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-600" />
                  Sử dụng POS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    <div>
                      <strong>Chọn bàn</strong><br/>
                      Click vào bàn trong Table Grid
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    <div>
                      <strong>Thêm sản phẩm</strong><br/>
                      Click sản phẩm để thêm vào cart
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    <div>
                      <strong>Điều chỉnh số lượng</strong><br/>
                      Sử dụng +/- trong cart
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                    <div>
                      <strong>Thanh toán</strong><br/>
                      Chọn phương thức: Cash/Card/Banking
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Analytics Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Sử dụng Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    <div>
                      <strong>Vào trang Reports</strong><br/>
                      Click "Báo cáo" trong sidebar
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    <div>
                      <strong>Chọn khoảng thời gian</strong><br/>
                      Sử dụng date range picker
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    <div>
                      <strong>Xem báo cáo</strong><br/>
                      Chuyển đổi giữa các tabs
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                    <div>
                      <strong>Xuất Excel</strong><br/>
                      Click "Báo cáo tổng hợp" hoặc dropdown
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Management Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Quản lý Sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    <div>
                      <strong>Vào trang Sản phẩm</strong><br/>
                      Click "Sản phẩm" trong sidebar
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    <div>
                      <strong>Thêm sản phẩm mới</strong><br/>
                      Click "Thêm sản phẩm"
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    <div>
                      <strong>Điền thông tin</strong><br/>
                      Tên, giá, danh mục, mô tả
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                    <div>
                      <strong>Lưu & quản lý</strong><br/>
                      Edit/Delete từ bảng sản phẩm
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* User Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Phân quyền User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded">
                    <h5 className="font-semibold text-red-800">👑 Quản lý</h5>
                    <p className="text-sm text-red-700">Full access tất cả chức năng</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-semibold text-blue-800">👨‍💼 Nhân viên order</h5>
                    <p className="text-sm text-blue-700">Quản lý orders, reports</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <h5 className="font-semibold text-green-800">👨‍💻 Nhân viên thu ngân</h5>
                    <p className="text-sm text-green-700">POS và basic order management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🔗 Base URLs</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Development:</strong> http://localhost:3000</p>
                  <p><strong>API Docs:</strong> http://localhost:3000/api-docs</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔐 Authentication</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Tất cả API endpoints (trừ login) yêu cầu JWT token trong header:
                </p>
                <CodeBlock language="javascript" id="auth-header">
{`Authorization: Bearer <your-jwt-token>`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔄 Login API</h4>
                <CodeBlock language="javascript" id="login-api">
{`POST /api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📦 Products API</h4>
                <CodeBlock language="javascript" id="products-api">
{`// Get all products
GET /api/products

// Create product
POST /api/products
{
  "productName": "Cà phê đen",
  "description": "Cà phê đen truyền thống", 
  "unitPrice": 25000,
  "categoryId": 1,
  "available": true
}

// Update product
PUT /api/products/:id

// Delete product  
DELETE /api/products/:id`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🛒 Orders API</h4>
                <CodeBlock language="javascript" id="orders-api">
{`// Get orders
GET /api/orders?page=1&limit=10&status=Paid

// Create order
POST /api/orders
{
  "tableId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 25000
    }
  ],
  "totalAmount": 50000
}`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📊 Analytics API</h4>
                <CodeBlock language="javascript" id="analytics-api">
{`// Revenue summary
GET /api/analytics/revenue/summary

// Daily revenue  
GET /api/analytics/revenue/daily?startDate=2024-01-01&endDate=2024-01-31

// Top products
GET /api/analytics/products/top-selling?limit=10

// Export Excel
GET /api/analytics/export/excel?type=comprehensive&startDate=2024-01-01&endDate=2024-01-31`}
                </CodeBlock>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <ExternalLink className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">Swagger UI</h4>
                  <p className="text-sm text-green-700">
                    Truy cập full API documentation tại: 
                    <Button
                      variant="link" 
                      className="h-auto p-0 ml-1 text-green-600"
                      onClick={() => window.open('http://localhost:3000/api-docs', '_blank')}
                    >
                      http://localhost:3000/api-docs
                    </Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Common Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Lỗi thường gặp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-red-200 rounded-lg p-3">
                  <h5 className="font-semibold text-red-800 mb-1">❌ Connection refused 3000</h5>
                  <p className="text-sm text-red-700 mb-2">Backend chưa chạy</p>
                  <p className="text-xs text-gray-600">Giải pháp: cd CafeBeerPOS && npm run dev</p>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-3">
                  <h5 className="font-semibold text-orange-800 mb-1">⚠️ Database connection error</h5>
                  <p className="text-sm text-orange-700 mb-2">SQL Server không kết nối được</p>
                  <p className="text-xs text-gray-600">Giải pháp: Kiểm tra config/db.js và SQL Server</p>
                </div>

                <div className="border border-blue-200 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-800 mb-1">ℹ️ Unauthorized (401)</h5>
                  <p className="text-sm text-blue-700 mb-2">JWT token hết hạn</p>
                  <p className="text-xs text-gray-600">Giải pháp: Logout và login lại</p>
                </div>

                <div className="border border-purple-200 rounded-lg p-3">
                  <h5 className="font-semibold text-purple-800 mb-1">🔄 Excel export không hoạt động</h5>
                  <p className="text-sm text-purple-700 mb-2">ExcelJS dependency lỗi</p>
                  <p className="text-xs text-gray-600">Giải pháp: npm install trong CafeBeerPOS</p>
                </div>
              </CardContent>
            </Card>

            {/* System Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Kiểm tra hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">✅ Checklist cài đặt</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Node.js ≥ 18.0.0 installed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      SQL Server running
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Database schema imported
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Backend dependencies installed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Frontend dependencies installed
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">🔧 Debug commands</h5>
                  <CodeBlock language="bash" id="debug-commands">
{`# Check Node.js version
node --version

# Check npm version  
npm --version

# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :3001

# Clear npm cache
npm cache clean --force`}
                  </CodeBlock>
                </div>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Tối ưu hiệu suất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Database indexing</strong><br/>
                      Tạo indexes cho OrderDate, ProductID trong SQL Server
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>React Query caching</strong><br/>
                      Data được cache tự động, giảm API calls
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Optimistic updates</strong><br/>
                      UI updates ngay lập tức, không chờ API
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Image optimization</strong><br/>
                      Sử dụng Next.js Image component cho products
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Hỗ trợ & Liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-1">📧 Email Support</h5>
                  <p className="text-sm text-blue-700">support@cafebeer-pos.com</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-1">📱 Community</h5>
                  <p className="text-sm text-green-700">Join Discord server (coming soon)</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold text-purple-800 mb-1">🌐 Website</h5>
                  <p className="text-sm text-purple-700">https://cafebeer-pos.com</p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 mb-1">🐛 Bug Reports</h5>
                  <p className="text-sm text-yellow-700">Create GitHub issues</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
