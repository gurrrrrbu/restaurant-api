/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Tandin Phurba, Student IDs:N01654961 Date: 12/08/2025
 * Group member Name: Aszad Khan, Student IDs:N01668211 Date: 12/08/2025
 ******************************************************************************/

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Restaurant', restaurantSchema);
