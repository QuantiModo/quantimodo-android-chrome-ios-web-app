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
console.log("Service worker importing libraries from " + libUrl);
importScripts(libUrl+'firebase/firebase-app.js');
importScripts(libUrl+'firebase/firebase-messaging.js');
importScripts(libUrl+'localforage/dist/localforage.js');
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
var messaging = firebase.messaging();
function showNotification(pushData) {
    //qm.api.postToQuantiModo(pushData, "pushData:"+JSON.stringify(pushData));
    console.log("push data: ", pushData);
    if(!pushData.title && pushData.data) {
        console.log("Weird push format");
        pushData = pushData.data;
    }
    qm.appsManager.getAppSettingsLocallyOrFromApi(function (appSettings) {
        var notificationOptions = {
            actions: [],
            requireInteraction: true,
            body: "Click here for more options",
            data: JSON.parse(JSON.stringify(pushData)),
            //dir: NotificationDirection,
            icon: pushData.icon || appSettings.additionalSettings.appImages.appIcon,
            //lang: string,
            tag: pushData.title
        };
        try {
            qm.allActions = JSON.parse(pushData.actions);
        } catch (error) {
            console.error("could not parse actions in pushData: ", pushData);
        }
        for (var i = 0; i < qm.allActions.length; i++) {
            notificationOptions.actions[i] = {
                action: qm.allActions[i].callback,
                title: qm.allActions[i].longTitle
            };
        }
        var maxVisibleActions = Notification.maxActions;
        if (maxVisibleActions < 4) {
            console.log("This notification will only display " + maxVisibleActions   +" actions.");
        } else {
            console.log("This notification can display up to " + maxVisibleActions +" actions");
        }
        //event.waitUntil(self.registration.showNotification(title, pushData));
        console.log("Notification options", notificationOptions);
        if(!pushData.title || pushData.title === "undefined"){
            qmLog.error("pushData.title undefined! pushData: "+JSON.stringify(pushData) + " notificationOptions: "+ JSON.stringify(notificationOptions));
        }
        if(pushData.variableName){
            pushData.title = pushData.variableName; // Exclude "Track" because it gets cut off
            pushData.body = "Record " + pushData.variableName + " or click here for more options";
        }
        self.registration.showNotification(pushData.title, notificationOptions);
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
    showNotification(payload);
});
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    //console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
    try {
        var pushData = event.data.json();
        pushData = pushData.data;
        showNotification(pushData);
    } catch (error) {
        qmLog.error("Could not show push notification because: " + error);
    }
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
    if(event.action === ""){
        qmLog.error("No event action provided! event is: ", null, event);
    }
    if (event.action.indexOf("https://") === -1 && runFunction(event.action, event.notification.data)) {return;}
    var basePath = '/ionic/Modo/www/index.html#/app/';
    var urlPathToOpen = basePath + 'reminders-inbox';
    if(event.action && event.action.indexOf("https://") !== -1){
        event.action = qm.stringHelper.replaceAll(event.action, '/src/', '/www/');
        var route = qm.stringHelper.getStringAfter(event.action, basePath);
        urlPathToOpen = basePath + route;
    }
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            var currentlyOpenUrl = client.url;
            console.log(currentlyOpenUrl + " is open already");
            if(currentlyOpenUrl.indexOf(urlPathToOpen) !== -1){
                if ('focus' in client) {
                    console.log("Focusing " + currentlyOpenUrl);
                    return client.focus();
                }
            }
        }
        if (clients.openWindow) {
            console.log("Opening new " + urlPathToOpen + " window");
            return clients.openWindow(urlPathToOpen);
        } else {
            console.error("Can't open windows!")
        }

    }));
});
