const express = require('express');
const router = express.Router();
const db = require('../data/restaurantDB');

// Form view
router.get('/form', (req, res) => {
  res.render('form');
});

// Restaurant listing
router.get('/restaurants', async (req, res) => {
  const { page = 1, perPage = 5, borough } = req.query;
  try {
    const restaurants = await db.getAllRestaurants(
      parseInt(page),
      parseInt(perPage),
      borough
    );
    res.render('restaurants', {
      restaurants,
      page: parseInt(page),
      perPage: parseInt(perPage),
      borough,
      prevPage: page > 1 ? parseInt(page) - 1 : null,
      nextPage: restaurants.length === parseInt(perPage) ? parseInt(page) + 1 : null,
    });
  } catch (err) {
    res.status(500).send("Error retrieving restaurants");
  }
});

module.exports = router;
