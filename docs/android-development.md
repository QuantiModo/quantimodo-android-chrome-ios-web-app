# Android Development

- Install Android Studio and install SDK to something like C:\Android\sdk
- Set ANDROID_HOME environmental variable to the chosen SDK path
- Launch Android Studio and open the platforms/android folder as a project
- Go to Android Studio -> File -> Settings and search for `sdk`
- Make sure the SDK is installed in your selected ANDROID_HOME folder.  If not, change the setting to your ANDROID_HOME folder and install
- Open Android Studio -> Tools -> Android -> AVD Manager and install an emulator
- After this, you should be able to run gulp buildAndroidApp in the root of this project an run the debug version in Android Studio in the emulator
- You should be able to open the debugger at chrome://inspect/#devices
