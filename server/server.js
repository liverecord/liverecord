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
const sharp = require("sharp");
const path = require('path');
const xtend = require('xtend');
const fs = require('fs');
const webpush = require('web-push');
//
const app = express();
const SocketIOFileUpload = require("socketio-file-upload");

process.on('uncaughtException', console.error);
//
const Raven = require('raven');
Raven.config(process.env.npm_package_config_sentry_dsn).install();
app.use(Raven.requestHandler());
//
const server = require('http').Server(app);
const io = require('socket.io')(server);
//
server.listen(process.env.npm_package_config_server_port, process.env.npm_package_config_server_host);
//
console.log('Listening on http://'+ process.env.npm_package_config_server_host +':' + process.env.npm_package_config_server_port);


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

const filesPublicDirectory = process.env.npm_package_config_files_dir + '/';
const filesUploadDirectory = __dirname + '/public/' + filesPublicDirectory;



app.use('/', express.static(__dirname + '/public'));
app.use(SocketIOFileUpload.router);


// fixes bugs with promises in mongoose
mongoose.Promise = global.Promise;

function errorHandler() {
    console.trace(arguments[0]);
    console.dir(arguments, {colors: true});
}

const vapidFilePath = __dirname + '/'+ process.env.npm_package_config_webpush_vapid_keys_path;
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
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
webpush.setGCMAPIKey(process.env.npm_package_config_webpush_gcm_api_key);

mongoose.connect(process.env.npm_package_config_mongodb_uri);

var mongooseConnection = mongoose.connection;
mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
    // we're connected!
    var models = require('./schema');
    const antiSpam = require('./handlers/antispam');
    const siteMap = require('./handlers/sitemap');
    app.get('/admin/teach/comments/:comment/:label', antiSpam.router);
    app.get('/sitemap.xml', siteMap.router);

    // declare io handling
    io
    .on('connection', function(socket) {
        // load categories
        lrCategories(socket);
        // todo: take it into module
        loginHandler(socket, errorHandler);
        topics.socketHandler(socket, errorHandler);
        userHandler(socket, io, errorHandler);

        var uploader = new SocketIOFileUpload();
        uploader.dir = filesUploadDirectory;

        uploadHandler(socket, uploader, filesUploadDirectory, filesPublicDirectory, errorHandler);

        console.log('socketioJwt.authorize');
        return socketioJwt.authorize({
            secret: process.env.npm_package_config_jwt_secret,
            required: false, // authorization is always not required
            timeout: 5000 // 5 seconds to send the authentication message
        })(socket);
    })
    .on('authenticated', function (socket) {
        //console.log('authenticated', socket.decoded_token._id);
        try {
            models.User.findById(socket.decoded_token._id, function (err, currentUser) {
                if (currentUser) {
                    var webUser = pick(currentUser, ['_id', 'name', 'email', 'picture', 'slug', 'roles',  'settings']);
                    // inform user
                    socket.emit('user', webUser);
                    socket.webUser = webUser;
                    // now have a user context and can work
                    Raven.setContext({user: webUser});
                    // handlers
                    comments(socket, io, antiSpam, errorHandler);
                    question(socket, io, errorHandler);
                    bookmarks(socket, errorHandler);
                    models.User.update(
                        {_id: currentUser._id},
                        {$set: {online: true, updated: Date.now()}},
                        function(err, res) {
                            if (err) return handleError(err);
                        }
                    );
                }
            });
            socket.on('push', function(pushObj, sc) {

                console.log('pushObj', pushObj);

                const pushSubscription = {
                    endpoint: pushObj.subscription.endpoint,
                    keys: {
                        p256dh: pushObj.subscription.p256dh,
                        auth: pushObj.subscription.auth
                    }
                };

                const payload = JSON.stringify({
                    action: 'subscribe',
                    name: 'KOOL'
                });

                setTimeout(function() {
                    webpush.sendNotification(
                        pushSubscription,
                        payload
                    );
                }, 10000);


                sc({success: true});
            });

            socket.on('disconnect', function(s) {
                if (socket.webUser && socket.webUser._id) {
                    models.User.update({_id: socket.webUser._id}, {'$set': {online: false, updated: Date.now()}}).exec();
                }
                console.log('Disconnected', s);
            });
        } catch (e) {
            Raven.captureException(e);
        }
    });



    app.get('/:category/:topic', topics.expressRouter);
    app.get('*', function (req, res) {
        fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, indexData) {
            if (err) return errorHandler(err);
            indexData = indexData.replace('<title></title>', '<title>LinuxQuestions - живой форум про Линукс и свободные программы</title>');
            res.writeHead(200, {
                "Content-Type": "text/html;encoding: utf-8"
            });
            res.write(indexData);
            res.end();

        });
    });
});

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
});
