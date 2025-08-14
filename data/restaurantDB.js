/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Tandin Phurba, Student IDs:N01654961 Date: 12/08/2025
 * Group member Name: Aszad Khan, Student IDs:N01668211 Date: 12/08/2025
 ******************************************************************************/

const Restaurant = require('../models/Restaurant');

let db = {};

db.initialize = (connStr) => {
  return mongoose.connect(connStr);
};

db.addNewRestaurant = (data) => new Restaurant(data).save();
db.getAllRestaurants = (page, perPage, borough) => {
  let query = borough ? { borough } : {};
  return Restaurant.find(query)
    .sort({ restaurant_id: 1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();
};
db.getRestaurantById = (id) => Restaurant.findById(id).exec();
db.updateRestaurantById = (data, id) =>
  Restaurant.findByIdAndUpdate(id, data, { new: true }).exec();
db.deleteRestaurantById = (id) => Restaurant.findByIdAndDelete(id).exec();

module.exports = db;
