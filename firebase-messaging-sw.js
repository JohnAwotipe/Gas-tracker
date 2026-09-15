importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAjir7zq8PIzXbDZqfvpRvoWqqYd9udnTU",
  authDomain: "gas-tracker-8e098.firebaseapp.com",
  projectId: "gas-tracker-8e098",
  storageBucket: "gas-tracker-8e098.firebasestorage.app",
  messagingSenderId: "265524187379",
  appId: "1:265524187379:web:d987da967ae8aadc582786"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle =
    payload.notification?.title || 'Cooking Gas Alert';

  const notificationBody =
    payload.notification?.body || 'Check your cooking gas tracker.';

  const notificationOptions = {
    body: notificationBody,

    // Cooking Gas Tracker icon
    icon: 'https://i.imgur.com/OkIJfE2.png',

    // Small notification badge
    badge: 'https://i.imgur.com/OkIJfE2.png',

    // Keep the notification visible
    requireInteraction: false
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
