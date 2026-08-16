const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const rideRoutes = require('./routes/rides');
const placeRoutes = require('./routes/places');
const photoRoutes = require('./routes/photos');
const clubRoutes = require('./routes/clubs');
const mapRoutes = require('./routes/map');
const adminRoutes = require('./routes/admin');
const vehicleRoutes = require('./routes/vehicles');
const segmentRoutes = require('./routes/segments');

const app = express();

// ── Security & Parsing ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://theridesclub.com', 'https://admin.theridesclub.com']
    : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'The Rides Club API',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/segments', segmentRoutes);

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error Handler ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
