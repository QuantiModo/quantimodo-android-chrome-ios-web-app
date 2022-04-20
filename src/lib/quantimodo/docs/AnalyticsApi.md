# Quantimodo.AnalyticsApi

All URIs are relative to *https://app.quantimo.do/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getCorrelationExplanations**](AnalyticsApi.md#getCorrelationExplanations) | **GET** /v3/correlations/explanations | Get correlation explanations
[**getCorrelations**](AnalyticsApi.md#getCorrelations) | **GET** /v3/correlations | Get correlations


<a name="getCorrelationExplanations"></a>
# **getCorrelationExplanations**
> [Correlation] getCorrelationExplanations(opts)

Get correlation explanations

Get explanations of  correlations based on data from a single user.

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

var apiInstance = new Quantimodo.AnalyticsApi();

var opts = { 
  'causeVariableName': "causeVariableName_example", // String | Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'effectVariableName': "effectVariableName_example", // String | Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
  'causeVariableId': 56, // Number | Variable id of the hypothetical predictor variable.  Ex: 1398
  'effectVariableId': 56, // Number | Variable id of the outcome variable of interest.  Ex: 1398
  'predictorVariableName': "predictorVariableName_example", // String | Name of the hypothetical predictor variable.  Ex: Sleep Duration
  'outcomeVariableName': "outcomeVariableName_example", // String | Name of the outcome variable of interest.  Ex: Overall Mood
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getCorrelationExplanations(opts, callback);
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

### Return type

[**[Correlation]**](Correlation.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getCorrelations"></a>
# **getCorrelations**
> GetCorrelationsResponse getCorrelations(opts)

Get correlations

Get a list of correlations that can be used to display top predictors of a given outcome like mood, for instance.

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

var apiInstance = new Quantimodo.AnalyticsApi();

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
  'commonOnly': true, // Boolean | Return only public, anonymized and aggregated population data instead of user-specific variables
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getCorrelations(opts, callback);
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
 **commonOnly** | **Boolean**| Return only public, anonymized and aggregated population data instead of user-specific variables | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**GetCorrelationsResponse**](GetCorrelationsResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

