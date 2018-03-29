### Release the Chrome Extension

#### Download Them
- Go to the develop branch on [CircleCI](https://circleci.com/gh/QuantiModo/quantimodo-android-chrome-ios-web-app/tree/develop)
- Click the most recent green build (at the top)
- Click the "Artifacts" tab (if you don't see an "Artifacts" tab, append `#artifacts` to the end of the url for the specific build)
- Download the zip files

#### Build Them (Alternative to Downloading)
- If you've already downloaded them, you can skip to the Test Them steps
- Create folder in the root of the repository called `build` (if it doesn't already exist)
- Run `npm install` in root of repo
- Set ENCRYPTION_SECRET environmental variable (see [Environmental Variables](environmental-variables.md))
- Run `gulp _build-all-chrome` in the root of the repository

#### Test Them
- Install the [Chrome Apps & Extensions Developer Tool](https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc)
- Click the Extensions tab
- Click `Load unpacked...`
- Select each extension's FOLDER in the `build` folder in the root of this repository
- Make sure you can log in and out of the extension and that the basic functionality works

#### Upload Them
- If everything works, use the credentials [here](https://docs.google.com/spreadsheets/d/1v_u6g6YHWxyrLqNeHMVg-C20MxOc7n1NepB3X6plVAY/edit#gid=2130660029) log into the [Chrome Web Store Dashboard](https://chrome.google.com/webstore/developer/dashboard/u58d852d3c5dcff27d49e35858ae710cd)
- Click `Edit`
- Click `Upload Updated Package`
- Select the extension's ZIP file in the `build` folder in the root of this repository
- Click `Publish Changes`
- Great job!  :D
