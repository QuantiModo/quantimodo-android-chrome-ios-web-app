// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
getIonicAppBaseUrl = function (){
    return (self.location.origin + self.location.pathname).replace('firebase-messaging-sw.js', '');
};
var locationObj = self.location;
var window = self;
var document = {};
var libUrl = getIonicAppBaseUrl()+'lib/';
console.log("Service worker importing libararies from " + libUrl);
importScripts(libUrl+'firebase/firebase-app.js');
importScripts(libUrl+'firebase/firebase-messaging.js');
importScripts(getIonicAppBaseUrl()+'js/qmLogger.js');
importScripts(getIonicAppBaseUrl()+'js/qmHelpers.js');
importScripts(getIonicAppBaseUrl()+'js/qmChrome.js');
var config = {
    apiKey: "AIzaSyAro7_WyPa9ymH5znQ6RQRU2CW5K46XaTg",
    authDomain: "quantimo-do.firebaseapp.com",
    databaseURL: "https://quantimo-do.firebaseio.com",
    projectId: "quantimo-do",
    storageBucket: "quantimo-do.appspot.com",
    messagingSenderId: "1052648855194"
};
console.log("firebase.initializeApp(config)");
firebase.initializeApp(config);
const messaging = firebase.messaging();
function showNotification(pushData) {
    qm.api.postToQuantiModo(pushData, "pushData:"+JSON.stringify(pushData));
    pushData.data = JSON.parse(JSON.stringify(pushData));
    console.log(pushData);
    const title = pushData.title;
    qm.allActions = JSON.parse(pushData.actions);
    for (var i = 0; i < qm.allActions.length; i++) {
        qm.allActions[i].action = qm.allActions[i].callback;
        qm.allActions[i].title = qm.allActions[i].longTitle;
    }
    pushData.actions = qm.allActions;
    pushData.body = "Click here for more options";
    pushData.requireInteraction = true;
    appsManager.getAppSettingsLocallyOrFromApi(function (appSettings) {
        //pushData.image = appSettings.additionalSettings.appImages.appIcon;
        if(!pushData.icon){
            pushData.icon = appSettings.additionalSettings.appImages.appIcon;
        }
        //event.waitUntil(self.registration.showNotification(title, pushData));
        self.registration.showNotification(title, pushData);
    })
}
/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/
// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    qm.api.postToQuantiModo(payload, 'v1/deviceTokens');
    showNotification(payload);
});
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    //console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
    var pushData = event.data.json();
    pushData = pushData.data;
    showNotification(pushData);
});
// [END background_handler]
function runFunction(name, arguments)
{
    var fn = qm.notifications.actions[name];
    if(typeof fn !== 'function'){
      console.log(name +" is not a function");
      return false;
    }
    console.log("executing" + name );
    fn.apply(qm.notifications.actions, [arguments]);
    return true;
}
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received: ' + event.action);
    event.notification.close();
    if (runFunction(event.action, event.notification.data)) {return;}
    event.waitUntil(
        clients.openWindow('https://'+ getQuantiModoClientId() +'.quantimo.do/ionic/Modo/www/index.html#/app/reminders-inbox?refresh=true')
    );
});