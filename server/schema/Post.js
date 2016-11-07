/**
 * Created by zoonman on 11/5/16.
 */

const mongoose = require("mongoose");
const slug = require('limax');
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        set: function(v) {
            this.slug = slug(v);
            return v;
        }
    },
    slug: {
        type: String,
        unique: true
    },
    body: {
        type: String
    },
    created: { type: Date, default: Date.now },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }
});

module.exports = mongoose.model('Post', PostSchema);
