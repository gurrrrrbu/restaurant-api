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

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');

// Routers
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();

// ---- Config ----
const PORT = process.env.PORT || 3000;
// Allow either MONGODB_URI (recommended) or your existing MONGODB_CONN_STRING
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_CONN_STRING;

// ---- View Engine (Handlebars) ----
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health / Root routes (so Render health checks pass) ----
// replace the old '/' route:
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// make '/' render your main page (pick one):
app.get('/', (req, res) => {
  // If you have a view called 'form' or 'restaurants':
  return res.render('form');               // shows the search form
  // or:
  // return res.redirect('/restaurants?page=1&perPage=10');
});


// ---- App Routes ----
app.use('/', restaurantRoutes);

// ---- Start Server (after DB connects) ----
(async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('Missing MongoDB connection string. Set MONGODB_URI (preferred) or MONGODB_CONN_STRING.');
    }

    // Tighten server selection timeout so failed deploys surface quickly
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    // Fail fast so Render marks the deploy as failed with visible logs
    process.exit(1);
  }
})();
