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
      'https://main--resilient-gaufre-cbf0c2.netlify.app'
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

//proxy options
const proxyOptions = {
    proxyReqPathResolver : (req)=> {
        return req.originalUrl.replace(/^\/v1/, "/api")
    },
    proxyErrorHandler : (err, res, next)=> {
        res.status(500).json({
            message : 'Internal server error!',
            error : err.message,
        });
    },
};

// /v1/design/add -> /api/design/add

app.use(
    '/v1/designs',
    authMiddleware,
    proxy(process.env.DESIGN, {
    ...proxyOptions,
})
);

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

app.listen(PORT, ()=> {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`DESIGN Service is running on port ${process.env.DESIGN}`);
    console.log(`UPLOAD Service is running on port ${process.env.UPLOAD}`);
    console.log(`SUBSCRIPTION Service is running on port ${process.env.SUBSCRIPTION}`);
});