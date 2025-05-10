require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
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
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Proxy Configuration
const createServiceProxy = (serviceUrl) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/v1': '/api'  // Simple string replacement
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(502).json({ error: 'Bad Gateway' });
    },
    logger: console,
    timeout: 30000
  });
};

// Routes
app.use('/v1/designs', 
  authMiddleware,
  createServiceProxy(process.env.DESIGN)
);

app.use('/v1/media',
  authMiddleware,
  createServiceProxy(process.env.UPLOAD)
);

app.use('/v1/subscription',
  authMiddleware,
  createServiceProxy(process.env.SUBSCRIPTION)
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Design Service: ${process.env.DESIGN}`);
  console.log(`Upload Service: ${process.env.UPLOAD}`);
  console.log(`Subscription Service: ${process.env.SUBSCRIPTION}`);
});