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
  body: 'Requested URL was not found',
};

function socketHandler(socket, errorHandler) {
  socket.on('page', function(pageReq, pageCallback) {
    console.log('page', pageReq);
    let materializedPath = '';
    if (pageReq.hasOwnProperty('path')) {
      materializedPath = pageReq.path;
    } else {
      materializedPath = pageReq
    }
    models
        .Page
        .findOne({materializedPath: '/' + ltrim(materializedPath, '/')})
        .then((page) => {
          if (null === page) {
            pageCallback(null, emptyPage);
          } else {
            pageCallback(null, page);
          }
        })
        .catch((err) => {
          pageCallback(null, emptyPage);
          console.log('page', materializedPath, 'not found');
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

  socket.on('page.save', function(data, socketCallback) {
    if (socket.webUser &&
        socket.webUser.roles &&
        socket.webUser.roles.indexOf('admin') > -1) {
          data = xtend(
              emptyPage,
              data
          );
          if (data._id) {
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
              } else {
                socketCallback(pgo.toObject());
              }
            });
          }
        }
      }
  );

  socket.on('page.delete', function(_id, socketCallback) {
        if (socket.webUser &&
            socket.webUser.roles &&
            socket.webUser.roles.indexOf('admin') > -1) {

          if (_id) {
            models
            .Page
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

}

module.exports.socketHandler = socketHandler;
