const express = require('express');
const cors = require('cors'); // Thêm dòng này
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const port = process.env.PORT || 3000;

const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

// CORS configuration - Thêm phần này
const corsOptions = {
  origin: [
    'http://localhost:3001', // Frontend Next.js
    'http://localhost:3000', // Backend
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Sử dụng CORS middleware - Đặt trước tất cả middleware khác
app.use(cors(corsOptions));

// Middleware đọc body JSON
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CafeBeer POS API',
      version: '1.0.0',
      description: 'API documentation for CafeBeer Point of Sale system',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './CafeBeerPOS/routes/*.js'
  ], // đường dẫn đến các file route
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Debug: Log swagger spec để kiểm tra
console.log('Swagger APIs found:', Object.keys(swaggerSpec.paths || {}));
console.log('Swagger components:', Object.keys(swaggerSpec.components?.schemas || {}));

// Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', authMiddleware, require('./routes/orders'));
app.use('/api/payments', authMiddleware, require('./routes/payments'));

// Thêm analytics routes với authentication middleware
app.use('/api/analytics', authMiddleware, require('./routes/analytics'));

// Thêm admin routes với authentication middleware
app.use('/api/admin', authMiddleware, require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CafeBeer POS API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CafeBeer POS API',
    documentation: `http://localhost:${port}/api-docs`,
    health: `http://localhost:${port}/health`
  });
});

// Global error handler
app.use(errorHandler);

// Kết nối DB và start server
db.connect()
  .then(() => {
    console.log('✅ Connected to SQL Server');
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${port}/health`);
      console.log(`🌐 CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
    });
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  });