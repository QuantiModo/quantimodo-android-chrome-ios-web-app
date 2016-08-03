Deploy an app automatically to Testflight using TravisCI.
https://gist.github.com/johanneswuerbach/5559514
http://blog.samuelbrown.io/2015/10/20/continuous-delivery-with-ionic-ios-and-travisci/

Copy the .travis.yml into your repo (replace app name, developer name and provisioning profile uuid)
Create the folder "scripts/travis"
Export the following things from the Keychain app
"Apple Worldwide Developer Relations Certification Authority" into scripts/travis/apple.cer
Your iPhone Distribution certificate into scripts/travis/dist.cer
Your iPhone Distribution private key into scripts/travis/dist.p12 (choose a password)
Execute travis encrypt "KEY_PASSWORD=YOUR_KEY_PASSWORD" --add
Execute travis encrypt "TEAM_TOKEN=TESTFLIGHT_TEAM_TOKEN" --add
Execute travis encrypt "API_TOKEN=TESTFLIGHT_API_TOKEN" --add
Copy add-key.sh, remove-key.sh and testflight.sh into scripts/travis
Commit