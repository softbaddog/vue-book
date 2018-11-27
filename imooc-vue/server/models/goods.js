var mongoose = require('mongoose');

var goodSchema = mongoose.Schema({
  "productId": String,
  "productName": String,
  "salePrice": Number,
  "productImage": String,
  "productNum": String,
  "checked": String
});

module.exports = mongoose.model('Good', goodSchema);
