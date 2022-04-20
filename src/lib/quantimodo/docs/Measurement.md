# Quantimodo.Measurement

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**card** | [**Card**](Card.md) | Card containing image, text, link and relevant buttons | [optional] 
**clientId** | **String** | Ex: quantimodo | [optional] 
**connectorId** | **Number** | Ex: 13 | [optional] 
**createdAt** | **String** | Ex: 2017-07-30 21:08:36 | [optional] 
**displayValueAndUnitString** | **String** | Examples: 3/5, $10, or 1 count | [optional] 
**iconIcon** | **String** | Ex: ion-sad-outline | [optional] 
**id** | **Number** | Ex: 1051466127 | [optional] 
**inputType** | **String** | Ex: value | [optional] 
**ionIcon** | **String** | Ex: ion-ios-medkit-outline | [optional] 
**manualTracking** | **Boolean** | Ex: 1 | [optional] 
**maximumAllowedValue** | **Number** | Ex: 5. Unit: User-specified or common. | [optional] 
**minimumAllowedValue** | **Number** | Ex: 1. Unit: User-specified or common. | [optional] 
**note** | **String** | Note of measurement | [optional] 
**noteObject** | **Object** | Additional meta data for the measurement | [optional] 
**noteHtml** | **Object** | Embeddable HTML with message hyperlinked with associated url | [optional] 
**originalUnitId** | **Number** | Ex: 23 | [optional] 
**originalValue** | **Number** | Original value submitted. Unit: Originally submitted. | [optional] 
**pngPath** | **String** | Ex: img/variable_categories/treatments.png | [optional] 
**pngUrl** | **String** | Ex: https://web.quantimo.do/img/variable_categories/treatments.png | [optional] 
**productUrl** | **String** | Link to associated product for purchase | [optional] 
**sourceName** | **String** | Application or device used to record the measurement values | 
**startDate** | **String** | Ex: 2014-08-27 | [optional] 
**startTimeEpoch** | **Number** | Seconds between the start of the event measured and 1970 (Unix timestamp) | [optional] 
**startTimeString** | **String** | Start Time for the measurement event in UTC ISO 8601 YYYY-MM-DDThh:mm:ss | 
**svgUrl** | **String** | Ex: https://web.quantimo.do/img/variable_categories/treatments.svg | [optional] 
**unitAbbreviatedName** | **String** | Abbreviated name for the unit of measurement | 
**unitCategoryId** | **Number** | Ex: 6 | [optional] 
**unitCategoryName** | **String** | Ex: Miscellany | [optional] 
**unitId** | **Number** | Ex: 23 | [optional] 
**unitName** | **String** | Ex: Count | [optional] 
**updatedAt** | **String** | Ex: 2017-07-30 21:08:36 | [optional] 
**url** | **String** | Link to associated Facebook like or Github commit, for instance | [optional] 
**userVariableUnitAbbreviatedName** | **String** | Ex: count | [optional] 
**userVariableUnitCategoryId** | **Number** | Ex: 6 | [optional] 
**userVariableUnitCategoryName** | **String** | Ex: Miscellany | [optional] 
**userVariableUnitId** | **Number** | Ex: 23 | [optional] 
**userVariableUnitName** | **String** | Ex: Count | [optional] 
**userVariableVariableCategoryId** | **Number** | Ex: 13 | [optional] 
**userVariableVariableCategoryName** | **String** | Ex: Treatments | [optional] 
**valence** | **String** | Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.  | [optional] 
**value** | **Number** | Converted measurement value in requested unit | 
**variableCategoryId** | **Number** | Ex: 13 | [optional] 
**variableCategoryImageUrl** | **String** | Ex: https://maxcdn.icons8.com/Color/PNG/96/Healthcare/pill-96.png | [optional] 
**variableCategoryName** | **String** | Ex: Emotions, Treatments, Symptoms... | [optional] 
**variableDescription** | **String** | Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.  | [optional] 
**variableId** | **Number** | Ex: 5956846 | [optional] 
**variableName** | **String** | Name of the variable for which we are creating the measurement records | 
**displayName** | **String** | Ex: Trader Joe&#39;s Bedtime Tea | [optional] 


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




