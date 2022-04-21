# Quantimodo.VariablesApi

All URIs are relative to *https://app.quantimo.do/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteUserTag**](VariablesApi.md#deleteUserTag) | **DELETE** /v3/userTags/delete | Delete user tag or ingredient
[**deleteUserVariable**](VariablesApi.md#deleteUserVariable) | **DELETE** /v3/userVariables/delete | Delete All Measurements For Variable
[**getVariableCategories**](VariablesApi.md#getVariableCategories) | **GET** /v3/variableCategories | Variable categories
[**getVariables**](VariablesApi.md#getVariables) | **GET** /v3/variables | Get variables along with related user-specific analysis settings and statistics
[**postUserTags**](VariablesApi.md#postUserTags) | **POST** /v3/userTags | Post or update user tags or ingredients
[**postUserVariables**](VariablesApi.md#postUserVariables) | **POST** /v3/variables | Update User Settings for a Variable
[**resetUserVariableSettings**](VariablesApi.md#resetUserVariableSettings) | **POST** /v3/userVariables/reset | Reset user settings for a variable to defaults


<a name="deleteUserTag"></a>
# **deleteUserTag**
> CommonResponse deleteUserTag(opts)

Delete user tag or ingredient

Delete previously created user tags or ingredients.

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

var apiInstance = new Quantimodo.VariablesApi();

var opts = { 
  'taggedVariableId': 56, // Number | Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
  'tagVariableId': 56, // Number | Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.deleteUserTag(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **taggedVariableId** | **Number**| Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient). | [optional] 
 **tagVariableId** | **Number**| Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient). | [optional] 

### Return type

[**CommonResponse**](CommonResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="deleteUserVariable"></a>
# **deleteUserVariable**
> deleteUserVariable(variableId)

Delete All Measurements For Variable

Users can delete all of their measurements for a variable

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

var apiInstance = new Quantimodo.VariablesApi();

var variableId = new Quantimodo.UserVariableDelete(); // UserVariableDelete | Id of the variable whose measurements should be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.deleteUserVariable(variableId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **variableId** | [**UserVariableDelete**](UserVariableDelete.md)| Id of the variable whose measurements should be deleted | 

### Return type

null (empty response body)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getVariableCategories"></a>
# **getVariableCategories**
> [VariableCategory] getVariableCategories()

Variable categories

The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Goals.

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

var apiInstance = new Quantimodo.VariablesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getVariableCategories(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**[VariableCategory]**](VariableCategory.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getVariables"></a>
# **getVariables**
> [Variable] getVariables(opts)

Get variables along with related user-specific analysis settings and statistics

Get variables. If the user has specified variable settings, these are provided instead of the common variable defaults.

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

var apiInstance = new Quantimodo.VariablesApi();

var opts = { 
  'includeCharts': true, // Boolean | Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
  'numberOfRawMeasurements': "numberOfRawMeasurements_example", // String | Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
  'userId': 8.14, // Number | User's id
  'variableCategoryName': "variableCategoryName_example", // String | Ex: Emotions, Treatments, Symptoms...
  'name': "name_example", // String | Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain `Mood`, the following query should be used: ?variableName=%Mood%
  'variableName': "variableName_example", // String | Name of the variable you want measurements for
  'updatedAt': "updatedAt_example", // String | When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
  'sourceName': "sourceName_example", // String | ID of the source you want measurements for (supports exact name match only)
  'earliestMeasurementTime': "earliestMeasurementTime_example", // String | Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
  'latestMeasurementTime': "latestMeasurementTime_example", // String | Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
  'id': 56, // Number | Common variable id
  'lastSourceName': "lastSourceName_example", // String | Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
  'limit': 100, // Number | The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
  'offset': 56, // Number | OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
  'sort': "sort_example", // String | Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
  'includePublic': true, // Boolean | Include variables the user has no measurements for
  'manualTracking': true, // Boolean | Only include variables tracked manually by the user
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'upc': "upc_example", // String | UPC or other barcode scan result
  'effectOrCause': "effectOrCause_example", // String | Provided variable is the effect or cause
  'publicEffectOrCause': "publicEffectOrCause_example", // String | Ex: 
  'exactMatch': true, // Boolean | Require exact match
  'variableCategoryId': 56, // Number | Ex: 13
  'includePrivate': true, // Boolean | Include user-specific variables in results
  'searchPhrase': "searchPhrase_example", // String | Ex: %Body Fat%
  'synonyms': "synonyms_example", // String | Ex: McDonalds hotcake
  'taggedVariableId': 56, // Number | Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
  'tagVariableId': 56, // Number | Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
  'joinVariableId': 56, // Number | Id of the variable you would like to get variables that can be joined to.  This is used to merge duplicate variables.   If joinVariableId is specified, this returns only variables eligible to be joined to the variable specified by the joinVariableId.
  'parentUserTagVariableId': 56, // Number | Id of the parent category variable (i.e. Fruit) you would like to get eligible child sub-type variables (i.e. Apple) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple.  When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.
  'childUserTagVariableId': 56, // Number | Id of the child sub-type variable (i.e. Apple) you would like to get eligible parent variables (i.e. Fruit) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple. When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.
  'ingredientUserTagVariableId': 56, // Number | Id of the ingredient variable (i.e. Fructose)  you would like to get eligible ingredientOf variables (i.e. Apple) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.
  'ingredientOfUserTagVariableId': 56, // Number | Id of the ingredientOf variable (i.e. Apple) you would like to get eligible ingredient variables (i.e. Fructose) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.
  'commonOnly': true, // Boolean | Return only public and aggregated common variable data instead of user-specific variables
  'userOnly': true, // Boolean | Return only user-specific variables and data, excluding common aggregated variable data
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'includeTags': true, // Boolean | Return parent, child, duplicate, and ingredient variables
  'recalculate': true, // Boolean | Recalculate instead of using cached analysis
  'variableId': 56, // Number | Ex: 13
  'concise': true, // Boolean | Only return field required for variable auto-complete searches.  The smaller size allows for storing more variable results locally reducing API requests.
  'refresh': true // Boolean | Regenerate charts instead of getting from the cache
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getVariables(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **includeCharts** | **Boolean**| Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided. | [optional] 
 **numberOfRawMeasurements** | **String**| Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity. | [optional] 
 **userId** | **Number**| User&#39;s id | [optional] 
 **variableCategoryName** | **String**| Ex: Emotions, Treatments, Symptoms... | [optional] 
 **name** | **String**| Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain &#x60;Mood&#x60;, the following query should be used: ?variableName&#x3D;%Mood% | [optional] 
 **variableName** | **String**| Name of the variable you want measurements for | [optional] 
 **updatedAt** | **String**| When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local. | [optional] 
 **sourceName** | **String**| ID of the source you want measurements for (supports exact name match only) | [optional] 
 **earliestMeasurementTime** | **String**| Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local. | [optional] 
 **latestMeasurementTime** | **String**| Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local. | [optional] 
 **id** | **Number**| Common variable id | [optional] 
 **lastSourceName** | **String**| Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here | [optional] 
 **limit** | **Number**| The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. | [optional] [default to 100]
 **offset** | **Number**| OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned. | [optional] 
 **sort** | **String**| Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order. | [optional] 
 **includePublic** | **Boolean**| Include variables the user has no measurements for | [optional] 
 **manualTracking** | **Boolean**| Only include variables tracked manually by the user | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **upc** | **String**| UPC or other barcode scan result | [optional] 
 **effectOrCause** | **String**| Provided variable is the effect or cause | [optional] 
 **publicEffectOrCause** | **String**| Ex:  | [optional] 
 **exactMatch** | **Boolean**| Require exact match | [optional] 
 **variableCategoryId** | **Number**| Ex: 13 | [optional] 
 **includePrivate** | **Boolean**| Include user-specific variables in results | [optional] 
 **searchPhrase** | **String**| Ex: %Body Fat% | [optional] 
 **synonyms** | **String**| Ex: McDonalds hotcake | [optional] 
 **taggedVariableId** | **Number**| Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient). | [optional] 
 **tagVariableId** | **Number**| Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient). | [optional] 
 **joinVariableId** | **Number**| Id of the variable you would like to get variables that can be joined to.  This is used to merge duplicate variables.   If joinVariableId is specified, this returns only variables eligible to be joined to the variable specified by the joinVariableId. | [optional] 
 **parentUserTagVariableId** | **Number**| Id of the parent category variable (i.e. Fruit) you would like to get eligible child sub-type variables (i.e. Apple) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple.  When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed. | [optional] 
 **childUserTagVariableId** | **Number**| Id of the child sub-type variable (i.e. Apple) you would like to get eligible parent variables (i.e. Fruit) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple. When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed. | [optional] 
 **ingredientUserTagVariableId** | **Number**| Id of the ingredient variable (i.e. Fructose)  you would like to get eligible ingredientOf variables (i.e. Apple) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple. | [optional] 
 **ingredientOfUserTagVariableId** | **Number**| Id of the ingredientOf variable (i.e. Apple) you would like to get eligible ingredient variables (i.e. Fructose) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple. | [optional] 
 **commonOnly** | **Boolean**| Return only public and aggregated common variable data instead of user-specific variables | [optional] 
 **userOnly** | **Boolean**| Return only user-specific variables and data, excluding common aggregated variable data | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **includeTags** | **Boolean**| Return parent, child, duplicate, and ingredient variables | [optional] 
 **recalculate** | **Boolean**| Recalculate instead of using cached analysis | [optional] 
 **variableId** | **Number**| Ex: 13 | [optional] 
 **concise** | **Boolean**| Only return field required for variable auto-complete searches.  The smaller size allows for storing more variable results locally reducing API requests. | [optional] 
 **refresh** | **Boolean**| Regenerate charts instead of getting from the cache | [optional] 

### Return type

[**[Variable]**](Variable.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="postUserTags"></a>
# **postUserTags**
> CommonResponse postUserTags(body, opts)

Post or update user tags or ingredients

This endpoint allows users to tag foods with their ingredients.  This information will then be used to infer the user intake of the different ingredients by just entering the foods. The inferred intake levels will then be used to determine the effects of different nutrients on the user during analysis.

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

var apiInstance = new Quantimodo.VariablesApi();

var body = new Quantimodo.UserTag(); // UserTag | Contains the new user tag data

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
apiInstance.postUserTags(body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**UserTag**](UserTag.md)| Contains the new user tag data | 
 **userId** | **Number**| User&#39;s id | [optional] 

### Return type

[**CommonResponse**](CommonResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="postUserVariables"></a>
# **postUserVariables**
> CommonResponse postUserVariables(userVariables, opts)

Update User Settings for a Variable

Users can change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.

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

var apiInstance = new Quantimodo.VariablesApi();

var userVariables = [new Quantimodo.Variable()]; // [Variable] | Variable user settings data

var opts = { 
  'includePrivate': true, // Boolean | Include user-specific variables in results
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'includePublic': true, // Boolean | Include variables the user has no measurements for
  'searchPhrase': "searchPhrase_example", // String | Ex: %Body Fat%
  'exactMatch': true, // Boolean | Require exact match
  'manualTracking': true, // Boolean | Only include variables tracked manually by the user
  'variableCategoryName': "variableCategoryName_example", // String | Ex: Emotions, Treatments, Symptoms...
  'variableCategoryId': 56, // Number | Ex: 13
  'synonyms': "synonyms_example", // String | Ex: McDonalds hotcake
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.postUserVariables(userVariables, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userVariables** | [**[Variable]**](Variable.md)| Variable user settings data | 
 **includePrivate** | **Boolean**| Include user-specific variables in results | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **includePublic** | **Boolean**| Include variables the user has no measurements for | [optional] 
 **searchPhrase** | **String**| Ex: %Body Fat% | [optional] 
 **exactMatch** | **Boolean**| Require exact match | [optional] 
 **manualTracking** | **Boolean**| Only include variables tracked manually by the user | [optional] 
 **variableCategoryName** | **String**| Ex: Emotions, Treatments, Symptoms... | [optional] 
 **variableCategoryId** | **Number**| Ex: 13 | [optional] 
 **synonyms** | **String**| Ex: McDonalds hotcake | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**CommonResponse**](CommonResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="resetUserVariableSettings"></a>
# **resetUserVariableSettings**
> resetUserVariableSettings(variableId)

Reset user settings for a variable to defaults

Reset user settings for a variable to defaults

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

var apiInstance = new Quantimodo.VariablesApi();

var variableId = new Quantimodo.UserVariableDelete(); // UserVariableDelete | Id of the variable whose measurements should be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.resetUserVariableSettings(variableId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **variableId** | [**UserVariableDelete**](UserVariableDelete.md)| Id of the variable whose measurements should be deleted | 

### Return type

null (empty response body)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

