/**
 * Created by zoonman on 11/5/16.
 */

const errorHandler = require('../handlers/errors');
const mongoose = require('mongoose');
const slug = require('limax');
const async = require('async');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    set: function(v) {
      this.slug = slug(v, {separator: '', lang: 'en', separateNumbers: false});
      this.slug = this.slug.replace(/\\-/g, '');
      return v;
    }
  },
  email: {type: String, unique: true, lowercase: true},
  slug: {
    type: String,
    unique: true
  },
  picture: String,
  about: String,
  pw: {
    hash: String,
    salt: String,
    keyLength: Number,
    hashMethod: String,
    iterations: Number
  },
  rank: {type: Number, default: 0},
  roles: [String],
  settings: {
    notifications: {
      email: {type: Boolean, default: true}
    }
  },
  devices: [
    {
      _id: String,
      ua: String,
      lastIp: String,
      pushEnabled: {type: Boolean, default: true},
      pushSubscription: {
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String
        }
      }
    }
  ],
  totals: {
    topics: {type: Number, default: 0},
    comments: {type: Number, default: 0}
  },
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  deleted: {type: Boolean, default: false},
  online: {type: Boolean, default: false}
}
);

UserSchema.pre('save', function(next) {
  var self = this, i = 0, originalSlug = this.slug;

  function lookupSlug() {
    var cond = {'slug': self.slug};
    if (self._id) {
      cond['_id'] = {$ne: self._id};
    }
    mongoose.models['User'].count(cond, function(err, count) {
          if (count > 0) {
            i++;
            self.slug = originalSlug + (i.toString());
            lookupSlug();
          } else {
            // do stuff
            next();
          }
        }
    );
  }

  lookupSlug();
}
);

UserSchema.methods.hasRole = function(role) {
  if (this.roles instanceof Array) {
    return this.roles.indexOf(role) > -1;
  }
  return false;
};

UserSchema.methods.refreshRank = function() {
  var self = this;
  async.parallel({
        // ищем количество тем
        topicCount: function(callback) {
          mongoose.models['Topic'].count(
              {'user': self._id, deleted: false, spam: false},
              function(err, count) {
                if (err) {
                  //errorHandler(err);
                }
                callback(null, count || 0);
              }
          );
        },
        // ищем количество комментариев
        commentCount: function(callback) {
          mongoose.models['Comment'].count(
              {'user': self._id, deleted: false, spam: false},
              function(err, count) {
                if (err) {
                  //errorHandler(err);
                }
                callback(null, count || 0);
              }
          );
        },
        commentMax: function(callback) {
          mongoose.models['User'].aggregate(
              [
                {$match: { 'totals.comments': {$exists: true}}},
                {$group: {_id: 'comments', total: {$max: '$totals.comments'} }}
              ],
              function(err, r) {
                if (err) {
                  errorHandler(err);
                }
                var count = 1;
                if (r[0] && r[0]['total']) {
                  count = r[0]['total'];
                }
                console.log('totals.comments', count);
                callback(null, count);
              }
          );
        },
        topicMax: function(callback) {
          mongoose.models['User'].aggregate(
              [
                {$match: {'totals.topics': {$exists: true}}},
                {$group: {_id: 'comments', total: {$max: '$totals.topics'} }}
              ],
              function(err, r) {
                if (err) {
                  errorHandler(err);
                }
                var count = 1;
                if (r[0] && r[0]['total']) {
                  count = r[0]['total'];
                }
                console.log('totals.topics', count);
                callback(null, count);
              }
          );
        }
      },
      // после того, как оба параллельных запроса завершены,
      // запускаем эту функцию
      function(err, details) {
        self.totals.comments = details.commentCount;
        self.totals.topics = details.topicCount;
        var r = 0;
        if (details.commentCount > 0 && details.commentMax > 1) {

          //console.log('comments', details.commentCount, Math.log(details.commentCount), details.commentMax,  Math.log(details.commentMax))


          r += Math.log(details.commentCount) / Math.log(details.commentMax) * 3;
        }
        if (details.topicCount > 0 && details.topicMax > 1) {

          //console.log('topics', details.topicCount, Math.log(details.topicCount), details.topicMax,  Math.log(details.topicMax))

          r += Math.log(details.topicCount) / Math.log(details.topicMax) * 2;
        }
        console.log(r);
        if (r > 0) {
          self.rank = r;
        }
        self.save();
      }
  );
  return self;
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
