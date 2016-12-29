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
    slug: String,
    order: {type: Number, default: 100}
});

CategorySchema.pre('save', function(next) {
    var self = this, i = 0, originalSlug = this.slug;
    function lookupSlug() {
        mongoose.models["Category"].count({'slug': self.slug}, function(err, count) {
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

CategorySchema.index({slug: 1});
CategorySchema.index({order: 1});
module.exports = mongoose.model('Category', CategorySchema); // register model
