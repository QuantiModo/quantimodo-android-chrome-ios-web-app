### Release the Chrome Extension

- Run `npm install` in root of repo
- Set ENCRYPTION_SECRET environmental variable (see below)
- Increase IONIC_IOS_APP_VERSION_NUMBER and OLD_IONIC_IOS_APP_VERSION_NUMBER by 0.0.1 in `gulpfile.js` in root of repository
- Increase $rootScope.appVersion by 0.0.1 in `js/app.js`
- Commit version update to Github
- Run `gulp buildAllChromeExtensions`
- Install the [Chrome Apps & Extensions Developer Tool](https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc)
- Click the Extensions tab
- Click `Load unpacked...`
- Select each extension folder in the `build` folder in the root of this repository
- Make sure you can log in and out of the extension and that the basic functionality works
- If everything works, use the credentials [here](https://docs.google.com/spreadsheets/d/1v_u6g6YHWxyrLqNeHMVg-C20MxOc7n1NepB3X6plVAY/edit#gid=2130660029) log into the [Chrome Web Store Dashboard](https://chrome.google.com/webstore/developer/dashboard/u58d852d3c5dcff27d49e35858ae710cd)
- Click `Edit`
- Click `Upload Updated Package`
- Click `Publish Changes`
- Great job!  :D

### Set Environmental Variables in Windows 10
- Press Windows Start button
- Type `Environmenal Variables`
- Click `Edit the system environment varibles` in search results
- Click `Environmenal Variables...` button at bottom
- Click `New..` button under `System Variables`
- Enter `ENCRYPTION_SECRET` as the `Variable Name`
- Get the `Variable Value` [here](https://docs.google.com/spreadsheets/d/1v_u6g6YHWxyrLqNeHMVg-C20MxOc7n1NepB3X6plVAY/edit#gid=2130660029)