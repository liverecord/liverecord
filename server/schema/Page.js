/**
 * Created by zoonman on 11/5/16.
 */

const mongoose = require('mongoose');
const slug = require('limax');
const PageSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  slug: {
    type: String
  },
  mp: { // can't use path due to name conflict with Schema
    type: String,
    unique: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  },
  name: {type: String, default: ''},
  body: {type: String, default: ''},
  menu: {type: String, default: ''},
  description: {type: String, default: ''},
  keywords: [String],
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  published: {type: Date, default: Date.now},
  recalled: {type: Date, default: Date.now},
  deleted: {type: Date, default: null}
});


/**
 * Build materialized path
 *
 * @param {PageSchema} doc
 * @param {Function} callback
 */
function mpBuilder(doc, callback) {
  let pp = doc.mp || '';
  if (pp.length > 0) {
    pp += '/';
  }
  doc.mp = pp + doc.slug;
  if (doc.hasOwnProperty('parent')) {
    mongoose
        .models['Page']
        .findOne({_id: doc.parent})
        .lean()
        .then((d) => {
          'use strict';
          if (null === d) {
            callback();
          } else {
            mpBuilder(d, callback);
          }
        })
        .catch((e) => {
          'use strict';
          callback();
        });
  } else {
    callback();
  }
}

function lookupSlug(self, originalSlug, i, next) {
  let conditions = {'slug': self.slug};
  if (self._id) {
    conditions['_id'] = {'$ne': self._id};
  }
  mongoose
      .models['Page']
      .count(conditions, function(err, count) {
        if (count > 0) {
          i++;
          self.slug = originalSlug + (i.toString());
          lookupSlug(self, originalSlug, i, next);
        } else {
          mpBuilder(self, next);
          // next();
        }
      });
}

PageSchema.pre('save', function(next) {
  let self = this, i = 0, originalSlug = this.slug;
  if (originalSlug.length === 0) {
    self.slug = slug(this.title);
  }
  lookupSlug(self, originalSlug, i, next);
});

PageSchema.pre('findOneAndUpdate', function(next) {
  let self = this, i = 0;
  lookupSlug(self._update, self._update.slug, i, next);
});

PageSchema.index({mp: 1}, {background: true});

module.exports = mongoose.model('Page', PageSchema);
