### www/configs/yourappnamehere.js

`primaryOutcomeVariable` : The primary outcome variable you are tracking (like Overall Mood or Energy Rating etc.)

`appStorageIdentifier` : a unique to your app string that will be prepended to any key stored in `localStorage`. (no spaces or any characters not allowed in keys)

These are the five options (available on the Track page) that the users will rate. Each of the option has an `image` (that will replace the emoji) and `value` (the quantifiable value the image represents).

**Note**: Make sure the values match with the values in the `primaryOutcomeVariableOptionLabels`.

`welcomeText` : The text app greets the user with when the app is opened for the first time.

`primaryOutcomeVariableTrackingQuestion` : The question displayed when the user is on the Track Screen.

`primaryOutcomeVariableAverageText` : a string that tells user his average primary outcome variable value.

`mobileNotificationImage` : the logo that gets displayed with the notification in ios

`mobileNotificationText` : the text that appears in the notification on ios
