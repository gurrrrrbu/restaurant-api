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
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_CONN_STRING;
const DB_NAME   = process.env.MONGO_DBNAME || 'sample_restaurants';

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

// ---- Health check ----
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// ---- Root = search form ----
app.get('/', (_req, res) => {
  return res.render('form', { page: 1, perPage: 5, borough: '' });
});
app.get('/form', (_req, res) => res.redirect('/'));

// ---- Reuse a single Mongo connection (important for serverless) ----
async function ensureMongo() {
  if (!MONGO_URI) {
    console.warn('Missing MongoDB URI (MONGODB_URI or MONGODB_CONN_STRING).');
    return; // allow non-DB routes to work
  }
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000 });
  console.log('✅ Mongo connected to DB:', mongoose.connection.name);
}

// Only hit Mongo for routes that need it
app.use(async (req, res, next) => {
  if (req.path.startsWith('/restaurants')) {
    try {
      await ensureMongo();
    } catch (e) {
      console.error('❌ Mongo connect error:', e.message);
      return res.status(503).send('Database not ready. Try again in a moment.');
    }
  }
  next();
});

// ---- App Routes ----
app.use('/', restaurantRoutes);

// ---- EXPORT (no app.listen here) ----
module.exports = app;