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
