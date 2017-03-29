/**
 * Created by zoonman on 1/21/17.
 */
const models = require('../schema');
const errorHandler = require('./errors');
const socketUtils = require('../common/socket');
const chalk = require('chalk');

function userPush(webpush, socket) {
  'use strict';

  socket.on('push', function(pushObj, sc) {

        console.log('pushObj', pushObj);

        const pushSubscription = {
          endpoint: pushObj.subscription.endpoint,
          keys: {
            p256dh: pushObj.subscription.p256dh,
            auth: pushObj.subscription.auth
          }
        };

        if (socket.decoded_token._id && pushObj.statusType) {
          console.log(chalk.bgBlue('updating push', socket.decoded_token._id));
          models.User.update(
              {
                _id: socket.decoded_token._id,
                'devices._id': pushObj.subscription.deviceId
              },
              {
                $set: {
                  updated: Date.now(),
                  'devices.$._id': pushObj.subscription.deviceId,
                  'devices.$.ua': pushObj.subscription.ua,
                  'devices.$.lastIp': socketUtils.remoteAddr(socket),
                  'devices.$.pushSubscription': pushSubscription
                }
              },
              function(err, res) {
                if (err) {
                  return errorHandler(err);
                } else {
                  console.log('res', res);
                  if (res.nModified === 0) {

                    models.User.update(
                        {
                          _id: socket.decoded_token._id
                        },
                        {
                          $set: {
                            updated: Date.now()
                          },
                          $push: {
                            devices: {
                              _id: pushObj.subscription.deviceId,
                              ua: pushObj.subscription.ua,
                              lastIp: socketUtils.remoteAddr(socket),
                              pushEnabled: true,
                              pushSubscription: pushSubscription
                            }
                          }
                        },
                        function(err, res) {
                          if (err) {
                            return errorHandler(err);
                          } else {

                          }
                        }
                    );
                  }
                }
              }
          );
        }



        sc({success: true});
      }
  );
}

function configure(webPush, frontConfig) {
  var generateAndSaveVapidKeys = function() {
    var vapidConf = {
      name: 'vapidKeys',
      value: webPush.generateVAPIDKeys()
    };
    var vapidDoc = new models.Parameters(vapidConf);
    vapidDoc.save();
    frontConfig['vapidPublicKey'] = vapidConf.value.publicKey;
    return vapidConf.value;
  };

  models.Parameters
      .findOne({name: 'vapidKeys'})
      .then(function(vapidKeyDoc) {
        var vapidKeys;
        if (vapidKeyDoc) {
          vapidKeys = vapidKeyDoc.value;
          webPush.setVapidDetails(
              'https://' + process.env.npm_package_config_server_name,
              vapidKeys.publicKey,
              vapidKeys.privateKey
          );
          frontConfig['vapidPublicKey'] = vapidKeys.publicKey;
        } else {
          generateAndSaveVapidKeys();
        }
      })
      .catch(function(reason) {
        errorHandler(reason);
        generateAndSaveVapidKeys();
      });

  if (process.env.npm_package_config_webpush_gcm_api_key) {
    webPush.setGCMAPIKey(process.env.npm_package_config_webpush_gcm_api_key);
  }
}
const pushFailureCodes = [401, 410];

function notifyUsers(webpush, foundTopic, socket, pushPayload) {
  models
      .TopicFanOut
      .find({
            topic: foundTopic._id,
            user: {$ne: socket.webUser._id}
          }
      )
      .lean()
      .populate({
            path: 'user',
            select: 'name settings devices'
          }
      )
      .then(function(topicFans) {
        topicFans.map(function(fan) {
          console.log('fan', fan);

          if (fan.user && fan.user.devices) {
            fan.user
                .devices
                .map(function(device) {
                  console.log('device', device);
                  if (device.pushEnabled) {
                    webpush
                        .sendNotification(
                            device.pushSubscription,
                            pushPayload
                        )
                        .then(function(result) {
                          console.log('Pushed', result);
                        })
                        .catch(function(reason) {
                              console.log(
                                  'Push failed', fan.user._id, device._id,
                                  'reason:', reason
                              );
                              if (reason.statusCode &&
                                  pushFailureCodes
                                      .indexOf(
                                          reason.statusCode
                                      ) > -1) {
                                models
                                    .User
                                    .update(
                                        {
                                          _id: fan.user._id,
                                        },
                                        {
                                          $pull: {
                                            'devices': {
                                              _id:
                                              device._id
                                            }
                                          }
                                        })
                                    .then(function(r) {
                                      console.log(r);
                                    })
                                    .catch(errorHandler);

                              }
                            }
                        );
                  }
                });
          }
        });
      })
      .catch(errorHandler);
}

module.exports.socketHandler = userPush;
module.exports.configure = configure;
module.exports.notifyUsers = notifyUsers;
