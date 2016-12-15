# QuantiModo Ionic App

A generic app that can be easily configured to help the user track and optimize any given outcome variable.
-------

- [MoodiModo for iOS](https://itunes.apple.com/us/app/moodimodo/id1046797567?ls=1&mt=8)
- [QuantiModo for iOS](https://itunes.apple.com/us/app/quantimodo-life-tracker/id1115037060?mt=8)
- [MoodiModo Chrome Extension](https://Chrome.google.com/webstore/detail/moodimodo-mood-tracking-e/lncgjbhijecjdbdgeigfodmiimpmlelg)
- [QuantiModo Chrome Extension ](https://Chrome.google.com/webstore/detail/quantimodo-life-tracking/jioloifallegdkgjklafkkbniianjbgi)
- [QuantiModo for Android](https://play.google.com/store/apps/details?id=com.quantimodo.quantimodo)
- [MoodiModo for Android](https://play.google.com/store/apps/details?id=com.moodimodo)


# 5-Minute Quick Start
1. Fork this repository.
1. Choose a name for your app.
1. Create your free account and app in the [QuantiModo Developer Portal](https://app.quantimo.do/api/v2/apps) to get a
`client id` and `client secret`.
1. Open `www/js/apps.js` and replace yourlowercaseappnamehere with your app's name.  (For instance, if your app
display name is `QuantiModo`, your lowercase app name would be `quantimodo`.)
1. Copy and rename `www/configs/yourlowercaseappnamehere.js` with your app name. Replace `yourlowercaseappnamehere`
and `YourAppDisplayNameHere` with your app name within the file.
(This configuration file is where you can define the app menu, the primary outcome variable for the app, the intro tour,
and many other features.)
1. Copy and rename `www/private_configs/yourlowercaseappnamehere.config.js` with your app name. Replace
    `your_quantimodo_client_id_here` and `your_quantimodo_client_secret_here` with the credentials you got in the
    [QuantiModo Developer Portal](https://app.quantimo.do/api/v2/apps).
1. Copy and rename `config-template.xml` to `config.xml` in the root of this repository.  Replace `yourlowercaseappnamehere` and `YourAppDisplayNameHere`.
1. Install [Node.js](http://nodejs.org/).  (Windows Developers: We recommend [Visual Studio Community]
(https://www.visualstudio.com/cordova-vs?wt.mc_id=o~display~ionic~dn948185), which comes with everything you need!)
1. Install the latest Cordova and Ionic command-line tools in your terminal with `npm install -g cordova ionic`.
1. Run `npm install` in the root of this repository.
1. Run `ionic serve` in the root of this repository and you should see your app at
[http://localhost:8100/#/](http://localhost:8100/#/).
1. Great job!  :D  Now you can start configuring your app by changing settings in
`www/configs/yourlowercaseappnamehere.js` and modifying the code as needed!
1. Need help?  Please contact us at [help.quantimo.do](http://help.quantimo.do).

### QuantiModo API
For more info about the types of data you can store and get from the QuantiModo API, try out our [Interactive API Explorer](https://app.quantimo.do/api/v2/account/api-explorer)

### One Click Deploy
When you're ready to share your app with the world, you can instantly deploy your app to Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App/)

# Chrome Development Tips
1. Install [Chrome Apps & Extensions Developer Tool](https://Chrome.google.com/webstore/detail/Chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc?utm_source=Chrome-ntp-icon)
1. You can load the whole repo as an unpacked extension
1. [Add the www folder to your workspace](https://developer.Chrome.com/devtools/docs/workspaces)
1. To be able to edit and save files within the Chrome dev console, map the browser's index.html file to the workspace www/index.html
1. To avoid debugging libraries, go to Chrome Dev Console -> Settings -> Blackboxing and add `\.min\.js$`, `/backbone\.js$`, `jquery.js` and `/angular\.js$`

## File Structure
The main contents of the App are in the `www` folder. The structure is:
```
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
  Controllers are located in `www/js/controllers` directory. Each View has a separate controller or some views share
  the same controller if the functionality is same.
  The main controller for the app is `appCtrl.js` whereas all the other controllers run when their views come to focus.
## Services
  Services are the data layer, which store and obtain data from the `QuantiModo API`.  Services are also used to provide chart configurations and utility functions.

#### Editing an App
The current App has 3 config files:

1. config.xml
2. www/configs/{{appname}}.js
3. www/private_configs/{{appname}}.config.js

### config.xml
`config.xml` is used to configure the iOS and Android builds. So the most important variables in this file are:

1. App Name
  ```
  <name>{{appName}}</name>
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
      <button id=“repeat_rating” display=“Same As Last Time” mode=“background”></button>
      <button id=“other” display=“Other” mode=“foreground”></button>
      <button id=“sad”  display=“Sad” mode=“background”></button>
      <button id=“happy”  display=“Happy” mode=“background”></button>
      <button id=“depressed” display=“Depressed” mode=“background”></button>
      <button id=“ok” display=“OK” mode=“background”></button>
      <TwoButtonLayout first=“repeat_rating” second=“other”></TwoButtonLayout>
      <FourButtonLayout first=“sad” second=“happy” third=“ok” fourth=“depressed”>
      </FourButtonLayout>
</notificationplugin>
  ```

This is the notification plugin (for using interactive notifications in iOS) .

  You can define the `buttons`, give each of them a unique `id` and set the text as to how they will be displayed in `display` property.

  You should also set the run mode when the button is clicked through the notification bar, it can run in `background` or `foreground`.

  In `TwoButtonLayout`, you can select which of the two buttons you want to show by providing their id’s in `first` and `second` property.

  In `FourButtonLayout`, you can select which of the four buttons you want to show by providing their id’s in `first`, `second`, `third` and `fourth` property.


### www/configs/yourappnamehere.js

`primaryOutcomeVariable` : The primary outcome variable you are tracking (like Overall Mood or Energy Rating etc.)

`appStorageIdentifier` : a unique to your app string that will be prepended to any key stored in `localStorage`. (no spaces or any characters not allowed in keys)

These are the five options (available on the Track page) that the users will rate. Each of the option has an `image` (that will replace the emoji) and `value` (the quantifiable value the image represents).

**Note**: Make sure the values match with the values in the `primaryOutcomeVariableOptionLabels`.

`welcomeText` : The text app greets the user with when the app is opened for the first time.

`primaryOutcomeVariableTrackingQuestion` : The question displayed when the user is on the Track Screen.

`primaryOutcomeVariableAverageText` : a string that tells user his average primary outcome variable value.

`mobileNotificationImage` : the logo that gets displayed with the notification in ios

`mobileNotificationText` : the text that appears in the notification on ios

### Building Chrome App

For oAuth authentication, here are the three steps you need to complete:
* Specify the redirection URL in this format https://<extension-id>.chromiumapp.org/<anything-here> For example, if
your app ID is abcdefghijklmnopqrstuvwxyzabcdef and you want provider_cb to be the path, to distinguish it with redirect
URIs from other providers, you should use: https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/provider_cb

* For uploading the app for the Chrome Web Store you first need to have an active Chrome app developer account,
that you can create here `https://Chrome.google.com/webstore/developer/dashboard/`
* Once you have an active developer account, go to your developer account dashboard and click on add a new item.
* Copy the `www` folder from the project directory to /ChromeApps/{{appname}} directory, create its zip archive and
upload it to the developer dashboard.
* Fill the details of the app and hit publish button.

### Automated Chrome Web Store Upload
You can use gulp task to simplify the process of building and publishing Chrome app. To use the gulp task you must
publish it once manually and copy its app id in gulpfile.js like this
https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App/blob/develop/gulpfile.js.

Once you have done that, follow these steps to build, upload, and publish the Chrome app to Webstore.

1. Run `gulp chrome`
1. Enter the name of the app that you want to release for example `moodimodo`.
1. Task will ask you if you have increased the version number in the manifest.json file.
1. A browser window will open, you need to login with your developer account and give permissions. After that, a code will be displayed, copy that and paste it in the console.
1. After that, the app will be uploaded to the Chrome developer dashboard, you will be asked if you want to publish it.
1. Type Yes and press enter to publish it.

### Building the Chrome app for local testing

To run the Chrome app locally, simply follow these steps:

1. Open the URL chrome://extensions in your Chrome browser.
2. Click on load unpacked extension button.
3. Select the path of the Chrome app project in the file browser.
4. That's it, the Chrome app will be installed now, you can click on the launch link to launch the app.

# iOS Build

- Run `ionic state reset` in the root of this repository
- Add certs to XCode [like so](https://livecode.com/how-to-create-a-free-ios-development-provisioning-profile/)
- Run `gulp generateXmlConfigAndUpdateAppsJs`
- Run `gulp generateXmlConfigIosApp`
- Open YourAppDisplayNameHere.xcworkspace in XCode
- Select YourAppDisplayNameHere 2 and target device
- Press Play button

- Remove any existing iOS project from the repo :

  `ionic platform rm iOS`

- Check the installed plugins by running :

  `ionic plugins list`

- If google play services are installed remove them by running :

  `cordova plugins rm cordova-plugin-googleplayservices`

- If google plus plugin is installed remove that by running :

  `cordova plugin rm cordova-plugin-google-plus`

- To remove the Facebook plugin, run :

  `cordova plugin rm cordova-facebook-plugin`

- Once we are finished, add the iOS Platform to ionic by running:

  `ionic platform add ios`

- Install the Google Plus Plugin by running

  `cordova plugin add cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=com.googleusercontent.apps.1052648855194-djmit92q5bbglkontak0vdc7lafupt0d`

 > Replace the client id according to the app you are building from Google’s Developer’s Console

- Download Facebook Plugin to `~/Developer/fbplugin/` by running

  `$ git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git`

- Install the FB plugin by running

  `cordova -d plugin add ~/Developer/fbplugin/phonegap-facebook-plugin --variable APP_ID="225078261031461" --variable APP_NAME="QuantiModo"`
> Replace the app with your appid and name. Also make sure your bundle id is included in the Facebook App Settings.

- When we install both of the social plugins, they tend to override properties in `Resources/info.plist` file.

- Copy paste the keys after Facebook App id into your info.plist  from https://gist.github.com/8d0473c5a6010581b937 . This will resolve all iOS9 quirks for ionic.

#### Bugsnag

You have the choice to setup Bugsnag for your app. We recommend that you do because it helps to
identify the bugs and we'll have better data to help you. We will be using CocoaPods for dependency Management in our iOS app.

- Install cocoa pods if you haven’t already by running `sudo gem install cocoa pods`.

- Run `pod init` in `platforms/ios`

- Open the PodFile in `platforms/ios/ProjectName/Podfile` directory and add a pod

  `’Bugsnag', :git => "https://github.com/bugsnag/bugsnag-cocoa.git”`.

- After adding the pod, run `install --no-repo-update --verbose` to install the required Pods.

- Add `#import "Bugsnag.h”` to your `AppDelegate.m`

- Open `YourAppDisplayNameHere.xcworkspace` in `xcode`.

- Open `AppDelegate.m`. In your
  `application:didFinishLaunchingWithOptions` method, register with Bugsnag by calling, `[Bugsnag startBugsnagWithApiKey:@"ae7bc49d1285848342342bb5c321a2cf”];`

- Open `Project Settings` > `General`. Check `Requires Full Screen`

- Open `Project Settings` > `Build Settings` > `Enable Bitcode` -> Set to `No`

- Open `Project Settings` > `Build Settings` > `Other Linker Flags` > Add `$(inherited)`

- Open `Project Settings` > `Build Settings` > (Select All and Combined Filters) > `Add Header Search Paths`
(Debug & Release) to `"$(OBJROOT)/UninstalledProducts/$(PLATFORM_NAME)/include"`

- You should be ready to go, so archive the project and upload it to the App Store with `bash generate_resources_fix_xcode_and_fastlane_beta.sh`
