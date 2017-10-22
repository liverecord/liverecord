/**
 * Created by zoonman on 11/19/16.
 */
const Category = require('../schema').Category;
const errorHandler = require('./errors');
const xtend = require('xtend');

const emptyCategory = {
  description: '',
  name: 'Not found',
  slug: 'slug',
  order: 100,
  body: 'Requested URL was not found',
};

module.exports = (socket) => {
  socket.on('categories', function(question, socketCallback) {
        Category.find({})
            .sort({order: 1, name: 1})
            .select('name slug description order')
            .lean()
            .then((data) => socketCallback(data))
            .catch(errorHandler);
      }
  );


  socket.on('category.save', function(data, socketCallback) {
        if (socket.webUser &&
            socket.webUser.roles &&
            socket.webUser.roles.indexOf('admin') > -1) {
          data = xtend(
              emptyCategory,
              data
          );
          if (data._id) {
            Category
            .findByIdAndUpdate(
                data._id,
                data
            )
            .then(r => {
              'use strict';
              socketCallback(r);
            })
            .catch(err => {
              'use strict';
              socketCallback(emptyCategory);
              errorHandler(err);
            });
          } else {
            let cat = new Category(data);
            cat.save((err, pgo) => {
              'use strict';
              if (err) {
                socketCallback(emptyCategory);
              } else {
                socketCallback(pgo.toObject());
              }
            });
          }
        }
      }
  );

  socket.on('category.delete', function(_id, socketCallback) {
        if (socket.webUser &&
            socket.webUser.roles &&
            socket.webUser.roles.indexOf('admin') > -1) {

          if (_id) {
            Category
            .findByIdAndRemove(
                _id
            )
            .then(r => {
              'use strict';
              socketCallback(r);
            })
            .catch(err => {
              'use strict';
              socketCallback({status: 'error'});
              errorHandler(err);
            });
          } else {
            socketCallback({status: 'error'});
          }
        }
      }
  );
  
  
  
};

