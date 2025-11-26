# 🍺 CafeBeer POS System

<div align="center">

![CafeBeer POS](https://img.shields.io/badge/CafeBeer-POS%20System-orange?style=for-the-badge&logo=coffee)
![Version](https://img.shields.io/badge/version-2.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Hệ thống Point of Sale (POS) hiện đại cho quán cà phê & bia**  
*Được xây dựng với Next.js 14, Express.js và SQL Server*

[🚀 Demo](#demo) • [📖 Docs trong App](/dashboard/docs) • [⚡ Cài đặt](#cài-đặt) • [🔧 API](#api-documentation)

</div>

---

## 📋 Mục lục

- [🌟 Tổng quan](#tổng-quan)
- [✨ Tính năng chính](#tính-năng-chính)
- [🏗️ Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [⚡ Cài đặt & Chạy](#cài-đặt--chạy)
- [🎯 Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [🔧 API Documentation](#api-documentation)
- [📊 Analytics & Reports](#analytics--reports)
- [🛠️ Cấu trúc dự án](#cấu-trúc-dự-án)
- [🧪 Testing](#testing)
- [🚀 Deployment](#deployment)
- [👥 Đóng góp](#đóng-góp)

---

## 🌟 Tổng quan

**CafeBeer POS** là một hệ thống Point of Sale (POS) toàn diện được thiết kế đặc biệt cho quán cà phê và bia. Hệ thống cung cấp giao diện người dùng hiện đại, quản lý đơn hàng thời gian thực, và báo cáo analytics chi tiết.

### 🎯 Mục tiêu dự án
- Tối ưu hóa quy trình bán hàng cho quán cà phê & bia
- Cung cấp báo cáo analytics chi tiết và real-time
- Quản lý inventory, staff và customer hiệu quả
- Interface thân thiện và responsive trên mọi thiết bị

### 🏆 Điểm nổi bật
- **Modern Stack**: Next.js 14, TypeScript, TailwindCSS
- **Real-time**: Live updates cho orders và inventory
- **Analytics**: Báo cáo chi tiết với Excel export
- **Enterprise Ready**: Role-based access, audit logs
- **Mobile First**: Responsive design cho tablet & mobile

---

## ✨ Tính năng chính

### 🛒 Point of Sale (POS)
- ✅ **Giao diện bán hàng trực quan** với grid layout
- ✅ **Quản lý bàn** (Table management) 
- ✅ **Cart system** với real-time pricing
- ✅ **Multiple payment methods**: Cash, Card, Banking
- ✅ **Discount system** với percentage-based discounts
- ✅ **Order tracking** với status updates

### 📦 Quản lý Inventory
- ✅ **Product management** với categories
- ✅ **Stock tracking** và low-stock alerts
- ✅ **Category management** với hierarchical structure
- ✅ **Bulk operations** cho mass updates
- ✅ **Product search** và filtering

### 👥 Quản lý User & Staff
- ✅ **Role-based access control** (Admin, Manager, Cashier)
- ✅ **User management** với profiles
- ✅ **Authentication** với JWT tokens
- ✅ **Permission system** chi tiết theo chức năng
- ✅ **Activity logging** cho audit trail

### 📊 Analytics & Reporting
- ✅ **Revenue analytics** theo ngày/tháng/năm
- ✅ **Product performance** tracking
- ✅ **Category analysis** với breakdowns
- ✅ **Payment method** analytics
- ✅ **Discount effectiveness** analysis
- ✅ **Excel export** với 6 loại báo cáo chuyên nghiệp
- ✅ **Real-time dashboards** với charts

### 🔧 Tính năng kỹ thuật
- ✅ **Real-time updates** với optimistic UI
- ✅ **Offline support** với local caching
- ✅ **Mobile responsive** design
- ✅ **API-first architecture** với OpenAPI/Swagger
- ✅ **Type-safe** với TypeScript end-to-end
- ✅ **Error handling** và logging comprehensive

---

## 🏗️ Kiến trúc hệ thống

### Tech Stack

#### 🖥️ Frontend (BasicClient/)
```typescript
// Core Framework
Next.js 14 (App Router)     // React framework với SSR/SSG
TypeScript 5.0              // Type safety
TailwindCSS 3.3             // Utility-first CSS framework

// State Management  
Zustand 4.4                 // Lightweight state management
React Query (TanStack)      // Server state management
React Hook Form 7.47        // Form handling

// UI Components
Radix UI                    // Headless UI components
Lucide React                // Icon library
Recharts 3.1               // Chart library cho analytics
React Hot Toast            // Notification system

// Utilities
Axios 1.6                  // HTTP client
Zod 3.22                   // Schema validation
Class Variance Authority    // Conditional CSS classes
```

#### ⚙️ Backend (CafeBeerPOS/)
```javascript
// Core Framework
Express.js 4.18            // Node.js web framework
Node.js 18+               // Runtime environment

// Database
SQL Server                // Microsoft SQL Server
mssql 9.1.1              // SQL Server driver cho Node.js

// Authentication & Security
JSON Web Tokens 9.0       // JWT authentication
bcrypt 5.1                // Password hashing
CORS 2.8                  // Cross-origin resource sharing

// Documentation & Export
Swagger UI Express 5.0    // API documentation
ExcelJS 4.4              // Excel export functionality
Moment.js 2.30           // Date manipulation

// Development
Nodemon 3.0              // Development auto-restart
```

### 🏛️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│  (SQL Server)   │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 1433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Query   │    │   JWT Auth      │    │   Procedures    │
│   Zustand       │    │   Role Middleware│    │   Triggers      │
│   TypeScript    │    │   Swagger Docs  │    │   Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## ⚡ Cài đặt & Chạy

### 📋 Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 hoặc **yarn** >= 1.22.0
- **SQL Server** 2019+ hoặc SQL Server Express
- **Git** để clone repository

### 🚀 Bước 1: Clone Repository

```bash
git clone https://github.com/your-repo/CoffeeBeer-POS.git
cd CoffeeBeer-POS
```

### 🗄️ Bước 2: Cài đặt Database

1. **Cài đặt SQL Server** (nếu chưa có):
   - Download SQL Server Express (miễn phí)
   - Hoặc sử dụng SQL Server Developer Edition

2. **Tạo Database**:
   ```sql
   CREATE DATABASE CafeBeerPOS;
   USE CafeBeerPOS;
   ```

3. **Import Schema**:
   ```bash
   # Chạy file schema trong SQL Server Management Studio
   sqlcmd -S localhost -i CafeBeerPOS/database/enterprise_schema.sql
   ```

### ⚙️ Bước 3: Cấu hình Backend

```bash
cd CafeBeerPOS

# Cài đặt dependencies
npm install

# Cấu hình database connection
# Chỉnh sửa file config/db.js với thông tin SQL Server của bạn
```

**Cấu hình Database (config/db.js)**:
```javascript
const config = {
    user: 'your-username',
    password: 'your-password', 
    server: 'localhost',
    database: 'CafeBeerPOS',
    options: {
        encrypt: false, // true nếu sử dụng Azure
        trustServerCertificate: true
    }
};
```

### 🖥️ Bước 4: Cấu hình Frontend

```bash
cd BasicClient

# Cài đặt dependencies
npm install

# Cấu hình API URL (nếu cần)
# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
```

### 🚀 Bước 5: Chạy Ứng dụng

**Terminal 1 - Backend**:
```bash
cd CafeBeerPOS
npm run dev
# Server sẽ chạy tại http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd BasicClient  
npm run dev
# Client sẽ chạy tại http://localhost:3001
```

### 🎯 Bước 6: Truy cập Ứng dụng

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

### 👤 Tài khoản mặc định

```
Username: admin
Password: admin123
Role: Admin
```

---

## 🎯 Hướng dẫn sử dụng

### 🔐 1. Đăng nhập

1. Truy cập http://localhost:3001
2. Nhập username và password
3. Chọn "Đăng nhập"

### 🏠 2. Dashboard

Sau khi đăng nhập, bạn sẽ thấy dashboard chính với:
- **Revenue cards**: Doanh thu hôm nay, tháng này, năm nay
- **Quick stats**: Số đơn hàng, sản phẩm bán chạy
- **Charts**: Biểu đồ doanh thu và trends

### 🛒 3. Point of Sale (POS)

#### Tạo đơn hàng mới:
1. Click **"POS"** trong sidebar
2. Chọn **bàn** (table) từ grid
3. **Thêm sản phẩm** vào cart bằng cách click vào product cards
4. **Điều chỉnh số lượng** trong cart
5. **Áp dụng discount** (nếu có)
6. Click **"Thanh toán"** để mở payment modal

#### Xử lý thanh toán:
1. Chọn **phương thức thanh toán**:
   - 💵 **Tiền mặt** (Cash)
   - 💳 **Thẻ** (Card)  
   - 🏦 **Chuyển khoản** (Banking)
2. Nhập **% giảm giá** (nếu có)
3. Click **"Xác nhận thanh toán"**
4. Đơn hàng sẽ được tạo và cập nhật realtime

### 📦 4. Quản lý Sản phẩm

#### Thêm sản phẩm mới:
1. Vào **"Sản phẩm"** trong sidebar
2. Click **"Thêm sản phẩm"**
3. Điền thông tin:
   - Tên sản phẩm
   - Mô tả
   - Giá
   - Danh mục
   - Trạng thái available
4. Click **"Lưu"**

#### Chỉnh sửa sản phẩm:
1. Click icon **"Edit"** ✏️ trong product table
2. Cập nhật thông tin cần thiết
3. Click **"Cập nhật"**

### 👥 5. Quản lý Nhân viên

#### Thêm nhân viên mới:
1. Vào **"Nhân viên"** (Users)
2. Click **"Thêm người dùng"**
3. Điền thông tin:
   - Username (unique)
   - Tên đầy đủ
   - Email
   - Mật khẩu
   - Vai trò (Admin/Manager/Cashier)
4. Click **"Tạo"**

#### Roles & Permissions:
- 👑 **Admin**: Full access tất cả chức năng
- 👨‍💼 **Manager**: Quản lý sản phẩm, orders, reports
- 👨‍💻 **Cashier**: Chỉ POS và basic order management

### 📊 6. Analytics & Reports

#### Xem báo cáo:
1. Vào **"Báo cáo"** (Reports)
2. Sử dụng **date range picker** để chọn khoảng thời gian
3. Chuyển đổi giữa các tabs:
   - **Tổng quan**: Overview metrics
   - **Doanh thu**: Revenue analytics  
   - **Sản phẩm**: Product performance
   - **Thanh toán**: Payment & discount analysis
   - **Phân tích**: Advanced analytics

#### Xuất báo cáo Excel:
1. Click **"Báo cáo tổng hợp"** cho comprehensive report
2. Hoặc click **"Báo cáo khác"** dropdown để chọn:
   - Tổng quan doanh thu
   - Doanh thu theo ngày
   - Top sản phẩm bán chạy
   - Phương thức thanh toán
   - Phân tích giảm giá
3. File Excel sẽ tự động download

### 🏢 7. Quản lý Bàn (Tables)

#### Thêm bàn mới:
1. Vào **"Bàn"** (Tables)
2. Click **"Thêm bàn"**
3. Nhập:
   - Số bàn
   - Số ghế
   - Ghi chú (optional)
4. Click **"Tạo"**

### 🏷️ 8. Quản lý Danh mục

#### Tạo danh mục:
1. Vào **"Danh mục"** (Categories)
2. Click **"Thêm danh mục"**
3. Nhập tên danh mục và mô tả
4. Click **"Tạo"**

---

## 🔧 API Documentation

### 📡 Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

### 🔐 Authentication

Tất cả API endpoints (trừ login) yêu cầu JWT token trong header:
```javascript
Authorization: Bearer <your-jwt-token>
```

### 📋 Core Endpoints

#### Authentication
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Products
```http
# Get all products
GET /api/products

# Create product  
POST /api/products
{
  "productName": "Cà phê đen",
  "description": "Cà phê đen truyền thống",
  "unitPrice": 25000,
  "categoryId": 1,
  "available": true
}

# Update product
PUT /api/products/:id

# Delete product
DELETE /api/products/:id
```

#### Orders
```http
# Get orders
GET /api/orders?page=1&limit=10&status=Paid

# Create order
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
}
```

#### Payments
```http
# Create payment
POST /api/payments
{
  "orderId": 123,
  "paymentType": "Banking",
  "discountPercentage": 10
}
```

#### Analytics
```http
# Revenue summary
GET /api/analytics/revenue/summary

# Daily revenue
GET /api/analytics/revenue/daily?startDate=2024-01-01&endDate=2024-01-31

# Top products
GET /api/analytics/products/top-selling?limit=10

# Export Excel
GET /api/analytics/export/excel?type=comprehensive&startDate=2024-01-01&endDate=2024-01-31
```

### 🔍 API Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "status": "error", 
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### 📚 Full API Documentation

Truy cập **Swagger UI** tại: http://localhost:3000/api-docs

---

## 📊 Analytics & Reports

### 📈 Dashboard Metrics

- **Revenue Today**: Doanh thu hôm nay + growth %
- **Revenue This Month**: Doanh thu tháng này + trend
- **Revenue This Year**: Tổng doanh thu năm
- **Average Order Value**: Giá trị đơn hàng trung bình

### 📋 Available Reports

#### 1. 💰 Revenue Reports
- **Daily Revenue**: Doanh thu theo từng ngày
- **Monthly Revenue**: Breakdown theo tháng trong năm
- **Yearly Revenue**: Comparison nhiều năm
- **Growth Analysis**: Tính toán growth rates

#### 2. 🏆 Product Performance
- **Top Selling Products**: 50 sản phẩm bán chạy nhất
- **Product Revenue Analysis**: Doanh thu theo sản phẩm
- **Category Performance**: Hiệu suất theo danh mục
- **Product Trends**: Xu hướng bán của sản phẩm

#### 3. ⏰ Time-based Analysis
- **Hourly Analysis**: Phân tích theo giờ trong ngày
- **Weekday Performance**: Hiệu suất theo ngày trong tuần
- **Peak Hours**: Giờ cao điểm
- **Seasonal Trends**: Xu hướng theo mùa

#### 4. 💳 Payment & Discount Analysis
- **Payment Methods**: Phân tích phương thức thanh toán
- **Discount Effectiveness**: Hiệu quả của chương trình giảm giá
- **Discount Tiers**: Phân tích theo mức giảm giá
- **Revenue Impact**: Tác động lên doanh thu

### 📊 Charts & Visualizations

- **Line Charts**: Revenue trends theo thời gian
- **Bar Charts**: Comparison products và categories
- **Pie Charts**: Distribution của payment methods
- **Area Charts**: Revenue accumulation
- **Dual-axis Charts**: Revenue + Order count

### 📋 Excel Export Features

**6 loại báo cáo Excel:**
1. **Comprehensive**: Tất cả báo cáo trong 1 workbook
2. **Revenue Summary**: Key metrics và KPIs
3. **Daily Revenue**: Time series data
4. **Top Products**: Best sellers với rankings
5. **Payment Methods**: Transaction analysis
6. **Discount Analysis**: Promotion effectiveness

**Excel Features:**
- Professional styling với colors & fonts
- Auto-width columns
- Number formatting (currency, percentages)
- Multiple worksheets
- Company branding
- Generated timestamps

---

## 🛠️ Cấu trúc dự án

### 📁 Frontend Structure (BasicClient/)

```
BasicClient/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 dashboard/          # Protected dashboard routes
│   │   │   ├── 📄 layout.tsx      # Dashboard layout
│   │   │   ├── 📄 page.tsx        # Dashboard home
│   │   │   ├── 📁 pos/            # Point of Sale
│   │   │   ├── 📁 products/       # Product management
│   │   │   ├── 📁 orders/         # Order management
│   │   │   ├── 📁 reports/        # Analytics & reports
│   │   │   ├── 📁 users/          # User management
│   │   │   ├── 📁 categories/     # Category management
│   │   │   └── 📁 tables/         # Table management
│   │   ├── 📁 login/              # Authentication
│   │   ├── 📄 layout.tsx          # Root layout
│   │   ├── 📄 page.tsx            # Landing page
│   │   ├── 📄 globals.css         # Global styles
│   │   └── 📄 providers.tsx       # React Query provider
│   ├── 📁 components/             # Reusable components
│   │   ├── 📁 ui/                 # Base UI components
│   │   ├── 📁 layout/             # Layout components
│   │   ├── 📁 pos/                # POS-specific components
│   │   └── 📁 management/         # Management components
│   ├── 📁 hooks/                  # Custom React hooks
│   ├── 📁 lib/                    # Utilities & configurations
│   ├── 📁 stores/                 # State management (Zustand)
│   ├── 📁 types/                  # TypeScript type definitions
│   └── 📁 services/               # API service layers
├── 📄 package.json               # Dependencies & scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 tailwind.config.js         # TailwindCSS configuration
├── 📄 next.config.js             # Next.js configuration
└── 📄 middleware.ts              # Auth middleware
```

### 📁 Backend Structure (CafeBeerPOS/)

```
CafeBeerPOS/
├── 📁 controllers/               # Business logic controllers
│   ├── 📄 usersController.js     # User management
│   ├── 📄 productsController.js  # Product CRUD
│   ├── 📄 ordersController.js    # Order processing
│   ├── 📄 paymentsController.js  # Payment processing
│   ├── 📄 analyticsController.js # Analytics & Excel export
│   ├── 📄 categoriesController.js# Category management
│   ├── 📄 tablesController.js    # Table management
│   └── 📄 adminController.js     # Admin utilities
├── 📁 routes/                    # API route definitions
│   ├── 📄 users.js               # User routes
│   ├── 📄 products.js            # Product routes
│   ├── 📄 orders.js              # Order routes
│   ├── 📄 payments.js            # Payment routes
│   ├── 📄 analytics.js           # Analytics routes
│   ├── 📄 categories.js          # Category routes
│   ├── 📄 tables.js              # Table routes
│   └── 📄 admin.js               # Admin routes
├── 📁 middleware/                # Express middlewares
│   ├── 📄 authMiddleware.js      # JWT authentication
│   ├── 📄 roleMiddleware.js      # Role-based access
│   └── 📄 errorHandler.js        # Global error handling
├── 📁 config/                    # Configuration files
│   └── 📄 db.js                  # Database connection
├── 📁 database/                  # Database schemas & scripts
│   ├── 📄 enterprise_schema.sql  # Main database schema
│   ├── 📄 setup_analytics.sql    # Analytics setup
│   └── 📄 *.sql                  # Migration scripts
├── 📁 utils/                     # Utility functions
│   ├── 📄 jwtUtils.js            # JWT helpers
│   └── 📄 validators.js          # Input validation
├── 📄 server.js                  # Main server file
└── 📄 package.json               # Dependencies & scripts
```

### 🗄️ Database Schema

**Core Tables:**
- `Users` - Nhân viên và người dùng
- `Products` - Sản phẩm 
- `Categories` - Danh mục sản phẩm
- `Tables` - Bàn trong quán
- `Orders` - Đơn hàng
- `OrderItems` - Chi tiết đơn hàng
- `Payments` - Thanh toán

**Key Relationships:**
```sql
Orders (1) ←→ (N) OrderItems
Orders (N) ←→ (1) Tables  
Orders (1) ←→ (1) Payments
Products (N) ←→ (1) Categories
OrderItems (N) ←→ (1) Products
```

---

## 🧪 Testing

### 🔍 Manual Testing

#### POS Workflow Test:
1. Login as Cashier
2. Tạo order mới
3. Thêm multiple products
4. Apply discount
5. Process payment với Banking
6. Verify order trong Orders page

#### Analytics Test:
1. Login as Manager/Admin
2. Truy cập Reports page
3. Test date range filtering
4. Export Excel reports
5. Verify data accuracy

#### User Management Test:
1. Login as Admin
2. Create new Cashier user
3. Logout và login với user mới
4. Verify permissions (chỉ access POS)

### 🛠️ API Testing

Sử dụng **Swagger UI** tại http://localhost:3000/api-docs:

1. **Authentication Test**:
   - POST `/api/users/login` với valid credentials
   - Verify JWT token response
   - Test protected endpoints với token

2. **CRUD Operations**:
   - Test all endpoints cho Products, Categories, Users
   - Verify error responses với invalid data
   - Test pagination và filtering

3. **Analytics Test**:
   - Test all analytics endpoints
   - Verify Excel export functionality
   - Test date range parameters

### 📊 Load Testing

```bash
# Sử dụng Apache Bench (ab) để test performance
ab -n 1000 -c 10 http://localhost:3000/api/products

# Expected results:
# - Response time < 100ms
# - 0% failed requests
# - Memory usage stable
```

---

## 🚀 Deployment

### 🐳 Docker Deployment (Recommended)

**1. Create Dockerfile cho Backend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**2. Create Dockerfile cho Frontend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**3. Docker Compose:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./BasicClient
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend

  backend:
    build: ./CafeBeerPOS
    ports:
      - "3000:3000"
    environment:
      - DB_SERVER=sqlserver
      - DB_NAME=CafeBeerPOS
    depends_on:
      - sqlserver

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

volumes:
  sqldata:
```

### ☁️ Cloud Deployment

#### Vercel (Frontend):
```bash
cd BasicClient
npm install -g vercel
vercel --prod
```

#### Railway/Heroku (Backend):
```bash
cd CafeBeerPOS
# Thêm vào package.json:
# "start": "node server.js"
# Deploy theo hướng dẫn của platform
```

#### Azure SQL Database:
1. Create Azure SQL Database
2. Update connection string trong `config/db.js`
3. Set `encrypt: true` cho Azure

### 🔧 Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=CafeBeer POS
```

**Backend (.env):**
```env
PORT=3000
DB_SERVER=your-sql-server
DB_NAME=CafeBeerPOS
DB_USER=your-username
DB_PASSWORD=your-password
JWT_SECRET=your-super-secret-key
NODE_ENV=production
```

### 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up SQL Server firewall
- [ ] Enable SQL Server encryption
- [ ] Set up backup strategy
- [ ] Configure monitoring & logging

---

## 👥 Đóng góp

### 🤝 Quy tắc đóng góp

1. **Fork** repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### 📝 Coding Standards

#### TypeScript/JavaScript:
- Sử dụng **TypeScript** cho tất cả new code
- Follow **ESLint** configuration
- **Prettier** cho code formatting
- **Meaningful variable names** và comments

#### CSS/Styling:
- Sử dụng **TailwindCSS** utilities
- **Responsive design** first
- **Consistent spacing** với Tailwind spacing scale
- **Semantic color names**

#### Git Commit Messages:
```
feat: add Excel export functionality
fix: resolve payment modal bug
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for analytics
```

### 🐛 Bug Reports

Khi report bug, vui lòng include:
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Browser/OS information**
- **Console errors** (nếu có)
- **Screenshots** (nếu relevant)

### 💡 Feature Requests

Cho feature requests, describe:
- **Problem** bạn đang cố gắng solve
- **Proposed solution**
- **Alternative solutions** đã consider
- **Use cases** cụ thể

---

## 📞 Support & Contact

### 🆘 Hỗ trợ kỹ thuật

- **Documentation**: Đọc README này và API docs
- **Issues**: Create GitHub issue cho bugs và feature requests
- **Community**: Join Discord server (link coming soon)

### 📧 Liên hệ

- **Email**: support@cafebeer-pos.com
- **LinkedIn**: [Connect with us](https://linkedin.com/company/cafebeer-pos)
- **Website**: https://cafebeer-pos.com

### 🙏 Credits

**Developed by:**
- **Tech Lead**: System Architecture & Backend Development
- **Frontend Team**: React/Next.js Development
- **UI/UX Team**: Design & User Experience
- **QA Team**: Testing & Quality Assurance

**Special Thanks:**
- React & Next.js community
- TailwindCSS team
- Microsoft SQL Server team
- All beta testers và contributors

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CafeBeer POS Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**🍺 CafeBeer POS - Empowering Your Coffee & Beer Business 🍺**

Made with ❤️ by the CafeBeer Team

[⬆ Back to Top](#-cafebeer-pos-system)

</div>
