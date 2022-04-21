# Quantimodo.DataSource

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**affiliate** | **Boolean** | Ex: true | 
**backgroundColor** | **String** | Background color HEX code that matches the icon | [optional] 
**buttons** | [**[Button]**](Button.md) |  | [optional] 
**card** | [**Card**](Card.md) | Card containing instructions, image, text, link and relevant import buttons | [optional] 
**clientId** | **String** | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
**connected** | **Boolean** | True if the authenticated user has this connector enabled | [optional] 
**connectError** | **String** | Ex: Your token is expired. Please re-connect | [optional] 
**connectInstructions** | [**ConnectInstructions**](ConnectInstructions.md) | URL and parameters used when connecting to a service | [optional] 
**connectorId** | **Number** | Ex: 8 | [optional] 
**connectStatus** | **String** | Ex: CONNECTED | [optional] 
**count** | **Number** | Number of measurements from this source or number of users who have measurements from this source | [optional] 
**createdAt** | **String** | Ex: 2000-01-01 00:00:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**connectorClientId** | **String** | Ex: ba7d0c12432650e23b3ce924ae2d21e2ff59e7e4e28650759633700af7ed0a30 | 
**defaultVariableCategoryName** | **String** | Ex: Foods | 
**displayName** | **String** | Ex: QuantiModo | 
**enabled** | **Number** | Ex: 0 | 
**getItUrl** | **String** | Ex: https://quantimo.do | 
**id** | **Number** | Ex: 72 | 
**image** | **String** | Ex: https://web.quantimo.do/img/logos/quantimodo-logo-qm-rainbow-200-200.png | 
**imageHtml** | **String** | Ex: &lt;a href&#x3D;\&quot;https://quantimo.do\&quot;&gt;&lt;img id&#x3D;\&quot;quantimodo_image\&quot; title&#x3D;\&quot;QuantiModo\&quot; src&#x3D;\&quot;https://web.quantimo.do/img/logos/quantimodo-logo-qm-rainbow-200-200.png\&quot; alt&#x3D;\&quot;QuantiModo\&quot;&gt;&lt;/a&gt; | 
**lastSuccessfulUpdatedAt** | **String** | Ex: 2017-07-31 10:10:34 UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**lastUpdate** | **Number** | Epoch timestamp of last sync | [optional] 
**linkedDisplayNameHtml** | **String** | Ex: &lt;a href&#x3D;\&quot;https://quantimo.do\&quot;&gt;QuantiModo&lt;/a&gt; | 
**longDescription** | **String** | Ex: QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values. | 
**message** | **String** | Ex: Got 412 new measurements on 2017-07-31 10:10:34 | [optional] 
**mobileConnectMethod** | **String** | Mobile connect method: webview, cordova, google, spreadsheet, or ip | [optional] 
**name** | **String** | Ex: quantimodo | 
**platforms** | **[String]** | Platforms (chrome, android, ios, web) that you can connect on. | [optional] 
**premium** | **Boolean** | True if connection requires upgrade | [optional] 
**scopes** | **[String]** | Required connector scopes | [optional] 
**shortDescription** | **String** | Ex: Tracks anything | 
**spreadsheetUploadLink** | **String** | URL to POST a spreadsheet to (if available for this data source) | [optional] 
**totalMeasurementsInLastUpdate** | **Number** | Number of measurements obtained during latest update | [optional] 
**updatedAt** | **String** | Ex: 2017-07-31 10:10:34 UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**updateRequestedAt** | **String** | Ex: 2017-07-18 05:16:31 UTC ISO 8601 YYYY-MM-DDThh:mm:ss | [optional] 
**updateStatus** | **String** | Ex: UPDATED | [optional] 
**userId** | **Number** | Ex: 230 | [optional] 


