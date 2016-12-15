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

## QuantiModo API
For more info about the types of data you can store and get from the QuantiModo API, try out our [Interactive API Explorer](https://app.quantimo.do/api/v2/account/api-explorer)

## One Click Deploy
When you're ready to share your app with the world, you can instantly deploy your app to Heroku. 

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App/)

## Chrome Development Tips
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

## App-Specific Config Files
The current App has 3 config files:
1. config.xml
2. www/configs/{{appname}}.js
3. www/private_configs/{{appname}}.config.js