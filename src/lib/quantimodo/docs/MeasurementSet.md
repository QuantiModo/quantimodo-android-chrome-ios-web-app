# Quantimodo.MeasurementSet

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**combinationOperation** | **String** | Way to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED. | [optional] 
**measurementItems** | [**[MeasurementItem]**](MeasurementItem.md) | Array of timestamps, values, and optional notes | 
**sourceName** | **String** | Name of the application or device used to record the measurement values | 
**unitAbbreviatedName** | **String** | Unit of measurement | 
**variableCategoryName** | **String** | Ex: Emotions, Treatments, Symptoms... | [optional] 
**variableName** | **String** | ORIGINAL name of the variable for which we are creating the measurement records | 
**upc** | **String** | UPC or other barcode scan result | [optional] 


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




