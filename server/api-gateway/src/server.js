require('dotenv').config();
const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Service URLs with fallbacks
const SERVICES = {
  DESIGN: process.env.DESIGN || 'https://design-service.onrender.com',
  UPLOAD: process.env.UPLOAD || 'https://upload-service-2rrl.onrender.com',
  SUBSCRIPTION: process.env.SUBSCRIPTION || 'https://subscription-service-jzeo.onrender.com'
};

console.log('Service URLs:', SERVICES);

// CORS Configuration
const corsOptions = {
  origin: [
    'https://resilient-gaufre-cbf0c2.netlify.app',
    'https://main--resilient-gaufre-cbf0c2.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-name'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    services: Object.keys(SERVICES).map(service => ({
      name: service,
      url: SERVICES[service],
      status: 'active'
    }))
  });
});

// Custom proxy handler that avoids path-to-regexp issues
const createServiceProxy = (serviceUrl) => {
  return (req, res, next) => {
    // Manually rewrite the path
    const newPath = req.originalUrl.replace(/^\/v1/, '/api');
    const targetUrl = new URL(newPath, serviceUrl).toString();
    
    // Create a one-time proxy middleware
    const proxy = createProxyMiddleware({
      target: serviceUrl,
      changeOrigin: true,
      pathRewrite: (path) => {
        // Simple string replacement without regex
        return path.startsWith('/v1') ? path.replace('/v1', '/api') : path;
      },
      onProxyReq: fixRequestBody,
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(502).json({ 
          error: 'Bad Gateway',
          target: serviceUrl,
          path: req.originalUrl
        });
      },
      logger: console,
      timeout: 30000,
      secure: true,
      xfwd: true
    });
    
    // Execute the proxy
    proxy(req, res, next);
  };
};

// Routes
app.use('/v1/designs', 
  authMiddleware,
  createServiceProxy(SERVICES.DESIGN)
);

app.use('/v1/media',
  authMiddleware,
  createServiceProxy(SERVICES.UPLOAD)
);

app.use('/v1/subscription',
  authMiddleware,
  createServiceProxy(SERVICES.SUBSCRIPTION)
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🎨 Design Service: ${SERVICES.DESIGN}`);
  console.log(`📤 Upload Service: ${SERVICES.UPLOAD}`);
  console.log(`💳 Subscription Service: ${SERVICES.SUBSCRIPTION}`);
});