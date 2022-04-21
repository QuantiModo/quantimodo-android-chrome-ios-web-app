# Quantimodo.Variable

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**actionArray** | [**[TrackingReminderNotificationAction]**](TrackingReminderNotificationAction.md) |  | [optional] 
**alias** | **String** | User-Defined Variable Setting:  Alternative display name | [optional] 
**availableUnits** | [**[Unit]**](Unit.md) |  | [optional] 
**bestStudyLink** | **String** | Link to study comparing variable with strongest relationship for user or population | [optional] 
**bestStudyCard** | [**Card**](Card.md) | Description of relationship with variable with strongest relationship for user or population | [optional] 
**bestUserStudyLink** | **String** | Link to study comparing variable with strongest relationship for user | [optional] 
**bestUserStudyCard** | [**Card**](Card.md) | Description of relationship with variable with strongest relationship for user | [optional] 
**bestPopulationStudyLink** | **String** | Link to study comparing variable with strongest relationship for population | [optional] 
**bestPopulationStudyCard** | [**Card**](Card.md) | Description of relationship with variable with strongest relationship for population | [optional] 
**optimalValueMessage** | **String** | Description of relationship with variable with strongest relationship for user or population | [optional] 
**commonOptimalValueMessage** | **String** | Description of relationship with variable with strongest relationship for population | [optional] 
**userOptimalValueMessage** | **String** | Description of relationship with variable with strongest relationship for user | [optional] 
**card** | [**Card**](Card.md) | Card containing instructions, image, text, link and relevant import buttons | [optional] 
**causeOnly** | **Boolean** | User-Defined Variable Setting: True indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user | [optional] 
**charts** | [**VariableCharts**](VariableCharts.md) |  | [optional] 
**chartsLinkDynamic** | **String** | Ex: https://local.quantimo.do/ionic/Modo/www/#/app/charts/Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29?variableName&#x3D;Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&amp;userId&#x3D;230&amp;pngUrl&#x3D;https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png | [optional] 
**chartsLinkEmail** | **String** | Ex: mailto:?subject&#x3D;Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21&amp;body&#x3D;See%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%0A%0AHave%20a%20great%20day! | [optional] 
**chartsLinkFacebook** | **String** | Ex: https://www.facebook.com/sharer/sharer.php?u&#x3D;https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png | [optional] 
**chartsLinkGoogle** | **String** | Ex: https://plus.google.com/share?url&#x3D;https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png | [optional] 
**chartsLinkStatic** | **String** | Ex: https://local.quantimo.do/api/v2/charts?variableName&#x3D;Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&amp;userId&#x3D;230&amp;pngUrl&#x3D;https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png | [optional] 
**chartsLinkTwitter** | **String** | Ex: https://twitter.com/home?status&#x3D;Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%20%40quantimodo | [optional] 
**childCommonTagVariables** | [**[Variable]**](Variable.md) | Commonly defined for all users. An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake. | [optional] 
**childUserTagVariables** | [**[Variable]**](Variable.md) | User-Defined Variable Setting: An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake. | [optional] 
**clientId** | **String** | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
**combinationOperation** | **String** | User-Defined Variable Setting: How to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED. | [optional] 
**commonAlias** | **String** | Ex: Anxiety / Nervousness | [optional] 
**commonTaggedVariables** | [**[Variable]**](Variable.md) |  | [optional] 
**commonTagVariables** | [**[Variable]**](Variable.md) |  | [optional] 
**createdAt** | **String** | When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format | [optional] 
**dataSourceNames** | **String** | Comma-separated list of source names to limit variables to those sources | [optional] 
**dataSources** | [**[DataSource]**](DataSource.md) | These are sources of measurements for this variable | [optional] 
**description** | **String** | User-Defined Variable Setting: Ex: Summary to be used in studies. | [optional] 
**displayName** | **String** | Ex: Trader Joe&#39;s Bedtime Tea | [optional] 
**durationOfAction** | **Number** | The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay. Unit: Seconds | [optional] 
**durationOfActionInHours** | **Number** | User-Defined Variable Setting: The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Hours | [optional] 
**earliestFillingTime** | **Number** | Earliest filling time | [optional] 
**earliestMeasurementTime** | **Number** | Earliest measurement time | [optional] 
**earliestSourceTime** | **Number** | Earliest source time | [optional] 
**errorMessage** | **String** | Error message from last analysis | [optional] 
**experimentEndTime** | **String** | User-Defined Variable Setting: Latest measurement time to be used in analysis. Format: UTC ISO 8601 YYYY-MM-DDThh:mm:ss. | [optional] 
**experimentStartTime** | **String** | User-Defined Variable Setting: Earliest measurement time to be used in analysis. Format: UTC ISO 8601 YYYY-MM-DDThh:mm:ss. | [optional] 
**fillingType** | **String** | User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven&#39;t taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing. | [optional] 
**fillingValue** | **Number** | User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven&#39;t taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.  Unit: User-specified or common. | [optional] 
**iconIcon** | **String** | Ex: ion-sad-outline | [optional] 
**id** | **Number** | Ex: 95614 | 
**imageUrl** | **String** | What do you expect? | [optional] 
**informationalUrl** | **String** | Ex: https://google.com | [optional] 
**ingredientOfCommonTagVariables** | [**[Variable]**](Variable.md) | Commonly defined for all users. IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you. | [optional] 
**ingredientCommonTagVariables** | [**[Variable]**](Variable.md) | Commonly defined for all users. IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you. | [optional] 
**ingredientOfUserTagVariables** | [**[Variable]**](Variable.md) | User-Defined Variable Setting: IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you. | [optional] 
**ingredientUserTagVariables** | [**[Variable]**](Variable.md) | User-Defined Variable Setting: IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you. | [optional] 
**inputType** | **String** | Type of input field to show for recording measurements | [optional] 
**ionIcon** | **String** | What do you expect? | [optional] 
**joinedCommonTagVariables** | [**[Variable]**](Variable.md) | Commonly defined for all users.  Joining can be used used to merge duplicate variables. For instance, if two variables called Apples (Red Delicious) and Red Delicious Apples are joined, when one of them is analyzed, the measurements for the other will be included as well. | [optional] 
**joinedUserTagVariables** | [**[Variable]**](Variable.md) | User-Defined Variable Setting: Joining can be used used to merge duplicate variables. For instance, if two variables called Apples (Red Delicious) and Red Delicious Apples are joined, when one of them is analyzed, the measurements for the other will be included as well. | [optional] 
**joinWith** | **Number** | Duplicate variables. If the variable is joined with some other variable then it is not shown to user in the list of variables | [optional] 
**kurtosis** | **Number** | Kurtosis | [optional] 
**lastProcessedDailyValue** | **Number** | Calculated Statistic: Ex: 500. Unit: User-specified or common. | [optional] 
**lastSuccessfulUpdateTime** | **String** | When this variable or its settings were last updated UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**lastValue** | **Number** | Calculated Statistic: Last measurement value in the common unit or user unit if different. Unit: User-specified or common. | [optional] 
**latestFillingTime** | **Number** | Latest filling time | [optional] 
**latestMeasurementTime** | **Number** | Latest measurement time. Format: Unix-time epoch seconds. | [optional] 
**latestSourceTime** | **Number** | Latest source time. Format: Unix-time epoch seconds. | [optional] 
**latestUserMeasurementTime** | **Number** | Ex: 1501383600. Format: Unix-time epoch seconds. | [optional] 
**latitude** | **Number** | Latitude. Unit: User-specified or common. | [optional] 
**location** | **String** | Location | [optional] 
**longitude** | **Number** | Longitude | [optional] 
**manualTracking** | **Boolean** | True if the variable is an emotion or symptom rating that is not typically automatically collected by a device or app. | [optional] 
**maximumAllowedDailyValue** | **Number** | User-Defined Variable Setting: The maximum allowed value a daily aggregated measurement. Unit: User-specified or common. | [optional] 
**maximumAllowedValue** | **Number** | User-Defined Variable Setting: The maximum allowed value a single measurement. While you can record a value above this maximum, it will be excluded from the correlation analysis.  Unit: User-specified or common. | [optional] 
**maximumRecordedDailyValue** | **Number** | Calculated Statistic: Maximum recorded daily value of this variable. Unit: User-specified or common. | [optional] 
**maximumRecordedValue** | **Number** | Calculated Statistic: Ex: 1. Unit: User-specified or common. | [optional] 
**mean** | **Number** | Mean. Unit: User-specified or common. | [optional] 
**measurementsAtLastAnalysis** | **Number** | Number of measurements at last analysis | [optional] 
**median** | **Number** | Median | [optional] 
**minimumAllowedValue** | **Number** | User-Defined Variable Setting: The minimum allowed value a single measurement. While you can record a value below this minimum, it will be excluded from the correlation analysis. Unit: User-specified or common | [optional] 
**minimumAllowedDailyValue** | **Number** | User-Defined Variable Setting: The minimum allowed value a daily aggregated measurement.  For instance, you might set to 100 for steps to keep erroneous 0 daily steps out of the analysis. Unit: User-specified or common. | [optional] 
**minimumNonZeroValue** | **Number** | User-Defined Variable Setting: The minimum allowed non-zero value a single measurement.  For instance, you might set to 100 mL for steps to keep erroneous 0 daily steps out of the analysis. Unit: User-specified or common. | [optional] 
**minimumRecordedValue** | **Number** | Minimum recorded value of this variable. Unit: User-specified or common. | [optional] 
**mostCommonConnectorId** | **Number** | Ex: 51 | [optional] 
**mostCommonOriginalUnitId** | **Number** | Ex: 23 | [optional] 
**mostCommonUnitId** | **Number** | Most common Unit ID | [optional] 
**mostCommonValue** | **Number** | Calculated Statistic: Most common value. Unit: User-specified or common. | [optional] 
**name** | **String** | Ex: Trader Joes Bedtime Tea / Sleepytime Tea (any Brand) | 
**numberOfAggregateCorrelationsAsCause** | **Number** | Ex: 1 | [optional] 
**numberOfAggregateCorrelationsAsEffect** | **Number** | Ex: 310 | [optional] 
**numberOfChanges** | **Number** | Number of changes | [optional] 
**numberOfCorrelations** | **Number** | Number of correlations for this variable | [optional] 
**numberOfCorrelationsAsCause** | **Number** | numberOfAggregateCorrelationsAsCause plus numberOfUserCorrelationsAsCause | [optional] 
**numberOfCorrelationsAsEffect** | **Number** | numberOfAggregateCorrelationsAsEffect plus numberOfUserCorrelationsAsEffect | [optional] 
**numberOfProcessedDailyMeasurements** | **Number** | Number of processed measurements | [optional] 
**numberOfRawMeasurements** | **Number** | Ex: 295 | [optional] 
**numberOfTrackingReminders** | **Number** | Ex: 1 | [optional] 
**numberOfUniqueDailyValues** | **Number** | Number of unique daily values | [optional] 
**numberOfUniqueValues** | **Number** | Ex: 2 | [optional] 
**numberOfUserCorrelationsAsCause** | **Number** | Ex: 115 | [optional] 
**numberOfUserCorrelationsAsEffect** | **Number** | Ex: 29014 | [optional] 
**numberOfUserVariables** | **Number** | Ex: 2 | [optional] 
**onsetDelay** | **Number** | The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes. | [optional] 
**onsetDelayInHours** | **Number** | User-Defined Variable Setting: The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes. | [optional] 
**outcome** | **Boolean** | User-Defined Variable Setting: True for variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables | [optional] 
**outcomeOfInterest** | **Boolean** | Do you want to receive updates on newly discovered factors influencing this variable? | [optional] 
**parentCommonTagVariables** | [**[Variable]**](Variable.md) | Commonly defined for all users.  An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake. | [optional] 
**parentUserTagVariables** | [**[Variable]**](Variable.md) | User-defined. An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake. | [optional] 
**pngPath** | **String** | Ex: img/variable_categories/treatments.png | [optional] 
**pngUrl** | **String** | Ex: https://web.quantimo.do/img/variable_categories/treatments.png | [optional] 
**predictorOfInterest** | **Number** | Ex: 0 | [optional] 
**price** | **Number** | Ex: 95.4 | [optional] 
**productUrl** | **String** | Link to associated product for purchase | [optional] 
**_public** | **Boolean** | Should this variable show up in automcomplete searches for users who do not already have measurements for it? | [optional] 
**question** | **String** | Ex: How is your overall mood? | [optional] 
**longQuestion** | **String** | Ex: How is your overall mood on a scale of 1 to 5?? | [optional] 
**rawMeasurementsAtLastAnalysis** | **Number** | Ex: 131 | [optional] 
**secondMostCommonValue** | **Number** | Calculated Statistic: Ex: 1. Unit: User-specified or common. | [optional] 
**secondToLastValue** | **Number** | Calculated Statistic: Ex: 250. Unit: User-specified or common. | [optional] 
**shareUserMeasurements** | **Boolean** | Would you like to make your measurements publicly visible? | [optional] 
**skewness** | **Number** | Skewness | [optional] 
**standardDeviation** | **Number** | Standard deviation Ex: 0.46483219855434 | [optional] 
**status** | **String** | status | [optional] 
**subtitle** | **String** | Based on sort filter and can be shown beneath variable name on search list | [optional] 
**svgUrl** | **String** | Ex: https://web.quantimo.do/img/variable_categories/treatments.svg | [optional] 
**thirdMostCommonValue** | **Number** | Calculated Statistic: Ex: 6. Unit: User-specified or common. | [optional] 
**thirdToLastValue** | **Number** | Calculated Statistic: Ex: 250. Unit: User-specified or common. | [optional] 
**trackingInstructions** | **String** | HTML instructions for tracking | [optional] 
**trackingInstructionsCard** | [**Card**](Card.md) | Instructions for tracking with buttons and images | [optional] 
**unit** | [**Unit**](Unit.md) |  | [optional] 
**unitAbbreviatedName** | **String** | Ex: count | [optional] 
**unitCategoryId** | **Number** | Ex: 6 | [optional] 
**unitCategoryName** | **String** | Ex: Miscellany | [optional] 
**unitId** | **Number** | ID of unit to use for this variable | [optional] 
**unitName** | **String** | User-Defined Variable Setting: Count | [optional] 
**upc** | **String** | Universal product code or similar | [optional] 
**updated** | **Number** | updated | [optional] 
**updatedAt** | **String** | When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format | [optional] 
**updatedTime** | **String** | Ex: 2017-07-30 14:58:26 | [optional] 
**userId** | **Number** | User ID | 
**userTaggedVariables** | [**[Variable]**](Variable.md) |  | [optional] 
**userTagVariables** | [**[Variable]**](Variable.md) |  | [optional] 
**userVariableUnitAbbreviatedName** | **String** | Ex: count | [optional] 
**userVariableUnitCategoryId** | **Number** | Ex: 6 | [optional] 
**userVariableUnitCategoryName** | **String** | Ex: Miscellany | [optional] 
**userVariableUnitId** | **Number** | Ex: 23 | [optional] 
**userVariableUnitName** | **String** | Ex: Count | [optional] 
**variableCategory** | [**VariableCategory**](VariableCategory.md) |  | [optional] 
**joinedVariables** | [**[Variable]**](Variable.md) | Array of Variables that are joined with this Variable | [optional] 
**valence** | **String** | Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.  | [optional] 
**variableCategoryId** | **Number** | Ex: 6 | [optional] 
**variableCategoryName** | **String** | User-Defined Variable Setting: Variable category like Emotions, Sleep, Physical Activities, Treatments, Symptoms, etc. | [optional] 
**variableId** | **Number** | Ex: 96380 | 
**variableName** | **String** | Ex: Sleep Duration | [optional] 
**variance** | **Number** | Statistic: Ex: 115947037.40816 | [optional] 
**wikipediaTitle** | **String** | User-Defined Variable Setting: You can help to improve the studies by pasting the title of the most appropriate Wikipedia article for this variable | [optional] 


<a name="CombinationOperationEnum"></a>
## Enum: CombinationOperationEnum


* `MEAN` (value: `"MEAN"`)

* `SUM` (value: `"SUM"`)




<a name="FillingTypeEnum"></a>
## Enum: FillingTypeEnum


* `none` (value: `"none"`)

* `zero-filling` (value: `"zero-filling"`)

* `value-filling` (value: `"value-filling"`)




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




