const { query } = require('../config/database');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    
    // Log performance metrics
    console.log('Performance Metrics:', {
      method: req.method,
      url: req.url,
      responseTime: `${endTime - startTime}ms`,
      memoryUsed: `${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024)}MB`,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });
    
    // Call original json method
    originalJson.call(this, data);
  };
  
  next();
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    const result = await query('SELECT 1 as health_check');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// System health check
const checkSystemHealth = () => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
    },
    uptime: `${Math.round(uptime)}s`,
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  };
};

// Comprehensive health check endpoint
const healthCheck = async (req, res) => {
  try {
    const [dbHealth, systemHealth] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(checkSystemHealth())
    ]);
    
    const overallStatus = dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy';
    
    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        system: systemHealth
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Error tracking middleware
const errorTracker = (error, req, res, next) => {
  // Log error with context
  const errorLog = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.user_id || 'anonymous',
    timestamp: new Date().toISOString(),
    body: req.body,
    query: req.query,
    params: req.params
  };
  
  console.error('Error Tracked:', errorLog);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or DataDog
  
  next(error);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.user_id || 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    // Log based on status code
    if (res.statusCode >= 400) {
      console.warn('Request Warning:', logData);
    } else {
      console.log('Request Log:', logData);
    }
  });
  
  next();
};

// Rate limiting by user (more sophisticated than IP-based)
const userRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.user_id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    } else {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }
    
    userRequests.push(now);
    next();
  };
};

// Database connection monitoring
const monitorDatabaseConnections = () => {
  setInterval(async () => {
    try {
      const result = await query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      const stats = result.rows[0];
      console.log('Database Connection Stats:', {
        total: stats.total_connections,
        active: stats.active_connections,
        idle: stats.idle_connections,
        timestamp: new Date().toISOString()
      });
      
      // Alert if connections are high
      if (stats.total_connections > 80) {
        console.warn('High database connection count:', stats.total_connections);
      }
    } catch (error) {
      console.error('Database monitoring error:', error);
    }
  }, 60000); // Check every minute
};

// Memory monitoring
const monitorMemory = () => {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    console.log('Memory Usage:', {
      heapUsed: `${memoryMB}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      timestamp: new Date().toISOString()
    });
    
    // Alert if memory usage is high
    if (memoryMB > 500) { // 500MB threshold
      console.warn('High memory usage detected:', `${memoryMB}MB`);
    }
  }, 30000); // Check every 30 seconds
};

// Start monitoring
const startMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    monitorDatabaseConnections();
    monitorMemory();
  }
};

module.exports = {
  performanceMonitor,
  healthCheck,
  errorTracker,
  requestLogger,
  userRateLimit,
  startMonitoring,
  checkDatabaseHealth,
  checkSystemHealth
};
