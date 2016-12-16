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