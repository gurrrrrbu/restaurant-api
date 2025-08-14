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
// Add small helpers used by templates to avoid runtime errors.
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

// ---- Root = search form (no Home tab needed) ----
app.get('/', (_req, res) => {
  return res.render('form', { page: 1, perPage: 5, borough: '' });
});

// Backward compatibility for old links
app.get('/form', (_req, res) => res.redirect('/'));

// ---- App Routes ----
app.use('/', restaurantRoutes);

// ---- Start Server after DB connects ----
(async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('Missing MongoDB connection string. Set MONGODB_URI (preferred) or MONGODB_CONN_STRING.');
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      dbName: DB_NAME
    });

    console.log('✅ Connected to MongoDB DB:', mongoose.connection.name);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('==> Your service is live');
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
})();
