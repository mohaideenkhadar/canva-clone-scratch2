require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: [
    //   'http://localhost:3000', // for development
      'https://resilient-gaufre-cbf0c2.netlify.app/', // your production domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Proxy configuration
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

// /v1/design/add -> /api/design/add

app.use(
    '/v1/designs',
    authMiddleware,
    proxy(process.env.DESIGN, {
    ...proxyOptions,
})
);

// const { createProxyMiddleware } = require('http-proxy-middleware');

// app.use(
//     '/v1/designs',
//     authMiddleware,
//     createProxyMiddleware({
//       target: process.env.DESIGN,
//       changeOrigin: true,
//       pathRewrite: {
//         '^/v1': '/api' // Rewrite /v1 to /api
//       },
//       onError: (err, req, res) => {
//         res.status(500).json({
//           message: 'Internal server error',
//           error: err.message
//         });
//       }
//     })
//   );


app.use(
    '/v1/media',
    authMiddleware,
    proxy(process.env.UPLOAD, {
    ...proxyOptions,
    parseReqBody : false
})
);

//some extra logic we need to handle later
app.use(
    '/v1/subscription',
    authMiddleware,
    proxy(process.env.SUBSCRIPTION, {
    ...proxyOptions,
})
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, ()=> {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`DESIGN Service is running on port ${process.env.DESIGN}`);
    console.log(`UPLOAD Service is running on port ${process.env.UPLOAD}`);
    console.log(`SUBSCRIPTION Service is running on port ${process.env.SUBSCRIPTION}`);
});