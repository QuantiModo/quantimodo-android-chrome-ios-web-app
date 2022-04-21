# Quantimodo.StudiesApi

All URIs are relative to *https://app.quantimo.do/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createStudy**](StudiesApi.md#createStudy) | **POST** /v3/study/create | Create a Study
[**deleteVote**](StudiesApi.md#deleteVote) | **DELETE** /v3/votes/delete | Delete vote
[**getOpenStudies**](StudiesApi.md#getOpenStudies) | **GET** /v3/studies/open | These are open studies that anyone can join
[**getStudies**](StudiesApi.md#getStudies) | **GET** /v3/studies | Get Personal or Population Studies
[**getStudiesCreated**](StudiesApi.md#getStudiesCreated) | **GET** /v3/studies/created | Get studies you have created
[**getStudiesJoined**](StudiesApi.md#getStudiesJoined) | **GET** /v3/studies/joined | Studies You Have Joined
[**getStudy**](StudiesApi.md#getStudy) | **GET** /v4/study | Get Study
[**joinStudy**](StudiesApi.md#joinStudy) | **POST** /v3/study/join | Join a Study
[**postVote**](StudiesApi.md#postVote) | **POST** /v3/votes | Post or update vote
[**publishStudy**](StudiesApi.md#publishStudy) | **POST** /v3/study/publish | Publish Your Study


<a name="createStudy"></a>
# **createStudy**
> PostStudyCreateResponse createStudy(body, opts)

Create a Study

Create an individual, group, or population study examining the relationship between a predictor and outcome variable. You will be given a study id which you can invite participants to join and share their measurements for the specified variables.

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var body = new Quantimodo.StudyCreationBody(); // StudyCreationBody | Details about the study you want to create

var opts = { 
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.createStudy(body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**StudyCreationBody**](StudyCreationBody.md)| Details about the study you want to create | 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**PostStudyCreateResponse**](PostStudyCreateResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="deleteVote"></a>
# **deleteVote**
> CommonResponse deleteVote(body, opts)

Delete vote

Delete previously posted vote

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var body = new Quantimodo.VoteDelete(); // VoteDelete | The cause and effect variable names for the predictor vote to be deleted.

var opts = { 
  'userId': 8.14, // Number | User's id
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.deleteVote(body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**VoteDelete**](VoteDelete.md)| The cause and effect variable names for the predictor vote to be deleted. | 
 **userId** | **Number**| User&#39;s id | [optional] 

### Return type

[**CommonResponse**](CommonResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getOpenStudies"></a>
# **getOpenStudies**
> GetStudiesResponse getOpenStudies(opts)

These are open studies that anyone can join

These are studies that anyone can join and share their data for the predictor and outcome variables of interest.

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'userId': 8.14, // Number | User's id
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'includeCharts': true, // Boolean | Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'recalculate': true, // Boolean | Recalculate instead of using cached analysis
  'studyId': "studyId_example" // String | Client id for the study you want
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getOpenStudies(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **includeCharts** | **Boolean**| Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided. | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **recalculate** | **Boolean**| Recalculate instead of using cached analysis | [optional] 
 **studyId** | **String**| Client id for the study you want | [optional] 

### Return type

[**GetStudiesResponse**](GetStudiesResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getStudies"></a>
# **getStudies**
> GetStudiesResponse getStudies(opts)

Get Personal or Population Studies

If you have enough data, this will be a list of your personal studies, otherwise it will consist of aggregated population studies.

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'userId': 8.14, // Number | User's id
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'includeCharts': true, // Boolean | Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'recalculate': true, // Boolean | Recalculate instead of using cached analysis
  'studyId': "studyId_example" // String | Client id for the study you want
  'sort': "sort_example", // String | Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
  'limit': 100, // Number | The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
  'offset': 56, // Number | OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
  'correlationCoefficient': "correlationCoefficient_example", // String | Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
  'updatedAt': "updatedAt_example", // String | When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
  'outcomesOfInterest': true, // Boolean | Only include correlations for which the effect is an outcome of interest for the user
  'principalInvestigatorUserId': 56, // Number | These are studies created by a specific principal investigator
  'open': true, // Boolean | These are studies that anyone can join
  'joined': true, // Boolean | These are studies that you have joined
  'created': true, // Boolean | These are studies that you have created
  'population': true, // Boolean | These are studies based on the entire population of users that have shared their data
  'downvoted': true // Boolean | These are studies that you have down-voted
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getStudies(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **includeCharts** | **Boolean**| Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided. | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **recalculate** | **Boolean**| Recalculate instead of using cached analysis | [optional] 
 **studyId** | **String**| Client id for the study you want | [optional] 
 **sort** | **String**| Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order. | [optional] 
 **limit** | **Number**| The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. | [optional] [default to 100]
 **offset** | **Number**| OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned. | [optional] 
 **correlationCoefficient** | **String**| Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action | [optional] 
 **updatedAt** | **String**| When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local. | [optional] 
 **outcomesOfInterest** | **Boolean**| Only include correlations for which the effect is an outcome of interest for the user | [optional] 
 **principalInvestigatorUserId** | **Number**| These are studies created by a specific principal investigator | [optional] 
 **open** | **Boolean**| These are studies that anyone can join | [optional] 
 **joined** | **Boolean**| These are studies that you have joined | [optional] 
 **created** | **Boolean**| These are studies that you have created | [optional] 
 **population** | **Boolean**| These are studies based on the entire population of users that have shared their data | [optional] 
 **downvoted** | **Boolean**| These are studies that you have down-voted | [optional] 

### Return type

[**GetStudiesResponse**](GetStudiesResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getStudiesCreated"></a>
# **getStudiesCreated**
> GetStudiesResponse getStudiesCreated(opts)

Get studies you have created

These are studies that you have created.

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'sort': "sort_example", // String | Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
  'limit': 100, // Number | The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
  'offset': 56, // Number | OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
  'userId': 8.14, // Number | User's id
  'updatedAt': "updatedAt_example", // String | When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getStudiesCreated(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **sort** | **String**| Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order. | [optional] 
 **limit** | **Number**| The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. | [optional] [default to 100]
 **offset** | **Number**| OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned. | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **updatedAt** | **String**| When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local. | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**GetStudiesResponse**](GetStudiesResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getStudiesJoined"></a>
# **getStudiesJoined**
> GetStudiesResponse getStudiesJoined(opts)

Studies You Have Joined

These are studies that you are currently sharing your data with.

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'sort': "sort_example", // String | Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
  'limit': 100, // Number | The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
  'offset': 56, // Number | OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
  'userId': 8.14, // Number | User's id
  'correlationCoefficient': "correlationCoefficient_example", // String | Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
  'updatedAt': "updatedAt_example", // String | When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
  'outcomesOfInterest': true, // Boolean | Only include correlations for which the effect is an outcome of interest for the user
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getStudiesJoined(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **sort** | **String**| Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order. | [optional] 
 **limit** | **Number**| The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. | [optional] [default to 100]
 **offset** | **Number**| OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned. | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **correlationCoefficient** | **String**| Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action | [optional] 
 **updatedAt** | **String**| When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local. | [optional] 
 **outcomesOfInterest** | **Boolean**| Only include correlations for which the effect is an outcome of interest for the user | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**GetStudiesResponse**](GetStudiesResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getStudy"></a>
# **getStudy**
> Study getStudy(opts)

Get Study

Get Study

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'userId': 8.14, // Number | User's id
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'includeCharts': true, // Boolean | Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'recalculate': true, // Boolean | Recalculate instead of using cached analysis
  'studyId': "studyId_example" // String | Client id for the study you want
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getStudy(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **includeCharts** | **Boolean**| Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided. | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **recalculate** | **Boolean**| Recalculate instead of using cached analysis | [optional] 
 **studyId** | **String**| Client id for the study you want | [optional] 

### Return type

[**Study**](Study.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="joinStudy"></a>
# **joinStudy**
> StudyJoinResponse joinStudy(opts)

Join a Study

Anonymously share measurements for specified variables

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'studyId': "studyId_example" // String | Client id for the study you want
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'userId': 8.14, // Number | User's id
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.joinStudy(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **studyId** | **String**| Client id for the study you want | [optional] 
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**StudyJoinResponse**](StudyJoinResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="postVote"></a>
# **postVote**
> CommonResponse postVote(body, opts)

Post or update vote

I am really good at finding correlations and even compensating for various onset delays and durations of action. However, you are much better than me at knowing if there&#39;s a way that a given factor could plausibly influence an outcome. You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you think are coincidences and thumbs up once that make logic sense.

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var body = new Quantimodo.Vote(); // Vote | Contains the cause variable, effect variable, and vote value.

var opts = { 
  'userId': 8.14, // Number | User's id
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.postVote(body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Vote**](Vote.md)| Contains the cause variable, effect variable, and vote value. | 
 **userId** | **Number**| User&#39;s id | [optional] 

### Return type

[**CommonResponse**](CommonResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="publishStudy"></a>
# **publishStudy**
> PostStudyPublishResponse publishStudy(opts)

Publish Your Study

Make a study and all related measurements publicly visible by anyone

### Example
```javascript
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix = 'Token';

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = 'YOUR ACCESS TOKEN';

var apiInstance = new Quantimodo.StudiesApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
  'userId': 8.14, // Number | User's id
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'includeCharts': true, // Boolean | Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'recalculate': true, // Boolean | Recalculate instead of using cached analysis
  'studyId': "studyId_example" // String | Client id for the study you want
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.publishStudy(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **causeVariableName** | **String**| Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **effectVariableName** | **String**| Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **causeVariableId** | **Number**| Variable id of the hypothetical predictor variable.  Ex: 1398 | [optional] 
 **effectVariableId** | **Number**| Variable id of the outcome variable of interest.  Ex: 1398 | [optional] 
 **predictorVariableName** | **String**| Name of the hypothetical predictor variable.  Ex: Sleep Duration | [optional] 
 **outcomeVariableName** | **String**| Name of the outcome variable of interest.  Ex: Overall Mood | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **includeCharts** | **Boolean**| Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided. | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **recalculate** | **Boolean**| Recalculate instead of using cached analysis | [optional] 
 **studyId** | **String**| Client id for the study you want | [optional] 

### Return type

[**PostStudyPublishResponse**](PostStudyPublishResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

