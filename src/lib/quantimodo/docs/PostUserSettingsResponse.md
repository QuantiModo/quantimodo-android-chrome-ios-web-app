# Quantimodo.PostUserSettingsResponse

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**PostUserSettingsDataResponse**](PostUserSettingsDataResponse.md) |  | [optional] 
**message** | **String** | Message | [optional] 
**description** | **String** | Can be used as body of help info popup | [optional] 
**summary** | **String** | Can be used as title in help info popup | [optional] 
**errors** | [**[Error]**](Error.md) | Array of error objects with message property | [optional] 
**status** | **String** | ex. OK or ERROR | 
**success** | **Boolean** | true or false | 
**code** | **Number** | Response code such as 200 | [optional] 
**link** | **String** | A super neat url you might want to share with your users! | [optional] 
**card** | [**Card**](Card.md) | A super neat card with buttons and HTML that you can use in your app! | [optional] 


