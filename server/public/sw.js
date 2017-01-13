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
    } catch (e) {
        console.log(e);
    }
});

self.onmessage = function(e) {
    console.log(e);
    port = e.ports[0];
};

function fireNotification(obj, event) {
    var title = 'Subscription change';
    var body = obj.name + ' has ' + obj.action + 'd.';
    var icon = '/dist/i/logo.png';
    var tag = 'push';

    event.waitUntil(self.registration.showNotification(title, {
        body: body,
        icon: icon,
        tag: tag
    }));
}

self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        console.log('clientList', clientList)
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url == '/' && 'focus' in client)
                return client.focus();
        }
        /*if (clients.openWindow)
            return clients.openWindow('/');*/
    }));
});
