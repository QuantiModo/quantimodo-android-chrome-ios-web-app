A generic app that can be easily configured to help the user track and optimize any give outcome variable.
---

[![Deploy](https://s3.amazonaws.com/heroku-devcenter-files/article-images/2151-imported-1443570568-2151-imported-1443555045-button.svg)](https://heroku.com/deploy?template=https://github.com/Abolitionist-Project/QuantiModo-Ionic-Template-App/)


#QuantiModo Ionic App
---
## File Structure
The main contents of the App are in the `www` folder. The structure is:
```
| Modo
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
## Making an Android Build
To generate a release build for Android, we can use the following cordova cli command:
```
$ cordova build --release android
```

This will generate a release build based on the settings in your `config.xml`. Your Ionic app will have preset default values in this file, but if you need to customize how your app is built, you can edit this file to fit your preferences. 

Next, we can find our unsigned APK file in `platforms/android/bin`. In our example, the file was `platforms/android/bin/Modo-release-unsigned.apk`. Now, we need to sign the unsigned APK and run an alignment utility on it to optimize it and prepare it for the app store. If you already have a signing key, skip these steps and use that one instead.

Let's generate our private key using the keytool command that comes with the JDK. 
```
$ keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```
You'll first be prompted to create a password for the keystore. Then, answer the rest of the nice tools's questions and when it's all done, you should have a file called my-release-key.keystore created in the current directory.

**Note**: Make sure to save this file somewhere safe, if you lose it you won't be able to submit updates to your app!

To sign the unsigned APK, run the jarsigner tool which is also included in the JDK:

```
$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore MoodiModo-release-unsigned.apk alias_name
```
This signs the apk in place. Finally, we need to run the zip align tool to optimize the APK:
```
$ zipalign -v 4 MoodiModo-release-unsigned.apk MoodiModo.apk
```

Now we have our final release binary called `MoodiModo.apk` and we can release this on the Google Play Store for all the world to enjoy!

## Making an iOS Build

#### 1. Join the iOS Developer Program

Other than using PhoneGap to develop ipas for you, the only way to build IPAs for testing on your devices is by joining Apple’s iOS developer program

Jump into the iOS Developer Center and register for free. Being a registered Apple developer gives you access to a lot of information, but to be able to send apps to the App Store or to generate IPAs from XCode you will need to enroll in Apple’s iOS developer program. This is the part that costs you US$99 per year.

In your Developer Member Center click the "join today" link. You will be asked to enroll as a company or individual, most will be enrolling as an individual but if you need to enroll as a company you will need some documentation from your employer.

Once you proceed, you will be asked to sign in with your Apple ID for billing. You will be asked to select your Program, most likely the IOS Developer program. Add it to the cart and make your payment.

run
```
cordova platform add ios
cordova build ios
```
This will generate an Xcode project inside of `platforms/ios` which you can open with Xcode and sign your app for publishing.

#### 2. Deploying the app to your iPad or iPhone for testing

The app is built and ready to be pushed out as an IPA.

You have to find the IOS application and launch it in XCode. It has been generated for you in /platforms/ios so the XCode project will be MoodiModo.xcodeproj in MoodiModo/platforms/ios/

Open the file in XCode so you can deploy your IPA.

##### 3. Create Provisioning Profile

Now to deploy your IPA to a device you will need to Create a Provisioning Profile. In your Developer account, click on Provisioning Profile and set one up.

Verify that the Code Signing section in your app in XCode is set to your provisioning profile name. In the "Identity" section in the General tab, it should have your name in the Team field.

##### 4. Set your device

In the XCode File menu, select Product > Destination and select "IOS device". You will now need to select a Device ID that you are deploying to.

Jump into "Devices" in Apple Developer Centre and add your device UDID.

The easy way to find your devices UDID is to follow this guide, but it is pretty straight forward. Now add your device, or if you want to deploy to multiple devices you can add some additional ones.

##### 5. Exporting to an IPA

The easiest way to generate an IPA is to archive your applications and share it from the Xcode Organizer.

Build your app, Click Product > Build then Product > Archive to open up XCode Organizer. Click on Distribute. This is where you select to either publish your app to the Apple App Store or just export the IPA to be installed on your device. Select "Save for Enterprise or Ad Hoc Deployment". Click Next then select your provisioning profile.

Now finally, click "Export" to get your IPA file.

You have finally exported the IPA to your file system. Select a folder where you will be keeping all of your versions of IPA files and click "Save".

##### 6. Install your IPA on a device

Now you have your IPA file, you need to push this IPA to your device. An easy way to do this is to Connect your Device to your MacBook and open iTunes. Select the Apps tab, then from the file menu select File > Add to Library to add your IPA file. It will ask you to Install the app, it will now be running as an app on your iPhone or iPad.

##### 7. Use Test Flight for testing on multiple devices

If you now want to push new versions of your app to yours or multiple devices quickly, you should sign up for TestFlight. It's pretty nice and easy to use. As long as the devices have the TestFlight app installed and you add their Device ID to your devices you should be able to push out to multiple devices with one easy step.
