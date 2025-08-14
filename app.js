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
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');

const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();

// ---- Config ----
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_CONN_STRING;
const DB_NAME = process.env.MONGO_DBNAME || 'sample_restaurants';

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---- Health check (for Render) ----
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// ---- Root = search form ----
app.get('/', (_req, res) => {
  return res.render('form', { page: 1, perPage: 5, borough: '' });
});

// Backward compatibility if anything links to /form
app.get('/form', (_req, res) => res.redirect('/'));

// ---- Gate routes that need the DB until it’s ready ----
let dbReady = false;
app.use((req, res, next) => {
  if (!dbReady && req.path.startsWith('/restaurants')) {
    return res.status(503).send('Database not ready. Try again in a moment.');
  }
  next();
});

// ---- App Routes ----
app.use('/', restaurantRoutes);

// ---- Start HTTP server first (so Render can connect), then connect to Mongo ----
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on ${PORT}`);
  // Connect to Mongo in the background
  if (!MONGO_URI) {
    console.error('❌ Missing MongoDB connection string. Set MONGODB_URI or MONGODB_CONN_STRING.');
    return; // keep server up so /healthz works; page routes will 503 until set
  }
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, dbName: DB_NAME })
    .then(() => {
      dbReady = true;
      console.log('✅ Connected to MongoDB DB:', mongoose.connection.name);
    })
    .catch(err => {
      // Keep server running; log error so you can fix allowlist/URI without 502s
      console.error('❌ MongoDB connection error:', err.message);
    });
});
