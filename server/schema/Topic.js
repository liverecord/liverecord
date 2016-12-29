/**
 * Created by zoonman on 11/5/16.
 */

const mongoose = require("mongoose");
const slug = require('limax');
const TopicSchema = new mongoose.Schema({
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
    updated: { type: Date, default: Date.now },
    subscribers: { type: Number, default: 1 },
    tags: [String],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    spam: {
        type: Boolean,
        default: false
    }
});

TopicSchema.pre('save', function(next) {
    var self = this, i = 0, originalSlug = this.slug;
    function lookupSlug() {
        mongoose.models["Topic"].count({'slug': self.slug}, function(err, count) {
            if (count > 0) {
                i++;
                self.slug = originalSlug + (i.toString());
                lookupSlug();
            } else {
                // do stuff
                next();
            }
        });
    }
    lookupSlug();
});

TopicSchema.index({updated: -1});
TopicSchema.index({spam: -1});
TopicSchema.index({slug: 1});
// add fulltext index
TopicSchema.index({
    title: 'text',
    body: 'text',
    slug: 'text'
}, {
    name: 'fulltext_index',
    weights: {
        title: 10,
        body: 2,
        slug: 1
    }
});
module.exports = mongoose.model('Topic', TopicSchema);
