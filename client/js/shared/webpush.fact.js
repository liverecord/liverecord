/**
 * Created by zoonman on 12/16/16.
 */
app.factory('wpf', function($rootScope, $localStorage, $location, $route, socket) {

      var isPushEnabled = false;
      var useNotifications = false;
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
                      // The user denied the notification permission
                      // we need to display in-app notification
                      console.log('Permission for Notifications was denied');
                      $rootScope.pushNotificationDenied = true;
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
      }

      function unsubscribe() {
        navigator.serviceWorker.ready.then(function(reg) {
              // To unsubscribe from push messaging, you need get the
              // subcription object, which you can call unsubscribe() on.
              reg.pushManager.getSubscription().then(
                  function(subscription) {
                    // Check we have a subscription to unsubscribe
                    if (!subscription) {
                      isPushEnabled = false;
                      return;
                    }
                    socket.emit('push', {
                          statusType: 'unsubscribed',
                          subscription: convertSubscription(subscription)
                        }
                    );
                    // We have a subcription, so call unsubscribe on it
                    subscription.unsubscribe().then(function(successful) {
                      isPushEnabled = false;
                    }).catch(function(e) {
                      console.log('Unsubscription error: ', e);
                    });
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
                    if (!subscription) {
                      console.log('Not yet subscribed to Push');
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
                  })
                  .catch(function(err) {
                        console.log('Error during getSubscription()', err);
                      }
                  );

              // set up a message channel to communicate with the SW
              var channel = new MessageChannel();
              channel.port1.onmessage = function(e) {
                console.log('Service worker sent event to frontend', e);
                if (e.data.link) {
                  // navigate to this url
                  $location.url(e.data.link);
                }
              };
              // send hello to server worker
              var mySW = reg.active;
              mySW.postMessage('hello', [channel.port2]);
            }
        );
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function(reg) {
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
          unsubscribe();
        }
      };
    }
);
