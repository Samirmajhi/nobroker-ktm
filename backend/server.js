const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import database to ensure connection is established
const { pool } = require('./config/database');

// Import monitoring middleware
const { 
  performanceMonitor, 
  healthCheck, 
  errorTracker, 
  requestLogger, 
  startMonitoring 
} = require('./middleware/monitoring');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Socket.IO connection management
const connectedUsers = new Map(); // Map to store user_id -> socket_id
const userSockets = new Map(); // Map to store socket_id -> user_info

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Authenticate user and store connection
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      if (!token) {
        socket.emit('auth_error', { message: 'Authentication token required' });
        return;
      }

      // Verify JWT token (you can import your auth middleware here)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const userId = decoded.user_id;
      const userRole = decoded.role;
      
      // Store user connection
      connectedUsers.set(userId, socket.id);
      userSockets.set(socket.id, { userId, userRole, socket });
      
      // Join user to their personal room
      socket.join(`user_${userId}`);
      
      // Join owner to owner room if applicable
      if (userRole === 'owner') {
        socket.join('owners');
      }
      
      socket.emit('authenticated', { 
        message: 'Successfully authenticated',
        userId,
        userRole
      });
      
      console.log(`✅ User authenticated: ${userId} (${userRole})`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('auth_error', { message: 'Invalid authentication token' });
    }
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, messageText, receiverId, listingId } = data;
      const userInfo = userSockets.get(socket.id);
      
      if (!userInfo) {
        socket.emit('message_error', { message: 'User not authenticated' });
        return;
      }

      // Emit to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', {
          conversationId,
          messageText,
          senderId: userInfo.userId,
          listingId,
          timestamp: new Date().toISOString()
        });
      }

      // Emit to owner room for notifications
      io.to('owners').emit('owner_notification', {
        type: 'new_message',
        message: `New message from ${userInfo.userId}`,
        listingId,
        conversationId
      });

      socket.emit('message_sent', { success: true });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { conversationId, receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { conversationId, isTyping: true });
    }
  });

  socket.on('typing_stop', (data) => {
    const { conversationId, receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { conversationId, isTyping: false });
    }
  });

  // Handle read receipts
  socket.on('mark_read', (data) => {
    const { conversationId, senderId } = data;
    const senderSocketId = connectedUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('message_read', { conversationId });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userInfo = userSockets.get(socket.id);
    if (userInfo) {
      connectedUsers.delete(userInfo.userId);
      userSockets.delete(socket.id);
      console.log(`🔌 User disconnected: ${userInfo.userId}`);
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
// CORS configuration - PRODUCTION SECURE
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - PRODUCTION OPTIMIZED
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for testing
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Monitoring middleware - PRODUCTION ESSENTIAL
app.use(requestLogger);
app.use(performanceMonitor);

// Compression middleware - PRODUCTION OPTIMIZATION
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with proper MIME types
app.use('/uploads', (req, res, next) => {
  // Set proper MIME types for images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    res.setHeader('Content-Type', 'image/' + req.path.split('.').pop().toLowerCase());
  }
  next();
}, express.static('uploads'));

// SSO Configuration
const passport = require('./config/sso');
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/sso')); // SSO routes
app.use('/api/users', require('./routes/users'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/visits', require('./routes/visits'));
app.use('/api/agreements', require('./routes/agreements'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/owners', require('./routes/owners'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/messages', require('./routes/messages'));

// Enhanced health check endpoint
app.get('/api/health', healthCheck);

// Additional health check for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Enhanced error handling middleware - PRODUCTION READY
app.use(errorTracker);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 No-Broker Kathmandu Backend running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server: Active`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}/api/health`);
  
  // Start monitoring in production
  startMonitoring();
});

// Export for use in other modules
module.exports = { app, io, connectedUsers, userSockets };
