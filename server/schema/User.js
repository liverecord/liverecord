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
    email: {type: String, unique: true, lowercase: true},
    slug: {
        type: String,
        unique: true
    },
    picture: String,
    pw: {
        hash: String,
        salt: String,
        keyLength: Number,
        hashMethod: String,
        iterations: Number
    },
    roles: [String],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false},
    online: { type: Boolean, default: false}
});

UserSchema.pre('save', function(next) {
    var self = this, i = 0, originalSlug = this.slug;
    function lookupSlug() {
        mongoose.models["User"].count({'slug': self.slug}, function(err, count) {
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

UserSchema.methods.hasRole = function(role) {
    if (this.roles instanceof Array) {
        return this.roles.indexOf(role) > -1;
    }
    return false;
};
UserSchema.index({slug: 1});

/*
* @param {String} hashObject.hash
 @param {String} hashObject.salt
 @param {Number} hashObject.keyLength Bytes in hash
 @param {String} hashObject.hashMethod
 @param {Number} hashObject.iterations
*
* */
module.exports = mongoose.model('User', UserSchema); // register model
