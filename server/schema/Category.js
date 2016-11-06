/**
 * Created by zoonman on 11/5/16.
 */

const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String
});

module.exports = mongoose.model('Category', CategorySchema); // register model
