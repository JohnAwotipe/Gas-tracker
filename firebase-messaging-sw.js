importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyAjir7zq8PIzXbDZqfvpRvoWqqYd9udnTU',
    authDomain: 'gas-tracker-8e098.firebaseapp.com',
    projectId: 'gas-tracker-8e098',
    storageBucket: 'gas-tracker-8e098.firebasestorage.app',
    messagingSenderId: '265524187379',
    appId: '1:265524187379:web:d987da967ae8aadc582786'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message:', payload);

    const notification = payload.notification || {};
    const data = payload.data || {};

    const title =
        notification.title ||
        data.title ||
        'Cooking Gas Alert';

    const body =
        notification.body ||
        data.body ||
        'You have a new cooking gas reminder.';

    self.registration.showNotification(title, {
        body: body,

        icon: 'https://i.imgur.com/QzPFczP.png',
        badge: 'https://i.imgur.com/QzPFczP.png',

        data: {
            url: './tracker.html'
        }
    });
});


self.addEventListener('notificationclick', (event) => {

    event.notification.close();

    const url =
        event.notification.data?.url ||
        './tracker.html';

    event.waitUntil(

        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })

        .then((clientList) => {

            for (const client of clientList) {

                if ('focus' in client) {

                    client.navigate(url);

                    return client.focus();
                }
            }

            if (clients.openWindow) {

                return clients.openWindow(url);

            }

        })

    );

});
