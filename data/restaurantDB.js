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
