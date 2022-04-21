# Quantimodo.SharesApi

All URIs are relative to *https://app.quantimo.do/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteShare**](SharesApi.md#deleteShare) | **POST** /v3/shares/delete | Delete share
[**getShares**](SharesApi.md#getShares) | **GET** /v3/shares | Get Authorized Apps, Studies, and Individuals
[**inviteShare**](SharesApi.md#inviteShare) | **POST** /v3/shares/invite | Delete share


<a name="deleteShare"></a>
# **deleteShare**
> User deleteShare(clientIdToRevoke, opts)

Delete share

Remove access to user data for a given client_id associated with a given individual, app, or study

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

var apiInstance = new Quantimodo.SharesApi();

var clientIdToRevoke = "clientIdToRevoke_example"; // String | Client id of the individual, study, or app that the user wishes to no longer have access to their data

var opts = { 
  'reason': "reason_example", // String | Ex: I hate you!
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.deleteShare(clientIdToRevoke, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clientIdToRevoke** | **String**| Client id of the individual, study, or app that the user wishes to no longer have access to their data | 
 **reason** | **String**| Ex: I hate you! | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**User**](User.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getShares"></a>
# **getShares**
> GetSharesResponse getShares(opts)

Get Authorized Apps, Studies, and Individuals

This is a list of individuals, apps, or studies with access to your measurements.

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

var apiInstance = new Quantimodo.SharesApi();

var opts = { 
  'userId': 8.14, // Number | User's id
  'createdAt': "createdAt_example", // String | When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
  'updatedAt': "updatedAt_example", // String | When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'appVersion': "appVersion_example", // String | Ex: 2.1.1.0
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'log': "log_example", // String | Username or email
  'pwd': "pwd_example" // String | User password
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.getShares(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **Number**| User&#39;s id | [optional] 
 **createdAt** | **String**| When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local. | [optional] 
 **updatedAt** | **String**| When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local. | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **appVersion** | **String**| Ex: 2.1.1.0 | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **log** | **String**| Username or email | [optional] 
 **pwd** | **String**| User password | [optional] 

### Return type

[**GetSharesResponse**](GetSharesResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="inviteShare"></a>
# **inviteShare**
> User inviteShare(body, opts)

Delete share

Invite someone to view your measurements

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

var apiInstance = new Quantimodo.SharesApi();

var body = new Quantimodo.ShareInvitationBody(); // ShareInvitationBody | Details about person to share with

var opts = { 
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.inviteShare(body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ShareInvitationBody**](ShareInvitationBody.md)| Details about person to share with | 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 

### Return type

[**User**](User.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

