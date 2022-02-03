# Quantimodo.TrackingReminderNotification

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**actionArray** | [**[TrackingReminderNotificationAction]**](TrackingReminderNotificationAction.md) |  | 
**availableUnits** | [**[Unit]**](Unit.md) |  | 
**bestStudyLink** | **String** | Link to study comparing variable with strongest relationship for user or population | [optional] 
**bestStudyCard** | [**Card**](Card.md) | Description of relationship with variable with strongest relationship for user or population | [optional] 
**bestUserStudyLink** | **String** | Link to study comparing variable with strongest relationship for user | [optional] 
**bestUserStudyCard** | [**Card**](Card.md) | Description of relationship with variable with strongest relationship for user | [optional] 
**bestPopulationStudyLink** | **String** | Link to study comparing variable with strongest relationship for population | [optional] 
**bestPopulationStudyCard** | [**Card**](Card.md) | Description of relationship with variable with strongest relationship for population | [optional] 
**optimalValueMessage** | **String** | Description of relationship with variable with strongest relationship for user or population | [optional] 
**commonOptimalValueMessage** | **String** | Description of relationship with variable with strongest relationship for population | [optional] 
**userOptimalValueMessage** | **String** | Description of relationship with variable with strongest relationship for user | [optional] 
**card** | [**Card**](Card.md) | Card with options for tracking. | [optional] 
**clientId** | **String** | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
**combinationOperation** | **String** | The way multiple measurements are aggregated over time | [optional] 
**createdAt** | **String** | Ex: 2017-07-29 20:49:54 UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**displayName** | **String** | Ex: Trader Joe&#39;s Bedtime Tea | [optional] 
**modifiedValue** | **Number** | Is the user specified default value or falls back to the last value in user unit. Good for initializing input fields. Unit: User-specified or common. | [optional] 
**unitAbbreviatedName** | **String** | Ex: /5 | [optional] 
**unitCategoryId** | **Number** | Ex: 5 | [optional] 
**unitCategoryName** | **String** | Ex: Rating | [optional] 
**unitId** | **Number** | Ex: 10 | [optional] 
**unitName** | **String** | Ex: 1 to 5 Rating | [optional] 
**defaultValue** | **Number** | Default value to use for the measurement when tracking | [optional] 
**description** | **String** | Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.  | [optional] 
**email** | **Boolean** | True if the reminders should be delivered via email | [optional] 
**fillingValue** | **Number** | Ex: 0 | 
**iconIcon** | **String** | Ex: ion-sad-outline | [optional] 
**id** | **Number** | id for the specific PENDING tracking remidner | 
**imageUrl** | **String** | Ex: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg | [optional] 
**inputType** | **String** | Ex: happiestFaceIsFive | [optional] 
**ionIcon** | **String** | Ex: ion-happy-outline | [optional] 
**lastValue** | **Number** | Ex: 3 | [optional] 
**manualTracking** | **Boolean** | True if this variable is normally tracked via manual user input rather than automatic imports | [optional] 
**maximumAllowedValue** | **Number** | Ex: 5 | [optional] 
**minimumAllowedValue** | **Number** | Ex: 1 | [optional] 
**mostCommonValue** | **Number** | Ex: 3 | [optional] 
**notificationBar** | **Boolean** | True if the reminders should appear in the notification bar | [optional] 
**notifiedAt** | **String** | Ex: UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**numberOfUniqueValues** | **Number** | Ex: 5 | [optional] 
**outcome** | **Boolean** | Indicates whether or not the variable is usually an outcome of interest such as a symptom or emotion | [optional] 
**pngPath** | **String** | Ex: img/variable_categories/emotions.png | [optional] 
**pngUrl** | **String** | Ex: https://web.quantimo.do/img/variable_categories/emotions.png | [optional] 
**popUp** | **Boolean** | True if the reminders should appear as a popup notification | [optional] 
**productUrl** | **String** | Link to associated product for purchase | [optional] 
**question** | **String** | Ex: How is your overall mood? | [optional] 
**longQuestion** | **String** | Ex: How is your overall mood on a scale of 1 to 5?? | [optional] 
**reminderEndTime** | **String** | Ex: 01-01-2018 | [optional] 
**reminderFrequency** | **Number** | How often user should be reminded in seconds. Ex: 86400 | [optional] 
**reminderSound** | **String** | String identifier for the sound to accompany the reminder | [optional] 
**reminderStartTime** | **String** | Earliest time of day at which reminders should appear in UTC HH:MM:SS format | [optional] 
**reminderTime** | **String** | UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used. | [optional] 
**secondMostCommonValue** | **Number** | Ex: 4 | [optional] 
**secondToLastValue** | **Number** | Ex: 1 | [optional] 
**sms** | **Boolean** | True if the reminders should be delivered via SMS | [optional] 
**svgUrl** | **String** | Ex: https://web.quantimo.do/img/variable_categories/emotions.svg | [optional] 
**thirdMostCommonValue** | **Number** | Ex: 2 | [optional] 
**thirdToLastValue** | **Number** | Ex: 2 | [optional] 
**title** | **String** | Ex: Rate Overall Mood | [optional] 
**total** | **Number** | Ex: 3 | [optional] 
**trackAllActions** | [**[TrackingReminderNotificationTrackAllAction]**](TrackingReminderNotificationTrackAllAction.md) |  | 
**trackingReminderId** | **Number** | id for the repeating tracking remidner | [optional] 
**trackingReminderImageUrl** | **String** | Ex: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg | [optional] 
**trackingReminderNotificationId** | **Number** | Ex: 5072482 | [optional] 
**trackingReminderNotificationTime** | **String** | UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used. | [optional] 
**trackingReminderNotificationTimeEpoch** | **Number** | Ex: 1501534124 | [optional] 
**trackingReminderNotificationTimeLocal** | **String** | Ex: 15:48:44 | [optional] 
**trackingReminderNotificationTimeLocalHumanString** | **String** | Ex: 8PM Sun, May 1 | [optional] 
**updatedAt** | **String** | When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local. | [optional] 
**userId** | **Number** | ID of User | [optional] 
**userVariableUnitAbbreviatedName** | **String** | Ex: /5 | [optional] 
**userVariableUnitCategoryId** | **Number** | Ex: 5 | [optional] 
**userVariableUnitCategoryName** | **String** | Ex: Rating | [optional] 
**userVariableUnitId** | **Number** | Ex: 10 | [optional] 
**userVariableUnitName** | **String** | Ex: 1 to 5 Rating | [optional] 
**userVariableVariableCategoryId** | **Number** | Ex: 1 | [optional] 
**userVariableVariableCategoryName** | **String** | Ex: Emotions | [optional] 
**valence** | **String** | Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.  | [optional] 
**variableCategoryId** | **Number** | Ex: 1 | [optional] 
**variableCategoryImageUrl** | **String** | Ex: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png | [optional] 
**variableCategoryName** | **String** | Ex: Emotions, Treatments, Symptoms... | [optional] 
**variableId** | **Number** | Id for the variable to be tracked | [optional] 
**variableImageUrl** | **String** | Ex: https://image.png | [optional] 
**variableName** | **String** | Name of the variable to be used when sending measurements | [optional] 


<a name="CombinationOperationEnum"></a>
## Enum: CombinationOperationEnum


* `MEAN` (value: `"MEAN"`)

* `SUM` (value: `"SUM"`)




<a name="VariableCategoryNameEnum"></a>
## Enum: VariableCategoryNameEnum


* `Activity` (value: `"Activity"`)

* `Books` (value: `"Books"`)

* `Causes of Illness` (value: `"Causes of Illness"`)

* `Cognitive Performance` (value: `"Cognitive Performance"`)

* `Conditions` (value: `"Conditions"`)

* `Emotions` (value: `"Emotions"`)

* `Environment` (value: `"Environment"`)

* `Foods` (value: `"Foods"`)

* `Goals` (value: `"Goals"`)

* `Locations` (value: `"Locations"`)

* `Miscellaneous` (value: `"Miscellaneous"`)

* `Movies and TV` (value: `"Movies and TV"`)

* `Music` (value: `"Music"`)

* `Nutrients` (value: `"Nutrients"`)

* `Payments` (value: `"Payments"`)

* `Physical Activities` (value: `"Physical Activities"`)

* `Physique` (value: `"Physique"`)

* `Sleep` (value: `"Sleep"`)

* `Social Interactions` (value: `"Social Interactions"`)

* `Software` (value: `"Software"`)

* `Symptoms` (value: `"Symptoms"`)

* `Treatments` (value: `"Treatments"`)

* `Vital Signs` (value: `"Vital Signs"`)




