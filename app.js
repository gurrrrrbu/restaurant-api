/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Tandin Phurba, Student IDs:N01654961 Date: 12/08/2025
 * Group member Name: Aszad Khan, Student IDs:N01654961 Date: 12/08/2025
 ******************************************************************************/

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');

// import the router
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars 
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/', restaurantRoutes);

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_CONN_STRING)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
