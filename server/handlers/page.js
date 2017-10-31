/**
 * Created by zoonman on 2/4/17.
 */

const xtend = require('xtend');
const ltrim = require('ltrim');
const models = require('../schema');

const emptyPage = {
  title: '',
  description: '',
  name: 'Not found',
  menu: '',
  slug: '',
  path: '',
  mp: '',
  body: 'Requested URL was not found',
};

function socketHandler(socket, errorHandler) {
  socket.on('page', function(pageReq, pageCallback) {
    console.log('page', pageReq);
    let condition = {};
    if (pageReq.path) {
      condition['mp'] = pageReq.path;
    } else if (pageReq._id) {
      condition['_id'] = pageReq._id;
    } else {
      condition['mp'] = pageReq;
    }
    models
        .Page
        .findOne(condition)
        .then((page) => {
          if (null === page) {
            pageCallback(null, emptyPage);
          } else {
            pageCallback(null, page);
          }
        })
        .catch((err) => {
          pageCallback(null, emptyPage);
          errorHandler(err);
        });
  });

  socket.on('page.list', function(data, socketCallback) {
    'use strict';
    models
        .Page
        .find()
        .lean()
        .then(r => {socketCallback(r)})
        .catch(errorHandler);
  });

  function isAdmin(socket) {
    return (socket.webUser &&
        socket.webUser.roles &&
        socket.webUser.roles.indexOf('admin') > -1);
  }

  socket.on('page.delete', function(data, socketCallback) {
    if (isAdmin(socket)) {
      models
          .Page
          .findByIdAndRemove(data)
          .then(r => {
            'use strict';
            socketCallback(true);
          })
          .catch(errorHandler);
    }
  });

  socket.on('page.save', function(data, socketCallback) {
    if (isAdmin(socket)) {
          data = xtend(
              emptyPage,
              data
          );
          if (data._id) {
            data.mp = '';
            models
                .Page
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
                  socketCallback(emptyPage);
                  errorHandler(err);
                });
          } else {
            let page = new models.Page(data);
            page.save((err, pgo) => {
              'use strict';
              if (err) {
                socketCallback(emptyPage);
                console.log(err);
              } else {
                socketCallback(pgo.toObject());
              }
            });
          }
        }
      }
  );
}

module.exports.socketHandler = socketHandler;
