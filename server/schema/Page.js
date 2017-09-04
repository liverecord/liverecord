/**
 * Created by zoonman on 11/5/16.
 */

const mongoose = require('mongoose');
const slug = require('limax');
const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    set: function(v) {
      this.slug = slug(v);
      return v;
    }
  },
  slug: {
    type: String
  },
  materializedPath: {
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

function mp(doc, callback) {
  doc.materializedPath = (doc.materializedPath || '') + '/' + doc.slug;
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
            mp(d, callback);
          }
        })
        .catch((e) => {
          'use strict';
          callback();
        })

  }
  callback();
}

PageSchema.pre('update', function() {
  'use strict';
  mp(this, function() {

  });
});

PageSchema.pre('save', function(next) {
  let self = this, i = 0, originalSlug = this.slug;

  function lookupSlug() {
    mongoose
        .models['Page']
        .count({'slug': self.slug}, function(err, count) {
          if (count > 0) {
            i++;
            self.slug = originalSlug + (i.toString());
            lookupSlug();
          } else {
            mp(self, next);
            // do stuff
            // next();
          }
        });
  }
  lookupSlug();
});
PageSchema.index({materializedPath: 1});

module.exports = mongoose.model('Page', PageSchema);
