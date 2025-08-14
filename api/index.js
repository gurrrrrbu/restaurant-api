// api/index.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const serverless = require('serverless-http');

// reuse your existing router
const restaurantRoutes = require('../routes/restaurantRoutes');

const app = express();

// ---- Mongo (cached between invocations) ----
let mongoReady = false;
let mongoPromise = null;
async function connectMongo() {
  if (mongoReady) return;
  if (!mongoPromise) {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_CONN_STRING;
    const dbName = process.env.MONGO_DBNAME || 'sample_restaurants';
    if (!uri) throw new Error('Missing MongoDB connection string');
    mongoPromise = mongoose
      .connect(uri, { dbName, serverSelectionTimeoutMS: 15000 })
      .then(() => { mongoReady = true; })
      .catch(err => { mongoPromise = null; throw err; });
  }
  await mongoPromise;
}

// Only gate routes that actually need DB
app.use(async (req, res, next) => {
  try {
    if (req.path.startsWith('/restaurants')) {
      await connectMongo();
    }
    next();
  } catch (e) {
    console.error('Mongo connect error:', e.message);
    res.status(503).send('Database not ready. Try again in a moment.');
  }
});

// ---- Views / middleware ----
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    increment: v => (Number(v) || 0) + 1,
    decrement: v => Math.max((Number(v) || 1) - 1, 1)
  }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- Routes ----
app.get('/healthz', (_req, res) => res.status(200).send('OK'));
app.get('/', (_req, res) => res.render('form', { page: 1, perPage: 5, borough: '' }));
app.get('/form', (_req, res) => res.redirect('/')); // if anyone hits /form directly
app.use('/', restaurantRoutes);

// Export a Vercel handler
module.exports = serverless(app);
