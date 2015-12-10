A generic app that can be easily configured to help the user track and optimize any give outcome variable.
---

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App/)

#Quick Start
1. Create your free app at [admin.quantimo.do](https://admin.quantimo.do) to get your client_id and client_secret. 
1. Run `git clone https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App`
1. `cd QuantiModo-Ionic-Template-App`
1. Install NodeJS with `sudo nvm install 0.12.6`
1. Install Ionic with `sudo npm install -g cordova ionic`
1. Install Gulp globally with `sudo npm install -g gulp`
1. Install Gulp locally with `npm install --save-dev gulp`
1. Install Gulp plugins `sudo npm install jshint gulp-jshint gulp-sass gulp-concat gulp-uglify gulp-rename --save-dev`
1. Install Bower with `npm install -g bower`
1. Run `bower install`
1. Run `npm install express`
1. Run `node app.js`
1. See project at [http://localhost:5000/](http://localhost:5000/)

#QuantiModo Ionic App

## File Structure
The main contents of the App are in the `www` folder. The structure is:
```
| Modo
|---chromeApps
|---platforms
|---plugins
|---resources
|---www
     |----callback
            |---index.html
     |----css
     |----customlib
     |----img
     |----js
           |---controllers
           |---services
           |---filters
           |---app.js
           |---config.js
     |----lib
     |----templates
     |----index.html
```

## Controllers
  Controllers are located in `www/js/controllers` directory. Each View has a separate controller, or some views share the same controller if the functionality is same.
  The main controller for the app is `appCtrl.js` whereas all the other controllers run when their views come to focus.
## Services
  Services are the Data layer, which talks to `QuantiModo API`, Provide Chart Data, provides abstractions over the API as well as provide utility functions. 
## Templates
  Templates are partial `html` files, They are separately made for each view as well as popovers with in those views.

#### Git-Structure

The repository follows `Git-Flow` pattern, that means `develop` is the main `development` branch and `feature` branches are used to add features, which are then merged back into `develop`.

The notable exceptions are the `app/[your_app_code_name_here]` branches. These are like `develop` never ending branches representing each app.

So everytime you wish to deploy your app, take for example `app/moodimodo` you should `checkout app/moodimodo` then merge `develop` into the current `HEAD` branch. This will add all the changes to the app and you will be good to go for deployment.

#### Adding a New App

1. **Git**

    To add a new app, you should choose a code name for it (anything without spaces and in lowercase letters) For example `Mind First Mood Tracker` became `mind first`.
    
    You should then create a new branch `app/[your_app_code_name_here]`. You can see other existing apps like `moodimodo` and `mind first`.

2. **apps.json**
    
    Head over to `www/js/apps.json`. Add your app to the `apps object` on line 2.
    ```
    apps : {
    “moodimodo” : “configs/moodimodo”,
    “energymodo” : “configs/energymodo”,
    “mind first” : “configs/mindfirst”,
    “[your_app_code_here]” : “configs/[your_app_code_here]”
  }
    ```
    
    also update the `defaultApp` to [your_new_app_code_name] in the same file.
    ```
    defaultApp : “[your_app_code_name_here]”,
    ```
3.  **config.js**
    
    Head over to `www/js/configs` directory. Create a new file `[your_app_code_name_here].js`.
    Then copy the contents of `www/js/configs/moodimodo.js` and paste them into your new file. This will give you the placeholder values and structure of how a config.js should look like, Then you can go forward and make appropriate changes according to your app by editing the file.

4. **private_configs**
    
    Head over to `www/private_configs` directory. Create a new file
`[your_app_code_name_here].config.js`
    Then copy the contents of `www/private_configs/sample_private.config.js`. This will give you the placeholder structure and data required by the app in the private_config file. You should replace all the values with your own values or keys with respect to the new app you are building.

5. **xmlconfigs**
    
    Head over to `xmlconfigs` directory. Create a new file `[your_app_code_name_here].xml`. Then copy the contents of `xmlconfigs/moodimodo.xml`. This will give you the boiler plate of the properties required in the xml file. You can make appropriate changes according to your app where necessary.

> After these steps your app creation is complete. Now you can edit the app in the respective files as mentioned below.


#### Editing an App

Now Editing an app would mean understanding the structure of the app a little bit, so here goes,

The current App has 3 config files:

1. xmlconfigs/appname.xml
2. www/configs/appname.js
3. www/private_keys/appname.config.js

##### **`appname.xml`**
This file is the xml file, which will be used to make your “actual” iOS App project. So the most important variables in this file are:

1. App Name
  ```
  <name>{{write_your_app_name_here}}</name>
  ```
This will be the name for your App, and will be the name of the .xcodeproj file, So remember to name your app here.

2. App Description
  ```
  <description>{{write_your_app_description_here}}</description>
  ```
3. Widget ID
  ```
  <widget id=“{{com.company.appname}}” …>…</widget>
  ```
  This is your app identifier you would generate on the Apple’s Developer portal that will identify your app uniquely on the App Store.

4. Notification Plugin
  ```
  <notificationplugin interactive=“true”>
      <button id=“repeat_mood” display=“Report Last Mood” mode=“background”></button>
      <button id=“other” display=“Other” mode=“foreground”></button>
      <button id=“sad”  display=“Sad” mode=“background”></button>
      <button id=“happy”  display=“Happy” mode=“background”></button>
      <button id=“depressed” display=“Depressed” mode=“background”></button>
      <button id=“ok” display=“OK” mode=“background”></button>
      <TwoButtonLayout first=“repeat_mood” second=“other”></TwoButtonLayout>
      <FourButtonLayout first=“sad” second=“happy” third=“ok” fourth=“depressed”>
      </FourButtonLayout>
</notificationplugin>
  ```
This is the notification plugin (for using interactive notifications in iOS) 

  You can define the `buttons`, give each of them a unique `id` and set the text as to how they will be displayed in `display` property. 
  
  You should also set the run mode when the button is clicked through the notification bar, it can run in `background` or `foreground`.
  
  In `TwoButtonLayout`, you can select which of the two buttons you want to show by providing their id’s in `first` and `second` property.
  
  In `FourButtonLayout`, you can select which of the four buttons you want to show by providing their id’s in `first`,`second`,`third` and `fourth` property.

##### **`private_configs/appname.config.js`**
As you may have copied from the sample.config.js, you would need to replace all the placeholder values (or delete the one’s you don’t use).

The most important ones to keep the app working are the `client_id` and `client_secret` for `Web`.
You can delete the other keys and their values if you aren’t using them.

> Notice that you can get the client_id and client_secret by contacting [mike@quantimo.do](mike@quantimo.do) or by 
creating an account and creating each app in the [QuantiModo Developer Portal](https://admin.quantimo.do).

##### **`configş/appname.js`**
This is the most important file for your app, where all the changes will be made to configure your app.

There are a few Important things you need to change.

**`window.config` object** 
```
window.config = {
    bugsnag:{
      notifyReleaseStages:[
      'Production',
      'Staging'
      ]
    },
    client_source_name : "MoodiModo "+getPlatform(),
    domain : 'app.quantimo.do',
    environment: "Development",
    permissions : [
      'readmeasurements', 
      'writemeasurements'
  ],
    port : '4417',
    protocol : 'https',
    shopping_cart_enabled : true,
};
```
### Explanation

`client_source_name` : Replace MoodiModo with your app name (The one you requested from hello@quantimodo.com while generating your app).

`domain` : This is the domain used for making api requests

`environment` : Can be set to `Development`, `Staging`, or `Production`, This will determine what keys to use when making api requests.

`permissions` : This is an array of permissions logging into the QuantiModo Api. 

`port` : The port number on which the server is running (if running locally).

`protocol` : (http or https) The protocol to use when requesting the api.

`shopping_cart_enabled` : true or false if you wish to keep the shopping cart buttons in postive/negative predictor lists.

**`config.appSettings` Object **

```
config.appSettings  = {
    app_name : 'EnergyModo',

    tracking_factor : 'Energy',

    storage_identifier: 'EnergyModoData*',
      
    primary_tracking_factor_details : { ... },

    tracking_factors_options_labels : [ ... ],

    tracking_factor_options : [ ... ],

    welcome_text:"Let's start off by reporting your Energy on the card below",
    
    factor_average_text:"Your average energy level is ",
    
    notification_image : "file://img/logo.png",
    
    notification_text : "Rate your Energy",
    
    conversion_dataset: { ... },
    
    conversion_dataset_reversed : { ... },
    
    intro : { ... }
};

```
### Explanation

`app_name` :  The Name of your app.

`tracking_factor` : The primary outcome variable you are tracking (like Mood or Energy etc.)

`storage_identifier` : a unique to your app string that will be prepended to any key stored in `localStorage`. (no spaces or any characters not allowed in keys)

`primary_tracking_factor_details`

```
primary_tracking_factor_details : {
   name : "Overall Energy",
   category : "Energy",
   unit : "/5",
   combinationOperation: "MEAN"
},
```

`name` : The actual tracking factor name in the QM API.
`category` : The category of the tracking factor.
`unit` :  the unit symbol for the tracking factor.
`combinationOperation` : MEAN or SUM depending upon your tracking factor.


`tracking_factors_options_labels`
```
tracking_factors_options_labels : { 
    'lowest', 
    'low', 
    'average', 
    'high', 
    'highest' 
],
```
These will be used on the charts, to represent the individual bars for the 5 different values. (replace them with values that you want to represent your bars with in the charts).

`tracking_factor_options`
```
tracking_factor_options : [
        {
            value: 'lowest',
            img: 'img/ic_1.png'
        },
        {
            value: 'low',
            img: 'img/ic_2.png'
        },
        {
            value: 'average',
            img: 'img/ic_3.png'
        },
        {
            value: 'high',
            img: 'img/ic_4.png'
        },
        {
            value: 'highest',
            img: 'img/ic_5.png'
        }
    ],
```
These are the five options (available on the Trrack page) that the users will rate. Each of the option has an `image` (that will replace the emoji) and `value` (the quantifiable value the image represents).

**Note**: Make sure the values match with the values in the `tracking_factors_options_labels`. 

`welcome_text` : The text app greets the user with when the app is opened for the first time.

`tracking_question` : The question displayed on screen when user is on the Track Screen.

`factor_average_text` : string that tells user his average tracking factor value.

`notification_image` : the logo that gets displayed with the notification in ios

`notification_text` : the text that appears in the notification on ios

`conversion_dataset`
```
conversion_dataset: {
    "1": "lowest",
    "2": "low",
    "3": "average",
    "4": "high",
    "5": "highest" 
},
```
This is the data set where the keys are the mapped with the buttons. For example, `button 1` will represent `lowest`.

`conversion_dataset_reversed`
```
conversion_dataset_reversed : {
   "lowest" : 1,
    "sad" : 2,
    "ok" : 3,
    "happy" : 4,
    "ecstatic": 5 
},
```

This is the reversed dataset, make sure you reverse the values of the `converstion_dataset`.

`intro`
```
intro : {
 "screen1" : {
     img : {
         width : '150',
         height : '150',
         url : 'img/main_icon.png'
     }
 },
 "screen2" : {
     images : {
         height : '75',
         width : '75'
     }
 },
 "screen3" : {
     img : {
         width : '140',
         height : '220',
         url : 'img/track_moods.png'
     }
 },
 "screen4" : {
     img : {
         width : '200',
         height : '150',
         url : 'img/history_page.png'
     }
 },
 "screen5" : {
     img : {
         width : '220',
         height : '200',
         url : 'img/mood_note.png'
     }
 },
 "screen6" : {
     img : {
         width : '220',
         height : '190',
         url : 'img/track_foods.png'
     }
 },
 "screen7" : {
     img : {
         width : '190',
         height : '180',
         url : 'img/track_symptoms.png'
     }
 },
 "screen8" : {
     img : {
         width : '210',
         height : '180',
         url : 'img/track_treatments.png'
     }
 },
 "screen9" : {
     img : {
         width : '220',
         height : '200',
         url : 'img/positive_predictors.png'
     }
 },
 "screen10" : {
     img : {
         width : '220',
         height : '200',
         url : 'img/negative_predictors.png'
     }
 },
 "screen11" : {
      img : {
          width : '180',
          height : '180',
          url : 'img/ic_mood_ecstatic.png'
      }
  }
}
```
This is the dataset for intro, you can edit the images that get displayed according to your own app. You can set `width`, `height` and the `url` of your image.


**notification_callback**
```
window.notification_callback = function(reported_variable, reporting_time){
  // implement the notification function here.
  // use reported variable and the reported time.
  ...
}
```
More often then not you will end up keeping the existing function and making the changes in `conversion_dataset`'s would work just fine, but if you wish to change something else, you have the option to do it so in this function.

#### Running the App
After you have generated your app, you can run the project through `node app.js`. This will run the project at [http://localhost:5000/](http://localhost:5000/)

#### Generate iOS App
You should run the following cordova commands to setup your iOS project.

1. `gulp make`. This will copy your generated xml config file (xmlconfigs/[your_app_code_name_here].xml) into the main config.xml so that the iOS app is generated with your new app as default.
2. `cordova platforms add iOS`. This would create the iOS app in `platforms/ios` folder

This should generate the app and you should be good to go!

#### Building the app

Before building an app, You have the choice to setup Bugsnag for your app, We recommend that you do, it helps to track the bugs, and you can report them to us so that we can have better data to help you.

We will be using CocoaPods for dependency Management in our iOS app.

1. install cocoa pods if you haven’t already by running `sudo gem install cocoa pods`.
2. cd to `platforms/ios`
3. run command `pod init`
4. Add Bugsnag to your Profile. Copy the following line into the `PodFile`.
```
pod ‘Bugsnag’, :git => “https://github.com/bugsnag/bugsnag-cocoa.git”` 
```
5. Install Bugsnag by running `pod install`. (This might take some time on the first run).
6. Import Bugsnag.h in your `ApplicationDelegate.m`
```
#import “Bugsnag.h”
```
7. In your application:didFinishLaunchingWithOptions: method, register with bugsnag by calling,
```
[Bugsnag startBugsnagWithApiKey:@“your_bugsnag_key”];
```

You can build the app with Xcode, or fastlane method (mentioned below).

#### Deployment

##### Fastlane
1. Install fastlane by running 
```
sudo gem install fastlane --verbose
```
2. Make sure, you have the latest version of the Xcode command line tools installed:
```
xcode-select --install
```
3. run `fastlane init` and it will ask you the appropriate questions, answer them once to setup the deployment script for your app.

##### AppStore
  
1. Create an app identifier
2. Create a Provisioning Profile
3. Since we will use push notifications, We will need an Apple Store Certificate with Push Notifications enabled (so make sure you have that).
4. Next is to create the app with your identifier in the iTunes Connect.


## Running the App
After you have generated your app, you can run the project through `node app.js`. This will run the project at [http://localhost:5000/](http://localhost:5000/)

#### Generate iOS App
You should run the following cordova commands to setup your iOS project.

1. `gulp make`. This will copy your generated xml config file (xmlconfigs/[your_app_code_name_here].xml) into the main config.xml so that the iOS app is generated with your new app as default.
2. `cordova platforms add iOS`. This would create the iOS app in `platforms/ios` folder

This should generate the app and you should be good to go!

## Building the app

Before building an app, You have the choice to setup Bugsnag for your app, We recommend that you do, it helps to track the bugs, and you can report them to us so that we can have better data to help you.

We will be using CocoaPods for dependency Management in our iOS app.

1. install cocoa pods if you haven’t already by running `sudo gem install cocoa pods`.
2. cd to `platforms/ios`
3. run command `pod init`
4. Add Bugsnag to your Profile. Copy the following line into the `PodFile`.
```
pod ‘Bugsnag’, :git => “https://github.com/bugsnag/bugsnag-cocoa.git”` 
```
5. Install Bugsnag by running `pod install`. (This might take some time on the first run).
6. Import Bugsnag.h in your `ApplicationDelegate.m`
```
#import “Bugsnag.h”
```
7. In your application:didFinishLaunchingWithOptions: method, register with bugsnag by calling,
```
[Bugsnag startBugsnagWithApiKey:@“your_bugsnag_key”];
```

You can build the app with Xcode, or fastlane method (mentioned below).

## Deployment

### Fastlane
1. Install fastlane by running 
```
sudo gem install fastlane --verbose
```
2. Make sure, you have the latest version of the Xcode command line tools installed:
```
xcode-select --install
```
3. run `fastlane init` and it will ask you the appropriate questions, answer them once to setup the deployment script for your app.

### AppStore
  
1. Create an app identifier
2. Create a Provisioning Profile
3. Since we will use push notifications, We will need an Apple Store Certificate with Push Notifications enabled (so make suenter code herere you have that).
4. Next is to create the app with your identifier in the iTunes Connect.



## Building a chrome app

### Chrome App folder structure

```
| Modo
|---chromeApps
     |----moodimodo
            |---private_configs
                |---{{appname}}.config.js // contains your client id & client secret
                |---sample_private_config.js // a sample configuration file
            |---scripts
                |---background.js // The background.js opens the app & handles the notifications scheduling
                |---popup.js // popup.js handles the mood reporting from notifications
            |---templates
                |---popup.html // notification template
            |---manifest.json
```

### Building chrome app for webstore

* For building the app for webstore you first need to have an active chrome app developer account, that you can create here `https://chrome.google.com/webstore/developer/dashboard/`
* Once you have an active developer account, go to your developer account dashboard and click on add new item.
* Copy the `www` folder from project directory to /chromeApps/{{appname}} directory, create its zip archive and upload it to the developer dashboard.
* Fill the details of the app and hit publish button.

### chrome app oAuth 

For oAuth authentication, here are the three steps you need to complete:

* Register a quantimodo developer account.
* get your client id & client secret & add that in /chromeApps/{{appname}}/private_configs/config.js
* Speficfy the redirection url in this format https://<extension-id>.chromiumapp.org/<anything-here> For example, if your app ID is abcdefghijklmnopqrstuvwxyzabcdef and you want provider_cb to be the path, to distinguish it with redirect URIs from other providers, you should use: https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/provider_cb

### Building chrome app for webstore using gulp task

You can use gulp task to simplify the process of building and publishing Chrome app. To use the gulp task you must at least publish it once manually and copy its app id in gulpfile.js like this https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App/blob/develop/gulpfile.js#L21. 

Once you have done that, follow these steps to build, upload, and publish the Chrome app to Webstore.

1. run command gulp chrome
1. Enter the name of the app that you want to release for example `moodimodo`. 
1. Task will ask you if you have increased the version number in the manifest.json file.
1. A browser window will open, you need to login with your developer account and give permissions. After that a code will be displayed, copy that and paste it in the console.
1. After 4th step, app will be uploaded to the chrome developer dashboard, you will be asked if you want to publish it. 
1. Type Yes and press enter to publish it.  

### Building the chrome app for local testing

To run the chrome app locally, simply follow these steps:

1. Open url chrome://extensions in your chrome browser.
2. click on load unpacked extension button.
3. select the path of the chrome app project in the file browser.
4. That's it, the chrome app will be installed now, you can click on the launch link to launch the app.

# xcode 7 - IOS 9 Updates (Steps to recreate the ios Project)

1. Remove any existing iOS project from the repo :

  `ionic platform rm iOS`
  
2. Check the installed plugins by running :

  `ionic plugins list`

3. If google play services are installed remove them by running :
  
  `cordova plugins rm cordova-plugin-googleplayservices`
  
4. If google plus plugin is installed remove that by running :

  `cordova plugin rm cordova-plugin-google-plus`
  
5. to remove Facebook plugin, run :

  `cordova plugin rm cordova-facebook-plugin` 

6. Once we are finished, add the iOS Platform to ionic by running:

  `ionic platform add ios` 

7. Install Google Plus Plugin by running 

  `cordova plugin add cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=com.googleusercontent.apps.1052648855194-djmit92q5bbglkontak0vdc7lafupt0d` 

 > Replace the client id according to the app you are building from Google’s Developer’s Console
 
8. Download Facebook Plugin to `~/Developer/fbplugin/` by running 

  `$ git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git`

9. Install the Fbplugin by running 

  `cordova -d plugin add ~/Developer/fbplugin/phonegap-facebook-plugin --variable APP_ID="225078261031461" --variable APP_NAME="QuantiModo"` 
> Replace the app with your appid and name. Also make sure your bundle id is included in the Facebook App Settings.

10. run `pods Init` 
> Make sure you have cocoa pods installed

11. Open the PodFile in `platforms/ios/ProjectName/Podfile` directory and add a pod 

  `’Bugsnag', :git => "https://github.com/bugsnag/bugsnag-cocoa.git”`.

12. After adding the pod, run `install --no-repo-update --verbose` to install the required Pods.

13. Open `Project.xcworkspace` in `xcode`.

14. When we install both of the social plugins, they tend to override properties in `Resources/info.plist` file.

15. Copy paste the keys after Facebook App id into your info.plist  from https://gist.github.com/8d0473c5a6010581b937 . This will resolve all iOS9 quirks for ionic.

16. Add `#import "Bugsnag.h”` to your `AppDelegate.m`

17. Open `AppDelegate.m`. In your 
  `application:didFinishLaunchingWithOptions` method, register with Bugsnag by calling, `[Bugsnag startBugsnagWithApiKey:@"ae7bc49d1285848342342bb5c321a2cf”];`

18. Open `Project Settings` > `General`. Check `Requires Full Screen`

19. Open `Project Settings` > `Build Settings` > `Enable Bitcode` -> Set to `No`

20. Open `Project Settings` > `Build Settings` > `Other Linker Flags` > Add `$(inherited)`

21. Open `Project Settings` > `Build Settings` > (Select All and Combined Filters) > `Add Header Search Paths` (Debug & Release) to `"$(OBJROOT)/UninstalledProducts/$(PLATFORM_NAME)/include"`

22. You should be ready to go,  Archive the project and upload it to the App Store
