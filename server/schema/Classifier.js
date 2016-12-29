/**
 * Created by zoonman on 12/26/16.
 */
const mongoose = require("mongoose");
const ClassifierSchema = new mongoose.Schema({
    classifier: {
        type: String,
        unique: true
    },
    data: String
});
module.exports = mongoose.model('Classifier', ClassifierSchema); // register model
