/**
 * Created by zoonman on 12/16/16.
 */
app.factory('wpf', function($rootScope, $localStorage, $location, $route, socket) {

      var isPushEnabled = false;
      var useNotifications = false;

//      Notification.requestPermission();

      function convertSubscription(subscription) {
        return {
          deviceId: $localStorage.deviceId,
          ua: navigator.userAgent,
          endpoint: subscription.endpoint,
          auth: btoa(String.fromCharCode.apply(null,
              new Uint8Array(subscription.getKey('auth'))
              )
          ),
          p256dh: btoa(String.fromCharCode.apply(null,
              new Uint8Array(subscription.getKey('p256dh'))
              )
          )
        };
      }

      function urlBase64ToUint8Array(base64String) {

        console.log('vapidPublicKey', liveRecordConfig)

        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      function subscribe() {
        navigator.serviceWorker.ready.then(function(reg) {
              reg
                  .pushManager
                  .subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        urlBase64ToUint8Array(liveRecordConfig.vapidPublicKey)
                  })
                  .then(function(subscription) {
                    // The subscription was successful
                    isPushEnabled = true;
                    // Update status to subscribe current user on server,
                    // and to let other users know this user has subscribed
                    socket.emit('push', {
                          statusType: 'subscribed',
                          subscription: convertSubscription(subscription)
                        }
                    );
                  })
                  .catch(function(e) {
                        if (Notification.permission === 'denied') {
                          // The user denied the notification permission which
                          // means we failed to subscribe and the user will need
                          // to manually change the notification permission to
                          // subscribe to push messages
                          console.log('Permission for Notifications was denied');

                        } else {
                          // A problem occurred with the subscription, this can
                          // often be down to an issue or lack of the
                          // gcm_sender_id and / or gcm_user_visible_only
                          console.log('Unable to subscribe to push.', e);
                          // subBtn.disabled = false;
                          // subBtn.textContent = 'Subscribe to Push Messaging';
                        }
                      }
                  );
            }
        );
        //   }
        // });
      }

      function unsubscribe() {
        // subBtn.disabled = true;

        navigator.serviceWorker.ready.then(function(reg) {
              // To unsubscribe from push messaging, you need get the
              // subcription object, which you can call unsubscribe() on.
              reg.pushManager.getSubscription().then(
                  function(subscription) {
                    // Check we have a subscription to unsubscribe
                    if (!subscription) {
                      // No subscription object, so set the state
                      // to allow the user to subscribe to push
                      isPushEnabled = false;
                      // subBtn.disabled = false;
                      // subBtn.textContent = 'Subscribe to Push Messaging';
                      return;
                    }

                    isPushEnabled = false;

                    // setTimeout used to stop unsubscribe being called before
                    // the message has been sent to everyone to tell them that
                    // the unsubscription has occurred, including the person
                    // unsubscribing. This is a dirty hack, and I'm probably
                    // going to hell for writing this.
                    setTimeout(function() {

                          socket.emit('push', {
                                statusType: 'unsubscribed',
                                subscription: convertSubscription(subscription)
                              }
                          );

                          // We have a subcription, so call unsubscribe on it
                          subscription.unsubscribe().then(function(successful) {
                            isPushEnabled = false;
                          }).catch(function(e) {
                            // We failed to unsubscribe, this can lead to
                            // an unusual state, so may be best to remove
                            // the subscription id from your data store and
                            // inform the user that you disabled push
                            console.log('Unsubscription error: ', e);
                          });
                        }, 3000
                    );
                  }
              ).catch(function(e) {
                console.log('Error thrown while unsubscribing from ' +
                    'push messaging.', e
                );
              });
            }
        );
      }

      // Once the service worker is registered set the initial state
      function initialiseState(reg) {
        // Are Notifications supported in the service worker?
        if (!(reg.showNotification)) {
          console.log('Notifications aren\'t supported on service workers.');
          useNotifications = false;
        } else {
          useNotifications = true;
        }

        // Check the current Notification permission.
        // If its denied, it's a permanent block until the
        // user changes the permission
        if (Notification.permission === 'denied') {
          console.log('The user has blocked notifications.');
          return;
        }

        // Check if push messaging is supported
        if (!('PushManager' in window)) {
          console.log('Push messaging isn\'t supported.');
          return;
        }

        // We need the service worker registration to check for a subscription
        navigator.serviceWorker.ready.then(function(reg) {
              // Do we already have a push message subscription?
              reg.pushManager.getSubscription()
                  .then(function(subscription) {
                        // Enable any UI which subscribes / unsubscribes from
                        // push messages.

                        if (!subscription) {
                          console.log('Not yet subscribed to Push')
                          // We aren't subscribed to push, so set UI
                          // to allow the user to enable push

                          subscribe();

                          return;
                        }
                        // Set your UI to show they have subscribed for
                        // push messages
                        isPushEnabled = true;
                        socket.emit('push', {
                              statusType: 'init',
                              subscription: convertSubscription(subscription)
                            }
                        );
                      }
                  )
                  .catch(function(err) {
                        console.log('Error during getSubscription()', err);
                      }
                  );

              // set up a message channel to communicate with the SW
              var channel = new MessageChannel();
              channel.port1.onmessage = function(e) {
                console.log('Service worker sent', e);

                if (e.data.link) {
                  $location.url(e.data.link);
                }
              };
              var mySW = reg.active;
              mySW.postMessage('hello', [channel.port2]);
            }
        );
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(reg) {
          if (reg.installing) {
            console.log('Service worker installing');
          } else if (reg.waiting) {
            console.log('Service worker installed');
            reg.update();
          } else if (reg.active) {
            console.log('Service worker active');
          }
          initialiseState(reg);
        }
        );
      } else {
        console.log('Service workers aren\'t supported in this browser.');
      }

      return {
        subscribe: function(eventName, callback) {
          Notification.requestPermission();
        },
        unsubscribe: function(eventName, data, callback) {

        }
      };
    }
);
