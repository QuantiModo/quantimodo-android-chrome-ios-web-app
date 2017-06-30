### Upload Alpha Builds to Play Store

#### Build Them
- Make sure all tests are passing on the `develop` branch. 
- Merge from the `develop` branch into the branch named after the app you want to build.
- The app will now be queued to build automatically on BuddyBuild
- Go get a cup of coffee.  Builds take about 30 minutes.  If there are others in the queue already, it could take longer.

#### Test Them
- Go to [BuddyBuild](https://dashboard.buddybuild.com/apps/58544b2c77b9870100027394) (credentials [here](https://docs.google.com/spreadsheets/d/1v_u6g6YHWxyrLqNeHMVg-C20MxOc7n1NepB3X6plVAY/edit?userstoinvite=quantimodo.chrome@gmail.com&ts=58ac6d3a#gid=2130660029))
- Sign in with the credentials in this [spreadsheet](https://docs.google.com/spreadsheets/d/1v_u6g6YHWxyrLqNeHMVg-C20MxOc7n1NepB3X6plVAY/edit?userstoinvite=quantimodo.chrome@gmail.com&ts=58ac6d3a#gid=2130660029) (not your own)
- Make sure it says `ANDROID` at the top. If it says `IOS`, click and switch to `ANDROID`
- Once your build is green, go to [BuddyBuild](https://dashboard.buddybuild.com/apps/58544b2c77b9870100027394) on your Android phone
- Install the latest version in the branch named after the app you want to test
- Make sure you can log in by each login method and that there are no obvious problems in the intro and onboarding pages

#### Upload Them To Alpha
- If everything works, go back to [main page](https://dashboard.buddybuild.com/apps/58544b2c77b9870100027394) on your computer
- Click your latest build on the `develop` branch
- Click the `Google Play` tab
- Select `armv7Release`
- Increase the version code by 1 (BE VERY CAREFUL HERE. DO NOT ADD AN ADDITIONAL DIGIT. IF WE INCREASE THE NUMBER TOO MUCH WE REACH THE MAXIMUM AND NOT BE ABLE TO RELEASE ANYMORE)
- Click to upload to `Alpha`
- Select `x86Release`
- Increase the version code by 1 (BE VERY CAREFUL HERE. DO NOT ADD AN ADDITIONAL DIGIT. IF WE INCREASE THE NUMBER TOO MUCH WE REACH THE MAXIMUM AND NOT BE ABLE TO RELEASE ANYMORE)
- Click to upload to `Alpha`

### Promote from Alpha to Production Release
- Go to the [Play Dashboard](https://play.google.com/apps/publish)
- Select the app
- Click the `APK` tab
- Click to show Other APK's
- Click `Move to Prod` for the two version codes that you just uploaded
- Click `Deactivate` for the old versions
- Click `Submit Update`
- Great job!  :D
