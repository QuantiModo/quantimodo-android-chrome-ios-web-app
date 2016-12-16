# Local Notification Plugin (deprecated - now we use push notifications)

The plugin buttons can be configured in config.xml like so:

```
<notificationplugin interactive=“true”>
    <button id=“repeat_rating” display=“Same As Last Time” mode=“background”></button>
    <button id=“other” display=“Other” mode=“foreground”></button>
    <button id=“sad”  display=“Sad” mode=“background”></button>
    <button id=“happy”  display=“Happy” mode=“background”></button>
    <button id=“depressed” display=“Depressed” mode=“background”></button>
    <button id=“ok” display=“OK” mode=“background”></button>
    <TwoButtonLayout first=“repeat_rating” second=“other”></TwoButtonLayout>
    <FourButtonLayout first=“sad” second=“happy” third=“ok” fourth=“depressed”>
    </FourButtonLayout>
</notificationplugin>
```
  
This is the notification plugin (for using interactive notifications in iOS) .

  You can define the `buttons`, give each of them a unique `id` and set the text as to how they will be displayed in `display` property. 
  
  You should also set the run mode when the button is clicked through the notification bar, it can run in `background` or `foreground`.
  
  In `TwoButtonLayout`, you can select which of the two buttons you want to show by providing their id’s in `first` and `second` property.
  
  In `FourButtonLayout`, you can select which of the four buttons you want to show by providing their id’s in `first`, `second`, `third` and `fourth` property.
