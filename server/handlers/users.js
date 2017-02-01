/**
 * Created by zoonman on 11/19/16.
 */

const models = require('../schema');
const User = models.User;
const Topic = models.Topic;
const Comment = models.Comment;
const xtend = require('xtend');
const pick = require('object.pick');
const async = require('async');
const validator = require('validator');
const pw = require('credential')();
const md5 = require('md5');
const purify = require('./purify');
const mailer = require('./mailer');

// обработчик данных о пользователе
function userHandler(socket, io, errorHandler) {
  // когда мы получаем запрос на информацию о пользователе из веб-сокета
  socket.on('user', function(userRequest, fn) {
        // fn - функция, которая будет транспортировать данные через веб-сокет
        // клиенту назад

        // расширяем его, чтобы избежать проблемы с непереданным параметром
        userRequest = xtend({
          'slug': ''
        }, userRequest
        );
        // ищем пользователя по слагу
        User
            .findOne({slug: userRequest.slug})
            .then(function(foundUser) {
              if (foundUser) {
                // отбираем только необходимые поля (надо было с проекцией
                // заморочиться)
                var webUser = pick(foundUser,
                    [
                      '_id', 'name', 'email', 'picture', 'slug',
                      'online', 'rank', 'totals'
                    ]
                );
                Topic.find({'user': foundUser._id, deleted: false, spam: false})
                    .limit(100)
                    .populate([{path: 'category'}])
                    .then(function(list) {
                      webUser.details = {topicList: list || []};
                      fn(webUser);
                      foundUser.refreshRank();
                    });
          } else {
            fn({});
          }
        });
      }
  );
  socket.on('user.validate', function(userRequest, socketCallback) {
    'use strict';
    userRequest = xtend({
          'email': '',
          'slug': ''
        }, userRequest
    );
    userRequest.slug = purify(userRequest.slug, true);
    userRequest.email = purify(userRequest.email, true);

    async.parallel({
      email: function(callback) {
        User.count(
            {_id: {$ne: socket.webUser._id}, email: userRequest.email},
            function(err, count) {
              if (err) {
                errorHandler(err);
              }
              callback(null, count || 0);
            }
        );
      },
      slug: function(callback) {
        User.count(
            {_id: {$ne: socket.webUser._id}, slug: userRequest.slug},
            function(err, count) {
              if (err) {
                errorHandler(err);
              }
              callback(null, count || 0);
            }
        );
      }
    }, function(err, info) {
      socketCallback(info);
    });

  });

  socket.on('user.update', function(userRequest, socketCallback) {

        userRequest = xtend({
          'name': '',
          'email': '',
          settings: {
            notifications: {
              email: true
            }
          }
        }, userRequest
        );
        userRequest.name = purify(userRequest.name, true);
        userRequest.email = purify(userRequest.email, true);
        userRequest.picture = purify(userRequest.picture, true);

        var updateData = {
          name: userRequest.name
        };
        if (validator.isEmail(userRequest.email)) {
          updateData['email'] = userRequest.email;
        } else {
          socketCallback({success: false, error: 'invalid_email'});
        }

        if (validator.isURL(userRequest.picture)) {
          updateData['picture'] = userRequest.picture;
        } else {
          socketCallback({success: false, error: 'picture_is_bad'});
        }

        updateData['settings.notifications.email'] = userRequest
            .settings.notifications.email;

        if (userRequest.email === socket.webUser.email) {
          // the same user
          User.update({_id: socket.webUser._id}, updateData)
              .then(function() {
                socketCallback({success: true});
                socket.webUser.name = updateData.name;
                socket.webUser.picture = updateData.picture;
              }
          );
        } else {
          // email needs validation

          User.findOne({email: userRequest.email})
              .then(function(foundUser) {
                if (foundUser._id === socket.webUser._id) {

                  User.update({_id: socket.webUser._id}, updateData)
                      .then(function() {
                        socketCallback({success: true});
                        socket.webUser.picture = updateData.picture;
                        socket.webUser.name = updateData.name;
                      }
                  );

                } else {
                  socketCallback({success: false, error: 'not_found'});
                }

              }
          ).catch(function(notFound) {
                socketCallback({success: false, error: 'not_found'});
              }
          );

        }

      }
  );

  socket.on('user.password.restore', function(userRequest, socketCallback) {
        userRequest = xtend({
          'email': ''
        }, userRequest
        );
        User.findOne({email: userRequest.email})
            .then(function(foundUser) {
              const ranges = [[48, 57], [65, 90], [97, 122]];

              function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
              }

              var newPassword = '';
              for (
                  var i = 0;
                  i < process.env.npm_package_config_security_restored_password_length;
                  i++) {
                var range = getRandomIntInclusive(0, ranges.length - 1);
                newPassword = newPassword +
                    String.fromCharCode(
                    getRandomIntInclusive(ranges[range][0], ranges[range][1])
                );
              }
              pw.hash(newPassword, function(err, pwHash) {
                    if (err) {
                      socketCallback({
                            success: false,
                            error: 'users_hash_cannot_be_created'
                          }
                      );
                      handleError(err);
                    } else {
                      foundUser.pw = JSON.parse(pwHash);
                      console.log(pwHash);
                      foundUser.save(function(err, savedUser) {
                            if (err) {
                              socketCallback({
                                    success: false,
                                    error: 'user_cannot_be_saved'
                                  }
                              );
                              handleError(err);
                            } else {
                              // create reusable transporter object using the
                              // default SMTP transport
                              var transporter = nodemailer.createTransport(
                                  process.env.npm_package_config_email_transport //'smtps://user%40gmail.com:pass@smtp.gmail.com'
                              );

                              //transporter.tls.rejectUnauthorized = false;

                              // setup e-mail data with unicode symbols
                              var mailOptions = {
                                from: process.env.npm_package_config_email_sender, // sender address
                                to: foundUser.name + ' <' + foundUser.email + '>', // list of receivers
                                subject: 'Восстановление пароля', // Subject
                                                                  // line
                                text: 'Новый пароль: ' + newPassword + '', // plaintext
                                                                           // body
                                html: '<p>Новый пароль: <kbd>' + newPassword + '</kbd></p>' // html body
                              };
                              // send mail with defined transport object
                              mailer(mailOptions, function(error, info) {
                                    if (error) {
                                      socketCallback({
                                            success: false,
                                            error: 'email_send_failed'
                                          }
                                      );

                                      return errorHandler(error);
                                    }
                                    console.log('Message sent: ' + info.response);
                                    socketCallback({success: true});

                                  }
                              );
                            }
                          }
                      );
                    }
                  }
              );
            }
        ).catch(function(notFound) {
              socketCallback({success: false, error: notFound});
            }
        );
      }
  );

}

module.exports = userHandler;
