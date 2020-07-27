const errorHandler = require('./handlers/errors');

//process.on('uncaughtException', errorHandler);
//process.on('UnhandledPromiseRejectionWarning', errorHandler);
//process.on('DeprecationWarning', errorHandler);

const death = require('death');
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const socketioJwt = require('socketio-jwt');
const pick = require('object.pick');
const page = require('./handlers/page');
const question = require('./handlers/question');
const comments = require('./handlers/comments');
const loginHandler = require('./handlers/login');
const categoriesHandler = require('./handlers/categories');
const bookmarks = require('./handlers/bookmarks');
const topics = require('./handlers/topics');
const userHandlers = require('./handlers/users');
const uploadHandler = require('./handlers/upload');
const pushHandler = require('./handlers/push');
const staticHandlers = require('./handlers/static');
const fs = require('fs');
const webpush = require('web-push');
const chalk = require('chalk');
const passport = require('passport');
const passportHandler = require('./handlers/passport');
//
// Initialize app config
let frontLiveRecordConfig = {
  gaId: process.env.ANALYTICS_GA_ID,
  facebookClientId: process.env.FACEBOOK_CLIENT_ID,
  twitterClientId: process.env.TWITTER_CLIENT_ID,
  windowsLiveClientId: process.env.WINDOWSLIVE_CLIENT_ID,
  vkontakteClientId: process.env.VKONTAKTE_CLIENT_ID,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  version: '1'
};

//
const app = express();
const SocketIOFileUploadSrv = require('socketio-file-upload');

//
const Raven = require('raven');

//
app.set('frontLiveRecordConfig', frontLiveRecordConfig);
//
const server = require('http').Server(app);
const io = require('socket.io')(server);

const reloadConfiguration = () => {
  frontLiveRecordConfig.version = fs
      .readFileSync(
          __dirname + '/public/version.txt', 'utf8'
      )
      .trim();
  console.log(chalk.grey('Configuration reloaded'));
  io.emit('command', 'window.location.reload(true);');
};
//
if (process.env.NODE_ENV && 'development' === process.env.NODE_ENV) {
  mongoose.set('debug', true);
} else {
  // use Raven to capture errors on production
  if (process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
    app.use(Raven.requestHandler());
  }
}

//
reloadConfiguration();

//
server.listen(
    process.env.SERVER_PORT,
    process.env.SERVER_HOST
);
//
console.log(
    chalk.green('Listening on ') +
    chalk.green.underline(
        'http://' + process.env.SERVER_HOST + ':' +
        process.env.SERVER_PORT
    )
);

const filesPublicDirectory = process.env.FILES_DIR + '/';
const filesUploadDirectory = __dirname + '/public/' + filesPublicDirectory;
// configure serializers
passport.serializeUser(function(user, done) {
  console.log(chalk.magenta('serializeUser'), user);
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  console.log(chalk.magenta('deserializeUser'), obj);
  done(null, obj);
});
// setup express session
app.use(session({
  secret: process.env.SECURITY_SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
// hook passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', staticHandlers.expressRouter);
app.use('/', express.static(__dirname + '/public'));
app.use(SocketIOFileUploadSrv.router);

// fixes bugs with promises in mongoose
mongoose.Promise = global.Promise;

mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
    );

let mongooseConnection = mongoose.connection;
mongooseConnection.on(
    'error',
    console.error.bind(console, chalk.red('connection error:'))
);

let threadConnections = 0;

mongooseConnection.once('open', function() {
      // we're connected!
      let models = require('./schema');

      //app.use(passport.session());
      passportHandler(passport, app);

      const antiSpam = require('./handlers/antispam');
      const siteMap = require('./handlers/sitemap');
      const setup = require('./handlers/setup');
      app.get('/admin/teach/comments/:comment/:label', antiSpam.router);
      app.get('/sitemap.xml', siteMap.router);

      pushHandler.configure(webpush, frontLiveRecordConfig);
      setup.configure(frontLiveRecordConfig);

      models
      .Parameters
      .find({name: {$nin: ['vapidKeys']}})
      .then((docs) => {
        docs.forEach((item) => {
          'use strict';
          frontLiveRecordConfig[item.name] = item.value;
        });
      })
      .catch(errorHandler);
      let sendOnlineCount = function() {
        models
        .User
        .count({online: true, deleted: false})
        .then(function(count) {
              io.volatile.emit('connections', count || 0);
            })
        .catch(errorHandler);
      };

      // declare io handling
      io.on('connection', function(socket) {

        threadConnections++;
        console.log(
            chalk.blue('Number of connections'), threadConnections);
        // load categories
        categoriesHandler(socket);
        // todo: take it into module
        loginHandler.socketHandler(socket);
        topics.socketHandler(socket, errorHandler);
        userHandlers.socketHandler(socket, io, errorHandler);
        page.socketHandler(socket, errorHandler);

        let uploader = new SocketIOFileUploadSrv();
        uploader.dir = filesUploadDirectory;

        uploadHandler(
            socket,
            uploader,
            filesUploadDirectory,
            filesPublicDirectory,
            errorHandler
        );

        console.log(chalk.yellow('socketioJwt.authorize', socket.id));

        socket.on('disconnect', function() {
              threadConnections--;
              console.log(chalk.blue('Number of connections'), threadConnections);
              sendOnlineCount();
            }
        );

        return socketioJwt.authorize({
          secret: process.env.JWT_SECRET,
          required: false, // authorization is always not required
          timeout: 5000    // 5 seconds to send the authentication message
        })(socket);
      }).on('authenticated', function(socket) {
        //console.log('authenticated', socket.decoded_token._id);
        setTimeout(function() {
              sendOnlineCount();
            }, 1000
        );
        try {
          if (!socket.decoded_token) {
            return;
          }
          models
          .User
          .findById(socket.decoded_token._id)
          .then(function(currentUser) {
                    if (currentUser) {
                      let webUser = pick(currentUser.toObject(),
                          [
                            '_id',
                            'name',
                            'email',
                            'picture',
                            'slug',
                            'roles',
                            'about',
                            'gender',
                            'rank',
                            'devices',
                            'online',
                            'settings'
                          ]
                      );
                      // inform user
                      socket.emit('user', webUser);
                      socket.join('user:' + webUser._id);
                      socket.webUser = webUser;
                      // now have a user context and can work
                      if (process.env.SENTRY_DSN) {
                        Raven.setContext({user: webUser});
                      }
                      // handlers
                      comments(socket, io, antiSpam, webpush);
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
                            socket.webUser.roles &&
                            socket.webUser.roles.indexOf('admin') > -1) {
                          io.emit('command', req);
                        }
                      });
                    }
                  }
              )
          .catch(errorHandler);

          [
            'video-init',
            'video-offer',
            'video-answer',
            'video-hangup',
            'new-ice-candidate'
          ].map(function(eventName) {
            socket.on(eventName, function(req) {
              console.log(chalk.red(eventName), req);
              if (req.topic) {
                let roomName = 'topic:' + req.topic;
                if (eventName === 'video-init') {
                  //
                  io.of('/').in(roomName).clients(function(error, clients) {
                    if (error) throw error;
                    console.log('video-init-pc', clients);
                    const sp = clients.indexOf(socket.id);
                    clients.splice(sp, 1);
                    clients.unshift(socket.id); // call initiator always will be first
                    console.log('video-init-pc-after-unshift', clients);
                    socket.emit('video-init-pc', clients);
                    socket.broadcast.to(roomName).emit('video-init-pc', clients);
                  });
                }
                socket.broadcast.to(roomName).emit(eventName, req);
              }
            });
          });

          socket.on('disconnect', function(s) {
                let onlineUserId = null, userIsStillOnline = false;
                if (socket.webUser && socket.webUser._id) {
                  onlineUserId = socket.webUser._id;
                }
                for (let onlineSocketId in io.of('/').connected) {
                  if (io.of('/').connected.hasOwnProperty(onlineSocketId)) {
                    let onlineSocket = io.of('/').connected[onlineSocketId];
                    if (onlineSocket.webUser &&
                        onlineSocket.webUser._id &&
                        onlineSocket.webUser._id.toString() == onlineUserId) {
                      userIsStillOnline = true;
                    }
                  }
                }
                if (onlineUserId) {
                  models.User.update(
                      {_id: onlineUserId},
                      {'$set': {online: userIsStillOnline, updated: Date.now()}},
                      {},
                      function(err, done) {
                        console.log(err, done);
                      }
                  );
                }
              }
          );
        }
        catch (e) {
          if (process.env.SENTRY_DSN) {
            Raven.captureException(e);
          } else {
            console.log(chalk.red('Error'), e);
          }
        }
      });
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
      console.log('Got signal', signal);
      if (err) {
        console.log('Error', err);
      }
      console.log('Shutting down...');
      process.exit();
      return 0;
    }
);
