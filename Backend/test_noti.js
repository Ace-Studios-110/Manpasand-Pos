const admin = require('firebase-admin');
const path = require('path');
// Load the service account key JSON file
const serviceAccount = require(path.resolve(__dirname, './manpasand-1b986-firebase-adminsdk-fbsvc-e51db9912c.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace with your device’s actual registration token
const registrationToken = 'eYJjdBkyRCG7Mm09m-dOgm:APA91bE7Tr6xjbI6Cz-sG8_BthHBd8f7Sj3k5LrL3t_l7JNh-1RhKSMjFh1MkL-tT5bgg61tl0mp_jt916LFxaQn3Oz5uMflJNReRj7bpMONYNxukhLbuhg';

const message = {
  token: registrationToken,
  notification: {
    title: 'Bali Notification',
    body:  'This is a test notification from FCM!',
  },
};

admin.messaging().send(message)
  .then(response => {
    console.log('Successfully sent message:', response);
  })
  .catch(error => {
    console.error('Error sending message:', error);
  });
