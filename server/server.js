const mongoose = require('mongoose');
const death = require('death');
const express = require('express');
const socketioJwt = require('socketio-jwt');
const jwt = require('jsonwebtoken');
const pick = require('object.pick');
const gravatar = require('gravatar');
const pw = require('credential')();
const question = require('./handlers/question');
const comments = require('./handlers/comments');
const loginHandler = require('./handlers/login');
const lrCategories = require('./handlers/categories');
const bookmarks = require('./handlers/bookmarks');
const topics = require('./handlers/topics');
const userHandler = require('./handlers/users');
const uploadHandler = require('./handlers/upload');
const errorHandler = require('./handlers/errors');
const pushHandler = require('./handlers/push');
const staticHandlers = require('./handlers/static');
const sharp = require('sharp');
const path = require('path');
const xtend = require('xtend');
const fs = require('fs');
const webpush = require('web-push');

//
// Initialize app config
var frontLiveRecordConfig = {
  gaId: process.env.npm_package_config_analytics_ga_id,
  version: '1'
};

frontLiveRecordConfig.version = fs
    .readFileSync(
        __dirname + '/public/version.txt', 'utf8'
    )
    .trim();

//
const app = express();
const SocketIOFileUpload = require('socketio-file-upload');

process.on('uncaughtException', errorHandler);
process.on('UnhandledPromiseRejectionWarning', errorHandler);
//
const Raven = require('raven');
Raven.config(process.env.npm_package_config_sentry_dsn).install();
app.use(Raven.requestHandler());

app.set('frontLiveRecordConfig', frontLiveRecordConfig);
//
const server = require('http').Server(app);
const io = require('socket.io')(server);
//
server.listen(process.env.npm_package_config_server_port,
    process.env.npm_package_config_server_host
);
//
console.log(
    'Listening on http://' + process.env.npm_package_config_server_host + ':' +
    process.env.npm_package_config_server_port
);

const filesPublicDirectory = process.env.npm_package_config_files_dir + '/';
const filesUploadDirectory = __dirname + '/public/' + filesPublicDirectory;

app.get('/', staticHandlers.expressRouter);
app.use('/', express.static(__dirname + '/public'));
app.use(SocketIOFileUpload.router);

// fixes bugs with promises in mongoose
mongoose.Promise = global.Promise;

const vapidFilePath = __dirname + '/' +
    process.env.npm_package_config_webpush_vapid_keys_path;

/***
 * @todo move it into db

var vapidKeys;
if (fs.existsSync(vapidFilePath)) {
  var vapidRaw = fs.readFileSync(vapidFilePath);
  if (vapidRaw) {
    vapidKeys = JSON.parse(vapidRaw);
  }
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.appendFileSync(vapidFilePath, JSON.stringify(vapidKeys));
}
webpush.setVapidDetails(
    'https://' + process.env.npm_package_config_server_name,
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
*/


mongoose.connect(process.env.npm_package_config_mongodb_uri);

var mongooseConnection = mongoose.connection;
mongooseConnection.on('error',
    console.error.bind(console, 'connection error:')
);

var threadConnections = 0;

mongooseConnection.once('open', function() {
  // we're connected!
  var models = require('./schema');
  const antiSpam = require('./handlers/antispam');
  const siteMap = require('./handlers/sitemap');
  app.get('/admin/teach/comments/:comment/:label', antiSpam.router);
  app.get('/sitemap.xml', siteMap.router);

  pushHandler.configure(webpush, frontLiveRecordConfig);

  var sendOnlineCount = function() {
    models
        .User
        .count({online: true})
        .then(function(count) {
              io.volatile.emit('connections', count || 0);
            }
        )
        .catch(errorHandler);
  };

      // declare io handling
      io
          .on('connection', function(socket) {

                threadConnections++;
                console.log('Number of connections', threadConnections);
                // load categories
                lrCategories(socket);
                // todo: take it into module
                loginHandler(socket, errorHandler);
                topics.socketHandler(socket, errorHandler);
                userHandler(socket, io, errorHandler);

                var uploader = new SocketIOFileUpload();
                uploader.dir = filesUploadDirectory;

                uploadHandler(socket,
                    uploader,
                    filesUploadDirectory,
                    filesPublicDirectory,
                    errorHandler
                );

                console.log('socketioJwt.authorize', socket.id);

                socket.on('disconnect', function() {
                      threadConnections--;
                      console.log('Number of connections', threadConnections);
                      sendOnlineCount();
                    }
                );

                return socketioJwt.authorize({
                      secret: process.env.npm_package_config_jwt_secret,
                      required: false, // authorization is always not required
                      timeout: 5000 // 5 seconds to send the authentication
                                    // message
                    }
                )(socket);
              }
          )
          .on('authenticated', function(socket) {
                //console.log('authenticated', socket.decoded_token._id);
                setTimeout(function() {
                      sendOnlineCount();
                    }, 1000
                );
                try {
                  if (!socket.decoded_token) {
                    return;
                  }
                  models.User
                      .findById(socket.decoded_token._id)
                      .then(function(currentUser) {
                            if (currentUser) {
                              var webUser = pick(currentUser,
                                  ['_id',
                                    'name',
                                    'email',
                                    'picture',
                                    'slug',
                                    'roles',
                                    'about',
                                    'gender',
                                    'rank',
                                    'devices',
                                    'settings'
                                  ]
                              );
                              // inform user
                              socket.emit('user', webUser);
                              socket.webUser = webUser;
                              // now have a user context and can work
                              Raven.setContext({user: webUser});
                              // handlers
                              comments(socket, io, antiSpam, webpush, errorHandler);
                              question(socket, io, errorHandler);
                              bookmarks(socket, errorHandler);
                              pushHandler.socketHandler(
                                  webpush,
                                  socket
                              );

                              models.User.update(
                                  {_id: currentUser._id},
                                  {$set: {online: true, updated: Date.now()}},
                                  function(err, res) {
                                    if (err) {
                                      return errorHandler(err);
                                    }
                                  }
                              );
                              socket.on('command', function(req) {
                                    console.log(req);
                                    if (socket.webUser &&
                                        socket.webUser.roles.indexOf('admin') > -1) {
                                      io.emit('command', req);
                                    }
                                  }
                              );
                            }
                          }
                      ).catch(function(reason) {
                        if (reason) {
                          return errorHandler(reason);
                        }
                      }
                  );

                  socket.on('disconnect', function(s) {
                        if (socket.webUser && socket.webUser._id) {
                          models.User.update({_id: socket.webUser._id},
                              {'$set': {online: false, updated: Date.now()}}
                          ).exec(function(err, other) {
                            if (err) {
                              return errorHandler(err);
                            }
                            //
                              }
                          );
                        }
                        console.log('Disconnected', s);
                      }
                  );
                }
                catch (e) {
                  Raven.captureException(e);
                }
              }
          );

      app.get('/:category/:topic', topics.expressRouter);
      app.get('*', staticHandlers.expressRouter);
    }
);

// cleanup resources correctly
death(function(signal, err) {
      if (mongooseConnection) {
        mongooseConnection.close();
      }
      if (server) {
        server.close();
      }
      if (io) {
        io.close();
      }
      console.log(signal);
      if (err) {
        console.log(err);
      }
      process.exit();
      return 0;
    }
);
