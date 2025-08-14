/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Tandin Phurba, Student IDs:N01654961 Date: 12/08/2025
 * Group member Name: Aszad Khan, Student IDs:N01668211 Date: 12/08/2025
 ******************************************************************************/

const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

router.get('/restaurants', async (req, res, next) => {
  try {
    // require the search inputs (the form always sends them)
    if (!req.query.page || !req.query.perPage) return res.redirect('/');

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.perPage) || 10, 1), 50);

    const boroughRaw = (req.query.borough ?? '').trim();
    const filter = {};
    if (boroughRaw) filter.borough = boroughRaw;

    const [items, total] = await Promise.all([
      Restaurant.find(filter)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      Restaurant.countDocuments(filter)
    ]);

    res.render('restaurants', {
      restaurants: items,
      page,
      perPage,
      borough: boroughRaw,
      total,
      hasPrev: page > 1,
      hasNext: page * perPage < total
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

