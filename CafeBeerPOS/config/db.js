const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'sa',
  server: 'localhost', 
  database: 'CafeBeer',
  options: {
    encrypt: false, // nếu dùng Azure thì để true
    enableArithAbort: true,
    // ✅ FIX: Add timezone and datetime options
    useUTC: false, // Use local server time instead of UTC
    dateFormat: 'mdy', // Month/Day/Year format
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  // ✅ ADD: Connection timeout
  connectionTimeout: 15000,
  requestTimeout: 30000
};

const pool = new sql.ConnectionPool(config);
let poolConnect;

// ✅ FIX: Enhanced connection with error handling
const connectWithRetry = async () => {
  try {
    poolConnect = await pool.connect();
    console.log('✅ Connected to SQL Server successfully');
    
    // ✅ ADD: Test timezone settings
    const result = await pool.request().query(`
      SELECT 
        GETDATE() as localTime,
        GETUTCDATE() as utcTime,
        SYSDATETIMEOFFSET() as timeWithOffset,
        DATEDIFF(HOUR, GETUTCDATE(), GETDATE()) as timezoneOffset
    `);
    
    console.log('🕒 Database timezone info:', result.recordset[0]);
    
    return poolConnect;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    console.log('🔄 Retrying connection in 5 seconds...');
    
    setTimeout(() => {
      connectWithRetry();
    }, 5000);
    
    throw err;
  }
};

// ✅ ADD: Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection...');
  await pool.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

module.exports = {
  sql,
  pool,
  connect: connectWithRetry
};