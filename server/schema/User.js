/**
 * Created by zoonman on 11/5/16.
 */


const mongoose = require("mongoose");
const slug = require('limax');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        set: function(v) {
            this.slug = slug(v);
            return v;
        }
    },
    email: {type: String, unique: true},
    slug: {
        type: String,
        unique: true
    },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); // register model
