### BuddyBuild Setup

- Fork this repository on Github
- Create account at https://dashboard.buddybuild.com
- Connect your forked repository in BuddyBuild
- Create 2 applications, 1 for the iOS build and 1 for the Android build
- Create a BUILD_ANDROID [environment variable](http://docs.buddybuild.com/docs/environment-variables) and set to true in the Android app
- Create a BUILD_IOS [environment variable](http://docs.buddybuild.com/docs/environment-variables) and set to true in the iOS app
- Add your QUANTIMODO_CLIENT_ID from the [app dasboard](https://app.quantimo.do/api/v2/apps) in the [environment variables](http://docs.buddybuild.com/docs/environment-variables) for both apps
- Add your QUANTIMODO_ACCESS_TOKEN from your [account page](https://app.quantimo.do/api/v2/account) in the [environment variables](http://docs.buddybuild.com/docs/environment-variables) for both apps
- In Build Settings -> Auto Versioning, select the YYYYMMDDHHmmss option.
- To release follow the rest of the setup steps in the [BuddyBuild Docs](http://docs.buddybuild.com/docs)
- If you want to release but don't want to spend hundreds on an iOS and Android development certificate or deal with the setup headaches, email mike@quantimo.do and we can use my certificates

### Working iOS Build Configuration

The Google and InAppBrowser plugins don't seem to work on XCode versions > 7.3.1

![alt text](https://image.prntscr.com/image/3U-Zfi1ZSTiOJlqwgjMZlg.png "Working iOS Build Configuration")
