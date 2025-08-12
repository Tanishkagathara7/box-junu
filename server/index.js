import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";
import groundRoutes, { adminRouter as adminGroundsRouter } from "./routes/grounds.js";
import bookingRoutes, { adminRouter as adminBookingsRouter } from "./routes/bookings.js";
import userRoutes from "./routes/users.js";
import paymentsRoutes from "./routes/payments.js";
import { adminRouter as adminLocationsRouter } from "./routes/locations.js";
import { startBookingCleanupService } from "./lib/bookingCleanup.js";

// Environment Config
dotenv.config();

// App and Server Initialization
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? [
            process.env.FRONTEND_URL,
            'https://boxcric.netlify.app',
            'https://box-host.netlify.app',
            'https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app',
            'https://box-new.vercel.app',
            'https://box-cash.vercel.app'
          ]
        : [
            "http://localhost:5173",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:8082",
            "http://localhost:3000",
            "http://localhost:4000",
            "http://10.91.186.90:8080"
          ];
      
      // Check if origin is in allowed list or matches Vercel pattern
      if (allowedOrigins.includes(origin) || 
          (process.env.NODE_ENV === 'production' && origin.match(/https:\/\/.*\.vercel\.app$/)) ||
          process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL,
          'https://boxcric.netlify.app',
          'https://box-host.netlify.app',
          'https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app',
          'https://box-new.vercel.app',
          'https://box-cash.vercel.app'
        ]
      : [
          "http://localhost:5173",
          "http://localhost:8080",
          "http://localhost:8081",
          "http://localhost:8082",
          "http://localhost:3000",
          "http://localhost:4000",
          "http://10.91.186.90:8080"
        ];
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches Vercel pattern (for production)
    if (process.env.NODE_ENV === 'production' && origin.match(/https:\/\/.*\.vercel\.app$/)) {
      return callback(null, true);
    }
    
    // For development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../dist')));
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';
let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    isMongoConnected = true;
    
    // Start booking cleanup service after MongoDB connection
    try {
      startBookingCleanupService(5); // Run cleanup every 5 minutes
      console.log("🧹 Booking cleanup service started");
    } catch (cleanupError) {
      console.error("❌ Failed to start booking cleanup service:", cleanupError);
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Running without database connection");
    isMongoConnected = false;
  });

app.set("mongoConnected", () => isMongoConnected);

// Cashfree Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';

// Socket.IO Setup
io.on("connection", (socket) => {
  console.log("🧠 Socket connected:", socket.id);

  socket.on("join-ground", (groundId) => {
    socket.join(`ground-${groundId}`);
    console.log(`📍 User joined room: ground-${groundId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Attach IO to app
app.set("io", io);

// Generic API info endpoint (optional)
app.get("/api", (req, res) => {
  res.json({
    message: "BoxCric API",
    status: "active",
    version: "1.0.0",
    endpoints: [
      "/api/auth",
      "/api/grounds",
      "/api/bookings",
      "/api/payments",
      "/api/users",
      "/api/test"
    ],
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/grounds", groundRoutes);
app.use("/api/admin/grounds", adminGroundsRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin/locations", adminLocationsRouter);

// Import health check middleware
import { healthCheck } from "./lib/healthCheck.js";

// Health Check endpoint
app.get("/api/health", healthCheck);

// Root endpoint for deployment health checks
app.get("/", (req, res) => {
  res.json({
    message: "BoxCric API Server is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  });
});

// Import error handling middleware
import { errorConverter, errorHandler, notFound, setupErrorHandlers } from "./lib/errorHandler.js";

// Setup global error handlers for uncaught exceptions
setupErrorHandlers();

// Handle React routing in production - return all non-API requests to React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// 404 Handler - Must be after all routes
app.use("*", notFound);

// Error converter - Convert regular errors to ApiError format
app.use(errorConverter);

// Error Handler - Final middleware for handling all errors
app.use(errorHandler);

// Server Listener
const PORT = process.env.PORT || 3001;
// Always use 0.0.0.0 on Render or in production to accept connections from any IP
// Force 0.0.0.0 for all deployments to ensure proper binding
const HOST = '0.0.0.0';

// Debug environment variables
console.log('Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`RENDER: ${process.env.RENDER ? 'true' : 'undefined'}`);
console.log(`HOST: ${HOST}`);
console.log(`PORT: ${PORT}`);

// Additional debug info
console.log('Server binding to:', `${HOST}:${PORT}`);
console.log('Running in environment:', process.env.NODE_ENV || 'development');

server.listen(PORT, HOST, () => {
  console.log(`🚀 BoxCric API Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Frontend expected at: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`💳 Cashfree Config:`);

  if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
    console.log(`   ✅ App ID: ${CASHFREE_APP_ID.slice(0, 6)}...`);
    console.log(`   ✅ Secret Key: ${CASHFREE_SECRET_KEY.slice(0, 6)}...`);
    console.log(`   ✅ API URL: ${CASHFREE_API_URL}`);
  } else {
    console.log(`   ❌ Cashfree credentials not set`);
  }
});


export default app;
