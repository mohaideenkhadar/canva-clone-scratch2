require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Simplified proxy options
const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl;
    },
    proxyErrorHandler: (err, res, next) => {
        res.status(500).json({
            message: 'Internal server error!',
            error: err.message,
        });
    },
};

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Proxy routes
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

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`DESIGN Service URL: ${process.env.DESIGN}`);
    console.log(`UPLOAD Service URL: ${process.env.UPLOAD}`);
    console.log(`SUBSCRIPTION Service URL: ${process.env.SUBSCRIPTION}`);
});