/**
 * Created by zoonman on 12/13/16.
 */

var port;

self.addEventListener('push', function(event) {

      console.log('Service worker got event', event)
      try {
        var obj = event.data.json();
        if (obj.action === 'subscribe' || obj.action === 'unsubscribe') {
          fireNotification(obj, event);
          port.postMessage(obj);
        } else if (obj.action === 'init' || obj.action === 'chatMsg') {
          port.postMessage(obj);
        }
      }
      catch (e) {
        console.log('push listener', e);
      }
    }
);

self.onmessage = function(e) {
  console.log('self.onmessage', e);
  port = e.ports[0];
};

function fireNotification(obj, event) {
  var icon = '/dist/i/logo.png';
  var tag = 'push';

  var notificationOptions = {
    body: obj.body,
    icon: icon,
    tag: obj._id,
    actions: [{
      title: 'Hello',
      action: 'View',
      icon: '/dist/i/logo.png'
    }],
    data: {
      url: obj.link
    }
  };

  if (obj.image) {
    notificationOptions.image = obj.image;
    notificationOptions.icon = obj.image;
  }

  event.waitUntil(
      self.registration.showNotification(obj.title, notificationOptions)
  );
}

function getHostName(str) {
  return str.split('/', 3)[2];
}

self.addEventListener('notificationclick', function(event) {
      console.log('On notification click: ', event.notification.tag);
      event.notification.close();

      // This looks to see if the current is already open and
      // focuses if it is
      event
          .waitUntil(
              clients
                  .matchAll({type: 'window'})
                  .then(function(clientList) {
                    console.log('clientList', clientList);
                    var newUrl = event.notification.data.url || '/';

                    for (var i = 0; i < clientList.length; i++) {
                      var client = clientList[i];
                      // move focus to client's tab
                      if (getHostName(client.url) == getHostName(newUrl) &&
                          'focus' in client) {
                        //
                        client.postMessage({
                          action: 'navigate',
                          url: newUrl
                        });
                        return client.focus();
                      }
                    }
                    if (clients.openWindow) {
                      return clients.openWindow(newUrl);
                    }

                  }));
    }
);
