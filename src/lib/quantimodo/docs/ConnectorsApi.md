# Quantimodo.ConnectorsApi

All URIs are relative to *https://app.quantimo.do/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**connectConnector**](ConnectorsApi.md#connectConnector) | **GET** /v3/connectors/{connectorName}/connect | Obtain a token from 3rd party data source
[**disconnectConnector**](ConnectorsApi.md#disconnectConnector) | **GET** /v3/connectors/{connectorName}/disconnect | Delete stored connection info
[**getConnectors**](ConnectorsApi.md#getConnectors) | **GET** /v3/connectors/list | List of Connectors
[**getIntegrationJs**](ConnectorsApi.md#getIntegrationJs) | **GET** /v3/integration.js | Get embeddable connect javascript
[**getMobileConnectPage**](ConnectorsApi.md#getMobileConnectPage) | **GET** /v3/connect/mobile | Mobile connect page
[**updateConnector**](ConnectorsApi.md#updateConnector) | **GET** /v3/connectors/{connectorName}/update | Sync with data source


<a name="connectConnector"></a>
# **connectConnector**
> connectConnector(connectorName, opts)

Obtain a token from 3rd party data source

Attempt to obtain a token from the data provider, store it in the database. With this, the connector to continue to obtain new user data until the token is revoked.

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

var apiInstance = new Quantimodo.ConnectorsApi();

var connectorName = "connectorName_example"; // String | Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.

var opts = { 
  'userId': 8.14, // Number | User's id
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.connectConnector(connectorName, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectorName** | **String**| Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint. | 
 **userId** | **Number**| User&#39;s id | [optional] 

### Return type

null (empty response body)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="disconnectConnector"></a>
# **disconnectConnector**
> disconnectConnector(connectorName)

Delete stored connection info

The disconnect method deletes any stored tokens or connection information from the connectors database.

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

var apiInstance = new Quantimodo.ConnectorsApi();

var connectorName = "connectorName_example"; // String | Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.disconnectConnector(connectorName, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectorName** | **String**| Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint. | 

### Return type

null (empty response body)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getConnectors"></a>
# **getConnectors**
> GetConnectorsResponse getConnectors(opts)

List of Connectors

A connector pulls data from other data providers using their API or a screenscraper. Returns a list of all available connectors and information about them such as their id, name, whether the user has provided access, logo url, connection instructions, and the update history.

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

var apiInstance = new Quantimodo.ConnectorsApi();

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
apiInstance.getConnectors(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

[**GetConnectorsResponse**](GetConnectorsResponse.md)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getIntegrationJs"></a>
# **getIntegrationJs**
> getIntegrationJs(opts)

Get embeddable connect javascript

Get embeddable connect javascript. Usage:   - Embedding in applications with popups for 3rd-party authentication windows.     Use &#x60;qmSetupInPopup&#x60; function after connecting &#x60;connect.js&#x60;.   - Embedding in applications with popups for 3rd-party authentication windows.     Requires a selector to block. It will be embedded in this block.     Use &#x60;qmSetupOnPage&#x60; function after connecting &#x60;connect.js&#x60;.   - Embedding in mobile applications without popups for 3rd-party authentication.     Use &#x60;qmSetupOnMobile&#x60; function after connecting &#x60;connect.js&#x60;.     If using in a Cordova application call  &#x60;qmSetupOnIonic&#x60; function after connecting &#x60;connect.js&#x60;.

### Example
```javascript
var Quantimodo = require('quantimodo');

var apiInstance = new Quantimodo.ConnectorsApi();

var opts = { 
  'clientId': "clientId_example", // String | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
  'platform': "platform_example" // String | Ex: chrome, android, ios, web
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.getIntegrationJs(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clientId** | **String**| Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 
 **platform** | **String**| Ex: chrome, android, ios, web | [optional] 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/x-javascript

<a name="getMobileConnectPage"></a>
# **getMobileConnectPage**
> getMobileConnectPage(opts)

Mobile connect page

This page is designed to be opened in a webview.  Instead of using popup authentication boxes, it uses redirection. You can include the user&#39;s access_token as a URL parameter like https://app.quantimo.do/api/v3/connect/mobile?access_token&#x3D;123

### Example
```javascript
var Quantimodo = require('quantimodo');

var apiInstance = new Quantimodo.ConnectorsApi();

var opts = { 
  'userId': 8.14, // Number | User's id
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.getMobileConnectPage(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **Number**| User&#39;s id | [optional] 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

<a name="updateConnector"></a>
# **updateConnector**
> updateConnector(connectorName, opts)

Sync with data source

The update method tells the QM Connector Framework to check with the data provider (such as Fitbit or MyFitnessPal) and retrieve any new measurements available.

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

var apiInstance = new Quantimodo.ConnectorsApi();

var connectorName = "connectorName_example"; // String | Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.

var opts = { 
  'userId': 8.14, // Number | User's id
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.updateConnector(connectorName, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectorName** | **String**| Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint. | 
 **userId** | **Number**| User&#39;s id | [optional] 

### Return type

null (empty response body)

### Authorization

[access_token](../README.md#access_token), [quantimodo_oauth2](../README.md#quantimodo_oauth2)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

