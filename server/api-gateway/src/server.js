require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: [
    'https://resilient-gaufre-cbf0c2.netlify.app',
    'https://main--resilient-gaufre-cbf0c2.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions)); // Only use cors once with your configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Proxy Configuration
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    // Simple path transformation without regex
    const path = req.originalUrl;
    return path.startsWith('/v1') ? path.replace('/v1', '/api') : path;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      message: 'Internal server error!',
      error: err.message,
    });
  },
  // Add these for better proxy handling
  preserveHostHdr: true,
  timeout: 30000,
  limit: '10mb'
};

// Routes
app.use(
  '/v1/designs',
  authMiddleware,
  proxy(process.env.DESIGN, proxyOptions)
);

app.use(
  '/v1/media',
  authMiddleware,
  proxy(process.env.UPLOAD, {
    ...proxyOptions,
    parseReqBody: false
  })
);

app.use(
  '/v1/subscription',
  authMiddleware,
  proxy(process.env.SUBSCRIPTION, proxyOptions)
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`Design Service URL: ${process.env.DESIGN}`);
  console.log(`Upload Service URL: ${process.env.UPLOAD}`);
  console.log(`Subscription Service URL: ${process.env.SUBSCRIPTION}`);
});