/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Tandin Phurba, Student IDs: N01654961  Date: 12/08/2025
 * Group member Name: Aszad Khan,  Student IDs: N01668211   Date: 12/08/2025
 ******************************************************************************/

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // safer on Vercel than native bcrypt
const { body, validationResult } = require('express-validator');

const restaurantRoutes = require('./routes/restaurantRoutes');
const User = require('./models/User');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// ---- Config ----
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_CONN_STRING;
const DB_NAME   = process.env.MONGO_DBNAME || 'sample_restaurants';

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment');
}

// ---- View Engine (Handlebars) ----
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    increment: v => (Number(v) || 0) + 1,
    decrement: v => Math.max((Number(v) || 1) - 1, 1)
  }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// ---- Middleware ----
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOW_ORIGIN || '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate-limit auth attempts
const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });
app.use('/login', authLimiter);

// ---- Health check ----
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// ---- Root = search form ----
app.get('/', (_req, res) => res.render('form', { page: 1, perPage: 5, borough: '' }));
app.get('/form', (_req, res) => res.redirect('/'));

// ---- Reuse a single Mongo connection (important for serverless) ----
async function ensureMongo() {
  if (!MONGO_URI) {
    console.warn('Missing MongoDB URI (MONGODB_URI or MONGODB_CONN_STRING).');
    return;
  }
  // 0=disc, 1=conn, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000 });
  console.log('✅ Mongo connected to DB:', mongoose.connection.name);
}

// Ensure DB for any route that needs it
app.use(async (req, res, next) => {
  const needsDb =
    req.path.startsWith('/login') ||
    req.path.startsWith('/api/') ||
    req.path.startsWith('/restaurants');   // ← added so the view route can query DB
  if (!needsDb) return next();

  try {
    await ensureMongo();
    next();
  } catch (e) {
    console.error('❌ Mongo connect error:', e.message);
    res.status(503).send('Database not ready. Try again in a moment.');
  }
});

// ---- Auth: POST /login (Generate JWT) ----
app.post(
  '/login',
  [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) return res.status(400).json({ message: 'User not found' });

      const validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) return res.status(400).json({ message: 'Invalid password' });

      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.setHeader('Authorization', `Bearer ${token}`);
      return res.json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// ---- Routes ----
// Public GETs, protected writes handled inside router
app.use('/', restaurantRoutes);

// Example of protecting *all* /api routes (uncomment if you prefer blanket protection):
// app.use('/api', authenticateToken, restaurantRoutes);

// ---- Basic error handlers (nice polish) ----
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

// ---- EXPORT (no app.listen here) ----
module.exports = app;
