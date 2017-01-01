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
const topics = require('./handlers/topics');
const userHandler = require('./handlers/users');
const SocketIOFileUpload = require("socketio-file-upload");
const sharp = require("sharp");
const md5File = require('md5-file');
const path = require('path');
var fs = require('fs');
//
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
//
server.listen(process.env.npm_package_config_server_port, process.env.npm_package_config_server_host);

console.log('Listening on http://'+ process.env.npm_package_config_server_host +':' + process.env.npm_package_config_server_port);

const filesPublicDirectory = process.env.npm_package_config_files_dir + '/';
const filesUploadDirectory = __dirname + '/public/' + filesPublicDirectory;

app.get('/', function (req, res) {
    console.log(__dirname);
    res.sendFile(__dirname + '/public/index.html');
});

app.use('/', express.static(__dirname + '/public'));
app.use(SocketIOFileUpload.router);


// fixes bugs with promises in mongoose
mongoose.Promise = global.Promise;

function errorHandler() {
    console.trace(arguments[0]);
    console.dir(arguments, {colors: true});
}

mongoose.connect(process.env.npm_package_config_mongodb_uri);

var mongooseConnection = mongoose.connection;
mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
    // we're connected!
    var models = require('./schema');
    const antiSpam = require('./handlers/antispam');
    app.get('/admin/teach/comments/:comment/:label', antiSpam.router);

    // declare io handling
    io
    .on('connection', function(socket) {
        // load categories
        lrCategories(socket);
        // todo: take it into module
        loginHandler(socket, errorHandler);
        topics(socket, errorHandler);
        userHandler(socket, io, errorHandler);

        var uploader = new SocketIOFileUpload();
        uploader.dir = filesUploadDirectory;
        uploader.listen(socket);
        uploader.on("start", function(event) {
            var extension = path.extname(event.file.name).toLowerCase().replace('.', '');

            if (process.env.npm_package_config_files_extensions_blacklist
                && process.env.npm_package_config_files_extensions_blacklist.indexOf(extension) > -1) {
                uploader.abort(event.file.id, socket);
            }
            if (process.env.npm_package_config_files_extensions_whitelist
                && process.env.npm_package_config_files_extensions_whitelist.indexOf(extension) === -1) {
                uploader.abort(event.file.id, socket);
            }
        });
        uploader.on("saved", function(event) {
            console.log(event.file.meta);
            if (event.file.success) {
                //return;
                md5File(event.file.pathName, function(err, hash) {
                    if (err) {
                        errorHandler(err);
                    } else {
                        var extension = path.extname(event.file.name).replace('.', '');
                        if (extension) {
                            function buildPath(hash) {
                                return hash.substr(0, 3);
                            }
                            //
                            if (!fs.existsSync(filesUploadDirectory + buildPath(hash))) {
                                fs.mkdirSync(filesUploadDirectory + buildPath(hash));
                            }

                            var filePath = filesUploadDirectory + buildPath(hash) + '/'  + event.file.base + '.' + extension;
                            var fileWebPath = '/' + filesPublicDirectory + buildPath(hash) + '/'  + event.file.base + '.' + extension;

                            if (event.file.meta.avatar) {

                                console.log('event.file', event.file);
                                console.log('filePath', filePath);
                                // resize
                                sharp(event.file.pathName)
                                    .resize(200, 200)
                                    .crop(sharp.strategy.entropy)
                                    .toFile(filePath, function(err, info) {
                                        if (err) {
                                            fs.unlink(event.file.pathName);
                                            return errorHandler(err)
                                        } else {
                                            socket.emit(
                                                'user.avatar',
                                                {absoluteUrl : fileWebPath}
                                            );
                                            fs.unlink(event.file.pathName);// don't care when it is done
                                        }
                                    });
                            } else {
                                fs.renameSync(event.file.pathName, filePath);
                                // save file info
                                socket.emit(
                                    'file.uploaded',
                                    {
                                        name: event.file.name,
                                        size: event.file.size,
                                        absoluteUrl : fileWebPath
                                    }
                                );
                            }
                        }
                    }
                });
            }
        });

        console.log('socketioJwt.authorize');
        return socketioJwt.authorize({
            secret: process.env.npm_package_config_jwt_secret,
            required: false, // authorization is always not required
            timeout: 5000 // 5 seconds to send the authentication message
        })(socket);
    })
    .on('authenticated', function (socket) {

        console.log('authenticated', socket.decoded_token._id);
        models.User.findById(socket.decoded_token._id, function (err, currentUser) {
            var webUser = pick(currentUser, ['_id', 'name', 'email', 'picture', 'slug', 'roles']);
            // inform user
            socket.emit('user', webUser);
            socket.webUser = webUser;
            // now have a user context and can work
        });

        comments(socket, io, antiSpam, errorHandler);

        question(socket, io);

    });

    app.get('*', function (req, res) {
        console.log(__dirname);
        res.sendFile(__dirname + '/public/index.html');
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
