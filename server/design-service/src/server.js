// design-service/src/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const designRoutes = require('./routes/design-routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/designs', designRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Design Service running on port ${PORT}`);
});