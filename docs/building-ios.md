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