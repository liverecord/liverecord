/**
 * Created by zoonman on 1/21/17.
 */
const models = require('../schema');

module.exports = function(webpush, socket, errorHandler) {
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

        var remoteIp = socket.handshake.headers['x-forwarded-for'] ||
            socket.request.connection.remoteAddress;

        const device = {
          _id: pushObj.subscription.deviceId,
          ua: pushObj.subscription.ua,
          lastIp: remoteIp,
          pushSubscription: pushSubscription
        };


        if (socket.decoded_token._id) {
          console.log('upadting push', socket.decoded_token._id);
          models.User.update(
              {
                _id: socket.decoded_token._id,
                'devices._id': pushObj.subscription.deviceId
              },
              {
                $set: {
                  updated: Date.now(),
                  'devices.$': device
                }
              },
              function(err, res) {
                if (err) {
                  return errorHandler(err);
                } else {
                  console.log('res', res);
                  if (res.nModified === 0) {
                    device['pushEnabled'] = true;

                        models.User.update(
                        {
                          _id: socket.decoded_token._id
                        },
                        {
                          $set: {
                            updated: Date.now()
                          },
                          $push: {devices: device}

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

};
