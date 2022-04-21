# angular-web-notification

[![NPM Version](http://img.shields.io/npm/v/angular-web-notification.svg?style=flat)](https://www.npmjs.org/package/angular-web-notification) [![Build Status](https://travis-ci.org/sagiegurari/angular-web-notification.svg)](http://travis-ci.org/sagiegurari/angular-web-notification) [![Coverage Status](https://coveralls.io/repos/sagiegurari/angular-web-notification/badge.svg)](https://coveralls.io/r/sagiegurari/angular-web-notification) [![Known Vulnerabilities](https://snyk.io/test/github/sagiegurari/angular-web-notification/badge.svg)](https://snyk.io/test/github/sagiegurari/angular-web-notification) [![Inline docs](http://inch-ci.org/github/sagiegurari/angular-web-notification.svg?branch=master)](http://inch-ci.org/github/sagiegurari/angular-web-notification) [![License](https://img.shields.io/npm/l/angular-web-notification.svg?style=flat)](https://github.com/sagiegurari/angular-web-notification/blob/master/LICENSE)

> Web Notifications AngularJS Service

* [Overview](#overview)
* [Demo](https://sagiegurari.github.io/angular-web-notification/)
* [Usage](#usage)
* [Installation](#installation)
* [Limitations](#limitations)
* [API Documentation](docs/api.md)
* [Contributing](.github/CONTRIBUTING.md)
* [Release History](#history)
* [License](#license)

<a name="overview"></a>
## Overview
The angular-web-notification is an angular service wrapper for the web notifications API.

It is using the [simple-web-notification](https://github.com/sagiegurari/simple-web-notification) library which provides a simple and easy notification API which works across browsers and provides automatic permission handling.

See [W3 Specification](https://dvcs.w3.org/hg/notifications/raw-file/tip/Overview.html) and [simple-web-notification](https://github.com/sagiegurari/simple-web-notification) for more information.

### Angular 2 and Up
For angular 2 and above, it is recommanded to use the  [simple-web-notification](https://github.com/sagiegurari/simple-web-notification) library directly.<br>
It provides the same API and it is not dependend on angular.

## Demo
[Live Demo](https://sagiegurari.github.io/angular-web-notification/)

<a name="usage"></a>
## Usage
In order to use the angular service you first must add the relevant dependencies:

```html
<script type="text/javascript" src="angular.js"></script>
<script type="text/javascript" src="simple-web-notification/web-notification.js"></script>
<script type="text/javascript" src="angular-web-notification.js"></script>
```

Next you must define it as a dependency in your main angular module as follows:

```js
angular.module('exampleApp', [
    'angular-web-notification'
]);
```

Now you can inject and use the service into your modules (directives/services/...), for example:

```js
angular.module('exampleApp').directive('showButton', ['webNotification', function (webNotification) {
return {
    ...
    link: function (scope, element) {
        element.on('click', function onClick() {
            webNotification.showNotification('Example Notification', {
                body: 'Notification Text...',
                icon: 'my-icon.ico',
                onClick: function onNotificationClicked() {
                    console.log('Notification clicked.');
                },
                autoClose: 4000 //auto close the notification after 4 seconds (you can manually close it via hide function)
            }, function onShow(error, hide) {
                if (error) {
                    window.alert('Unable to show notification: ' + error.message);
                } else {
                    console.log('Notification Shown.');

                    setTimeout(function hideNotification() {
                        console.log('Hiding notification....');
                        hide(); //manually close the notification (you can skip this if you use the autoClose option)
                    }, 5000);
                }
            });
        });
    }
};
}]);
```

In case you wish to use service worker web notifications, you must provide the serviceWorkerRegistration in the options as follows:

````js
//Get the service worker registeration object at the startup of the application.
//This is an aysnc operation so you should not try to use it before the promise is finished.
var serviceWorkerRegistration;
navigator.serviceWorker.register('service-worker.js').then(function(registration) {
    serviceWorkerRegistration = registration;
});

//when setting on even handlers in different areas of the application, use that registration object instance (must be done after the registration is available)
element.on('click', function onClick() {
    webNotification.showNotification('Example Notification', {
        serviceWorkerRegistration: serviceWorkerRegistration,
        body: 'Notification Text...',
        icon: 'my-icon.ico',
        actions: [
            {
                action: 'Start',
                title: 'Start'
            },
            {
                action: 'Stop',
                title: 'Stop'
            }
        ],
        autoClose: 4000 //auto close the notification after 4 seconds (you can manually close it via hide function)
    }, function onShow(error, hide) {
        if (error) {
            window.alert('Unable to show notification: ' + error.message);
        } else {
            console.log('Notification Shown.');

            setTimeout(function hideNotification() {
                console.log('Hiding notification....');
                hide(); //manually close the notification (you can skip this if you use the autoClose option)
            }, 5000);
        }
    });
});
````

<a name="installation"></a>
## Installation
Run npm install in your project as follows:

```sh
npm install --save angular-web-notification
```

Or if you are using bower, you can install it as follows:

```sh
bower install angular-web-notification --save
```

<a name="limitations"></a>
## Limitations
The web notifications API is not fully supported in all browsers.

Please see [supported browser versions](http://caniuse.com/#feat=notifications) for more information on the official spec support.

## API Documentation
See full docs at: [API Docs](docs/api.md)

## Contributing
See [contributing guide](.github/CONTRIBUTING.md)

<a name="history"></a>
## Release History

| Date        | Version | Description |
| ----------- | ------- | ----------- |
| 2019-02-08  | v1.2.31 | Maintenance |
| 2017-08-25  | v1.2.24 | Document support of service worker web notifications |
| 2017-01-22  | v1.2.0  | Split the internal web notification API into a new project: simple-web-notification |
| 2016-11-23  | v1.0.19 | Use forked version of html5-desktop-notifications in order to resolve few issues |
| 2016-11-04  | v1.0.16 | Upgrading to html5-desktop-notifications 3.0.0 |
| 2016-09-10  | v1.0.6  | Default to website favicon.ico if icon not provided in options |
| 2016-09-07  | v1.0.4  | Callback is now optional |
| 2016-06-14  | v0.0.78 | Published via NPM (in addition to bower) |
| 2016-03-08  | v0.0.65 | Added webNotification.permissionGranted attribute |
| 2015-09-26  | v0.0.31 | Update bower dependencies |
| 2015-09-26  | v0.0.30 | Added 'onClick' option to enable adding onclick event handler for the notification |
| 2015-08-16  | v0.0.22 | uglify fix |
| 2015-02-16  | v0.0.7  | Automatic unit tests via karma |
| 2015-02-05  | v0.0.5  | Doc changes |
| 2014-12-09  | v0.0.3  | API now enables/disables the capability to automatically request for permissions needed to display the notification. |
| 2014-12-08  | v0.0.2  | Initial release |

<a name="license"></a>
## License
Developed by Sagie Gur-Ari and licensed under the Apache 2 open source license.
