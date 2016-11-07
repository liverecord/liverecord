/**
 * Created by zoonman on 11/5/16.
 */

const mongoose = require("mongoose");
const slug = require('limax');
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        set: function(v) {
            this.slug = slug(v);
            return v;
        }
    },
    slug: String
});

module.exports = mongoose.model('Category', CategorySchema); // register model
