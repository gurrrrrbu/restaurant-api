const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Restaurant', restaurantSchema);
