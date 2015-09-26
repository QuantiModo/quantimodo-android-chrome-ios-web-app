/*jshint -W069 */
/*global angular:false */
angular.module('', [])
    .factory('Test', ['$q', '$http', '$rootScope', function($q, $http, $rootScope) {
        'use strict';

        /**
     * 
Welcome to QuantiModo API!
QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://app.quantimo.do) or contact us at <api@quantimo.do>.

 Before you get started, you will need to:

 * Ceate an account at [QuantiModo](https://app.quantimo.do)

 * Sign in, and add some data at [https://app.quantimo.do/connect](https://app.quantimo.do/connect) to try out the API for yourself

 * As long as you're signed in, it will use your browser's cookie for authentication.  However, client applications must use OAuth2 tokens to access the API.

## Oauth2 Authentication
After receiving your `client_id` and `client_secret` by emailing at <info@quantimo.do> you can implement OAuth2 authentication to your application using our [OAuth2](#!/oauth2) endpoints.
### Request Authorization Code
Basically you need to redirect users to `/api/v1/oauth2/authorize` endpoint to get an authorization code with following parameters:
* `client_id` This is the unique ID that QuantiModo uses to identify your application.
* `scope` Scopes include basic, readmeasurements, and writemeasurements. The `basic` scope allows you to read user info (displayname, email, etc). The `readmeasurements` scope allows one to read a user's data. The `writemeasurements` scope allows you to write user data. Separate multiple scopes by a space.
* `redirect_uri` The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
* `state` An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI.
* `response_type` If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.

### Request Access Token
After user approves your access to the given scope, you'll recevive an authorization code to request an access token. This time make a `POST` request to `/api/v1/oauth2/token` with parameters including:
* `grant_type` Can be `authorization_code` or `refresh_token` since we are getting the `access_token` for the first time we don't have a `refresh_token` so this must be `authorization_code`.
* `client_id` The client id you used to receive an `authorization_code`.
* `client_secret` Your client secret which you received with the client id.
* `code` Authorization code you received with the previous request.
* `redirect_uri` Your application's redirect url.

### Refreshing Access Token
Access tokens expire at some point, to continue using our api you need to refresh them with `refresh_token` you received along with the `access_token`. To do this make a `POST` request to `/api/v1/oauth2/token` with correct parameters, which are:
* `grant_type` This time grant type must be `refresh_token` since we have it.
* `client_id` Your application's client id.
* `client_secret` Your application's client secret.
* `refresh_token` The refresh token you received with the `access_token`.

Every request you make to this endpoint will give you a new refresh token and make the old one expired. So you can keep getting new access tokens with new refresh tokens.

You can read more about OAuth2 from [here](http://oauth.net/2/)
## Example Queries
### Query Options
The standard query options for QuantiModo API are as described in the table below.
These are the available query options in QuantiModo API:
<table>
  <tr>
    <th>Parameter</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>limit</td>
    <td>The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.</td>
  </tr>
  <tr>
    <td>offset</td>
    <td>Suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.</td>
  </tr>
  <tr>
    <td>sort</td>
    <td>Sort by given field. If the field is prefixed with '-', it will sort in descending order.</td>
  </tr>
</table>
### Pagination Conventions
Since the maximum limit is 200 records, to get more than that you'll have to make multiple API calls and page through the results. To retrieve all the data, you can iterate through data by using the `limit` and `offset` query parameters.
For example, if you want to retrieve data from 61-80 then you can use a query with the following parameters,

 `/v1/variables?limit=20&offset=60`

Generally, youll be retrieving new or updated user data.  To avoid unnecessary API calls, youll want to store your last refresh time locally.  Initially, it should be set to 0.  Then whenever you make a request to get new data, you should limit the returned results to those updated since your last refresh by appending append

 `?lastUpdated=(ge)"2013-01-D01T01:01:01"`

to your request.

 Also for better pagination, you can get link to the records of first, last, next and previous page from response headers:

 * `Total-Count` - Total number of results for given query

 * `Link-First` - Link to get first page records

 * `Link-Last` - Link to get last page records

 * `Link-Prev` - Link to get previous records set

 * `Link-Next` - Link to get next records set


Remember, response header will be only sent when the record set is available. e.g. You will not get a ```Link-Last``` & ```Link-Next``` when you query for the last page.
### Sorting Results
To get data sorted by particular field:

 `/v1/variables?sort=lastUpdated`

It will sort data in ascending order. For descending order, you can add '-' prefix before field like:

 `/v1/variables?sort=-lastUpdated`

### Filter Parameters
Also, many endpoints support various filter parameters. You can filter out your result by specifying filter parameter.
For example, to get all variables within the "Mood" category, you would use:

 `/v1/variables?category=Mood`

Here is the complete list of filter parameters by endpoints:
#### /v1/correlations
<table>
  <tr>
    <th>Parameter</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>cause</td>
    <td>Original variable name of the hypothetical cause (a.k.a. explanatory or independent variable) for which the user desires correlations</td>
  </tr>
  <tr>
    <td>effect</td>
    <td>Original variable name of the hypothetical effect (a.k.a. outcome or dependent variable) for which the user desires correlations</td>
  </tr>
  <tr>
    <td>correlationCoefficient</td>
    <td>Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action</td>
  </tr>
  <tr>
    <td>onsetDelay</td>
    <td>The number of seconds which pass following a cause measurement before an effect would likely be observed.</td>
  </tr>
  <tr>
    <td>durationOfAction</td>
    <td>The time in seconds over which the cause would be expected to exert a measurable effect. We have selected a default value for each variable. This default value may be replaced by a user specified by adjusting their variable user settings.</td>
  </tr>
  <tr>
    <td>lastUpdated</td>
    <td>The time that this measurement was last updated in the UTC format "YYYY-MM-DDThh:mm:ss"</td>
  </tr>
</table>
#### /v1/measurements
<table>
  <tr>
    <th>Parameter</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>variableName</td>
    <td>Name of the variable you want measurements for (supports exact name match only)</td>
  </tr>
  <tr>
    <td>source</td>
    <td>Name of the source you want measurements for (supports exact name match only)</td>
  </tr>
  <tr>
    <td>value</td>
    <td>Value of measurement</td>
  </tr>
  <tr>
    <td>lastUpdated</td>
    <td>The time that this measurement was created or last updated in the UTC format "YYYY-MM-DDThh:mm:ss"</td>
  </tr>
</table>
#### /v1/units
<table>
  <tr>
    <th>Parameter</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>unitName</td>
    <td>Unit Name (supports exact name match only)</td>
  </tr>
  <tr>
    <td>abbreviatedUnitName</td>
    <td>Restrict the results to a specific unit by providing the unit abbreviation (supports exact name match only)</td>
  </tr>
  <tr>
    <td>categoryName</td>
    <td>Restrict the results to a specific unit category by providing the unit category name.</td>
  </tr>
</table>
#### /v1/variables
<table>
  <tr>
    <th>Parameter</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>category</td>
    <td>Restrict the results to a specific category by providing the variable category name such as "Nutrients" or "Physique". A complete list of variable categories can be obtained at the /variableCategories endpoint.</td>
  </tr>
  <tr>
    <td>name</td>
    <td>Original name of the variable (supports exact name match only)</td>
  </tr>
  <tr>
    <td>lastUpdated</td>
    <td>Filter by the last time any of the properties of the variable were changed. Uses UTC format "YYYY-MM-DDThh:mm:ss"</td>
  </tr>
  <tr>
    <td>source</td>
    <td>The name of the data source that created the variable (supports exact name match only). So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here</td>
  </tr>
  <tr>
    <td>latestMeasurementTime</td>
    <td>Filter variables based on the last time a measurement for them was created or updated in the UTC format "YYYY-MM-DDThh:mm:ss"</td>
  </tr>
  <tr>
    <td>numberOfMeasurements</td>
    <td>Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.</td>
  </tr>
  <tr>
    <td>lastSource</td>
    <td>Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here. (supports exact name match only)</td>
  </tr>
</table>
#### Filter operators support
API supports the following operators with filter parameters:
#### Comparison operators
Comparison operators allow you to limit results to those greater than, less than, or equal to a specified value for a specified attribute.   These operators can be used with strings, numbers, and dates.
The following comparison operators are available:
* `gt` for `greater than` comparison
* `ge` for `greater than or equal` comparison
* `lt` for `less than` comparison, e.g
* `le` for `less than or equal` comparison

They are included in queries using the following format:

 `(<operator>)<value>`

For example, in order to filter value which is greater than 21, the following query parameter should be used:

 `?value=(gt)21`

#### Equals/In Operators
It also allows filtering by the exact value of an attribute or by a set of values, depending on the type of value passed as a query parameter. If the value contains commas, the parameter is split on commas and used as array input for `IN` filtering, otherwise the exact match is applied.
In order to only show records which have the value 42, the following query should be used:

 `?value=42`

In order to filter records which have value 42 or 43, the following query should be used:

 `?value=42,43`

#### Like operators
Like operators allow filtering using `LIKE` query. This operator is triggered if exact match operator is used, but value contains `%` sign as the first or last character.
In order to filter records which category that start with `Food`, the following query should be used:

 `?category=Food%`

#### Negation operator
It is possible to get negated results of a query by prefixed the operator with `!`.
Some examples:

 `//filter records except those with value are not 42 or 43`<br>
 `?value=!42,43`

 `//filter records with value not greater than 21`<br>
 `?value=!(ge)21`

#### Multiple constraints for single attribute
It is possible to apply multiple constraints by providing an array of query filters:

 `// filter all records which value is greater than 20.2 and less than 20.3`<br>
`?value[]=(gt)20.2&value[]=(lt)20.3`
`// filter all records which value is greater than 20.2 and less than 20.3 but not 20.2778`<br> `?value[]=(gt)20.2&value[]=(lt)20.3&value[]=!20.2778`

<br>
     * @class Test
     * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
     * @param {string} [domainOrOptions.domain] - The project domain
     * @param {string} [domainOrOptions.cache] - An angularjs cache implementation
     * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
     * @param {string} [cache] - An angularjs cache implementation
     */
        var Test = (function() {
            function Test(options, cache) {
                var domain = (typeof options === 'object') ? options.domain : options;
                this.domain = typeof(domain) === 'string' ? domain : '';
                if (this.domain.length === 0) {
                    throw new Error('Domain parameter must be specified as a string.');
                }
                cache = cache || ((typeof options === 'object') ? options.cache : cache);
                this.cache = cache;
                this.token = (typeof options === 'object') ? (options.token ? options.token : {}) : {};
            }

            Test.prototype.$on = function($scope, path, handler) {
                var url = domain + path;
                $scope.$on(url, function() {
                    handler();
                });
                return this;
            };

            Test.prototype.$broadcast = function(path) {
                var url = domain + path;
                //cache.remove(url);
                $rootScope.$broadcast(url);
                return this;
            };

            Test.transformRequest = function(obj) {
                var str = [];
                for (var p in obj) {
                    var val = obj[p];
                    if (angular.isArray(val)) {
                        val.forEach(function(val) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(val));
                        });
                    } else {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(val));
                    }
                }
                return str.join("&");
            };

            /**
             * Set Token
             * @method
             * @name Test#setToken
             * @param {string} value - token's value
             * @param {string} headerOrQueryName - the header or query name to send the token at
             * @param {boolean} isQuery - true if send the token as query param, otherwise, send as header param
             *
             */
            Test.prototype.setToken = function(value, headerOrQueryName, isQuery) {
                this.token.value = value;
                this.token.headerOrQueryName = headerOrQueryName;
                this.token.isQuery = isQuery;
            };

            /**
             * Get embeddable connect javascript
             * @method
             * @name Test#getV1Connect.js
             * @param {string} t - User token
             * 
             */
            Test.prototype.getV1Connect.js = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connect.js';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (parameters['t'] !== undefined) {
                    queryParameters['t'] = parameters['t'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Mobile connect page
             * @method
             * @name Test#getV1ConnectMobile
             * @param {string} t - User token
             * 
             */
            Test.prototype.getV1ConnectMobile = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connect/mobile';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (parameters['t'] !== undefined) {
                    queryParameters['t'] = parameters['t'];
                }

                if (parameters['t'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: t'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * A connector pulls data from other data providers using their API or a screenscraper. Returns a list of all available connectors and information about them such as their id, name, whether the user has provided access, logo url, connection instructions, and the update history.
             * @method
             * @name Test#getV1ConnectorsList
             * 
             */
            Test.prototype.getV1ConnectorsList = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/list';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Attempt to obtain a token from the data provider, store it in the database. With this, the connector to continue to obtain new user data until the token is revoked.
             * @method
             * @name Test#getV1ConnectorsByConnectorConnect
             * @param {string} connector - Lowercase system name of the source application or device. Get a list of available connectors from the /connectors/list endpoint.
             * 
             */
            Test.prototype.getV1ConnectorsByConnectorConnect = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/{connector}/connect';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{connector}', parameters['connector']);

                if (parameters['connector'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: connector'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns instructions that describe what parameters and endpoint to use to connect to the given data provider.
             * @method
             * @name Test#getV1ConnectorsByConnectorConnectParameter
             * @param {string} connector - Lowercase system name of the source application or device. Get a list of available connectors from the /connectors/list endpoint.
             * @param {string} defaultValue - Default parameter value
             * @param {string} displayName - Name of the parameter that is user visible in the form
             * @param {string} key - Name of the property that the user has to enter such as username or password Connector (used in HTTP request)
             * @param {string} placeholder - Placeholder hint value for the parameter input tag.
             * @param {string} type - Type of input field such as those found here http://www.w3schools.com/tags/tag_input.asp
             * @param {boolean} usePopup - Should use popup when enabling connector
             * 
             */
            Test.prototype.getV1ConnectorsByConnectorConnectParameter = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/{connector}/connectParameter';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{connector}', parameters['connector']);

                if (parameters['connector'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: connector'));
                    return deferred.promise;
                }

                if (parameters['defaultValue'] !== undefined) {
                    queryParameters['defaultValue'] = parameters['defaultValue'];
                }

                if (parameters['displayName'] !== undefined) {
                    queryParameters['displayName'] = parameters['displayName'];
                }

                if (parameters['displayName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: displayName'));
                    return deferred.promise;
                }

                if (parameters['key'] !== undefined) {
                    queryParameters['key'] = parameters['key'];
                }

                if (parameters['key'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: key'));
                    return deferred.promise;
                }

                if (parameters['placeholder'] !== undefined) {
                    queryParameters['placeholder'] = parameters['placeholder'];
                }

                if (parameters['placeholder'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: placeholder'));
                    return deferred.promise;
                }

                if (parameters['type'] !== undefined) {
                    queryParameters['type'] = parameters['type'];
                }

                if (parameters['type'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: type'));
                    return deferred.promise;
                }

                if (parameters['usePopup'] !== undefined) {
                    queryParameters['usePopup'] = parameters['usePopup'];
                }

                if (parameters['usePopup'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: usePopup'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns instructions that describe what parameters and endpoint to use to connect to the given data provider.
             * @method
             * @name Test#getV1ConnectorsByConnectorConnectInstructions
             * @param {string} connector - Lowercase system name of the source application or device. Get a list of available connectors from the /connectors/list endpoint.
             * @param {string} parameters - JSON Array of Parameters for the request to enable connector.
             * @param {string} url - URL which should be used to enable the connector.
             * @param {boolean} usePopup - Should use popup when enabling connector
             * 
             */
            Test.prototype.getV1ConnectorsByConnectorConnectInstructions = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/{connector}/connectInstructions';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{connector}', parameters['connector']);

                if (parameters['connector'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: connector'));
                    return deferred.promise;
                }

                if (parameters['parameters'] !== undefined) {
                    queryParameters['parameters'] = parameters['parameters'];
                }

                if (parameters['parameters'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: parameters'));
                    return deferred.promise;
                }

                if (parameters['url'] !== undefined) {
                    queryParameters['url'] = parameters['url'];
                }

                if (parameters['url'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: url'));
                    return deferred.promise;
                }

                if (parameters['usePopup'] !== undefined) {
                    queryParameters['usePopup'] = parameters['usePopup'];
                }

                if (parameters['usePopup'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: usePopup'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * The disconnect method deletes any stored tokens or connection information from the connectors database.
             * @method
             * @name Test#getV1ConnectorsByConnectorDisconnect
             * @param {string} connector - Lowercase system name of the source application or device. Get a list of available connectors from the /connectors/list endpoint.
             * 
             */
            Test.prototype.getV1ConnectorsByConnectorDisconnect = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/{connector}/disconnect';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{connector}', parameters['connector']);

                if (parameters['connector'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: connector'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns information about the connector such as the connector id, whether or not is connected for this user (i.e. we have a token or credentials), and its update history for the user.
             * @method
             * @name Test#getV1ConnectorsByConnectorInfo
             * @param {string} connector - Lowercase system name of the source application or device. Get a list of available connectors from the /connectors/list endpoint.
             * 
             */
            Test.prototype.getV1ConnectorsByConnectorInfo = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/{connector}/info';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{connector}', parameters['connector']);

                if (parameters['connector'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: connector'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * The update method tells the QM Connector Framework to check with the data provider (such as Fitbit or MyFitnessPal) and retrieve any new measurements available.
             * @method
             * @name Test#getV1ConnectorsByConnectorUpdate
             * @param {string} connector - Lowercase system name of the source application or device
             * 
             */
            Test.prototype.getV1ConnectorsByConnectorUpdate = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/connectors/{connector}/update';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{connector}', parameters['connector']);

                if (parameters['connector'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: connector'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get correlations.<br>Supported filter parameters:<br><ul><li><b>correlationCoefficient</b> - Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action</li><li><b>onsetDelay</b> - The number of seconds which pass following a cause measurement before an effect would likely be observed.</li><li><b>durationOfAction</b> - The time in seconds over which the cause would be expected to exert a measurable effect. We have selected a default value for each variable. This default value may be replaced by a user specified by adjusting their variable user settings.</li><li><b>lastUpdated</b> - The time that this measurement was last updated in the UTC format "YYYY-MM-DDThh:mm:ss"</li></ul><br>
             * @method
             * @name Test#getV1Correlations
             * @param {string} effect - ORIGINAL variable name of the effect variable for which the user desires correlations
             * @param {string} cause - ORIGINAL variable name of the cause variable for which the user desires correlations
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * @param {integer} sort - Sort by given field. If the field is prefixed with `-, it will sort in descending order.
             * 
             */
            Test.prototype.getV1Correlations = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/correlations';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['effect'] !== undefined) {
                    queryParameters['effect'] = parameters['effect'];
                }

                if (parameters['cause'] !== undefined) {
                    queryParameters['cause'] = parameters['cause'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters['sort'] !== undefined) {
                    queryParameters['sort'] = parameters['sort'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Add correlation
             * @method
             * @name Test#postV1Correlations
             * @param {} body - Provides correlation data
             * 
             */
            Test.prototype.postV1Correlations = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/correlations';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['body'] !== undefined) {
                    body = parameters['body'];
                }

                if (parameters['body'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: body'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns the average correlations from all users for all public variables that contain the characters in the search query. Returns average of all users public variable correlations with a specified cause or effect.
             * @method
             * @name Test#getV1PublicCorrelationsSearchBySearch
             * @param {string} search - Name of the variable that you want to know the causes or effects of.
             * @param {string} effectOrCause - Specifies whether to return the effects or causes of the searched variable.
             * 
             */
            Test.prototype.getV1PublicCorrelationsSearchBySearch = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/public/correlations/search/{search}';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{search}', parameters['search']);

                if (parameters['search'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: search'));
                    return deferred.promise;
                }

                if (parameters['effectOrCause'] !== undefined) {
                    queryParameters['effectOrCause'] = parameters['effectOrCause'];
                }

                if (parameters['effectOrCause'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: effectOrCause'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns average of all correlations and votes for all public cause variables for a given effect
             * @method
             * @name Test#getV1VariablesByVariableNamePublicCauses
             * @param {string} variableName - Effect variable name
             * 
             */
            Test.prototype.getV1VariablesByVariableNamePublicCauses = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables/{variableName}/public/causes';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns average of all correlations and votes for all public cause variables for a given cause
             * @method
             * @name Test#getV1VariablesByVariableNamePublicEffects
             * @param {string} variableName - Cause variable name
             * 
             */
            Test.prototype.getV1VariablesByVariableNamePublicEffects = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables/{variableName}/public/effects';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns average of all correlations and votes for all user cause variables for a given effect
             * @method
             * @name Test#getV1VariablesByVariableNameCauses
             * @param {string} variableName - Effect variable name
             * 
             */
            Test.prototype.getV1VariablesByVariableNameCauses = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables/{variableName}/causes';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns average of all correlations and votes for all user effect variables for a given cause
             * @method
             * @name Test#getV1VariablesByVariableNameEffects
             * @param {string} variableName - Cause variable name
             * 
             */
            Test.prototype.getV1VariablesByVariableNameEffects = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables/{variableName}/effects';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns average of all correlations and votes for all user cause variables for a given cause. If parameter "include_public" is used, it also returns public correlations. User correlation overwrites or supersedes public correlation.
             * @method
             * @name Test#getV1OrganizationsByOrganizationIdUsersByUserIdVariablesByVariableNameCauses
             * @param {integer} organizationId - Organization ID
             * @param {integer} userId - User id
             * @param {string} variableName - Effect variable name
             * @param {string} organization_token - Organization access token
             * @param {string} include_public - Include bublic correlations, Can be "1" or empty.
             * 
             */
            Test.prototype.getV1OrganizationsByOrganizationIdUsersByUserIdVariablesByVariableNameCauses = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/organizations/{organizationId}/users/{userId}/variables/{variableName}/causes';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{organizationId}', parameters['organizationId']);

                if (parameters['organizationId'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: organizationId'));
                    return deferred.promise;
                }

                path = path.replace('{userId}', parameters['userId']);

                if (parameters['userId'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: userId'));
                    return deferred.promise;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters['organization_token'] !== undefined) {
                    queryParameters['organization_token'] = parameters['organization_token'];
                }

                if (parameters['organization_token'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: organization_token'));
                    return deferred.promise;
                }

                if (parameters['include_public'] !== undefined) {
                    queryParameters['include_public'] = parameters['include_public'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns average of all correlations and votes for all user cause variables for a given effect. If parameter "include_public" is used, it also returns public correlations. User correlation overwrites or supersedes public correlation.
             * @method
             * @name Test#getV1OrganizationsByOrganizationIdUsersByUserIdVariablesByVariableNameEffects
             * @param {integer} organizationId - Organization ID
             * @param {integer} userId - User id
             * @param {string} variableName - Cause variable name
             * @param {string} organization_token - Organization access token
             * @param {string} include_public - Include bublic correlations, Can be "1" or empty.
             * 
             */
            Test.prototype.getV1OrganizationsByOrganizationIdUsersByUserIdVariablesByVariableNameEffects = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/organizations/{organizationId}/users/{userId}/variables/{variableName}/effects';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{organizationId}', parameters['organizationId']);

                if (parameters['organizationId'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: organizationId'));
                    return deferred.promise;
                }

                path = path.replace('{userId}', parameters['userId']);

                if (parameters['userId'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: userId'));
                    return deferred.promise;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters['organization_token'] !== undefined) {
                    queryParameters['organization_token'] = parameters['organization_token'];
                }

                if (parameters['organization_token'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: organization_token'));
                    return deferred.promise;
                }

                if (parameters['include_public'] !== undefined) {
                    queryParameters['include_public'] = parameters['include_public'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten. <br>Supported filter parameters:<br><ul><li><b>value</b> - Value of measurement</li><li><b>lastUpdated</b> - The time that this measurement was created or last updated in the UTC format "YYYY-MM-DDThh:mm:ss"</li></ul><br>
             * @method
             * @name Test#getV1Measurements
             * @param {string} variableName - Name of the variable you want measurements for
             * @param {string} unit - The unit your want the measurements in
             * @param {string} startTime - The lower limit of measurements returned (Epoch)
             * @param {string} endTime - The upper limit of measurements returned (Epoch)
             * @param {integer} groupingWidth - The time (in seconds) over which measurements are grouped together
             * @param {string} groupingTimezone - The time (in seconds) over which measurements are grouped together
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * @param {integer} sort - Sort by given field. If the field is prefixed with `-, it will sort in descending order.
             * 
             */
            Test.prototype.getV1Measurements = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/measurements';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['variableName'] !== undefined) {
                    queryParameters['variableName'] = parameters['variableName'];
                }

                if (parameters['unit'] !== undefined) {
                    queryParameters['unit'] = parameters['unit'];
                }

                if (parameters['startTime'] !== undefined) {
                    queryParameters['startTime'] = parameters['startTime'];
                }

                if (parameters['endTime'] !== undefined) {
                    queryParameters['endTime'] = parameters['endTime'];
                }

                if (parameters['groupingWidth'] !== undefined) {
                    queryParameters['groupingWidth'] = parameters['groupingWidth'];
                }

                if (parameters['groupingTimezone'] !== undefined) {
                    queryParameters['groupingTimezone'] = parameters['groupingTimezone'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters['sort'] !== undefined) {
                    queryParameters['sort'] = parameters['sort'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * You can submit or update multiple measurements in a "measurements" sub-array.  If the variable these measurements correspond to does not already exist in the database, it will be automatically added.  The request body should look something like [{"measurements":[{"timestamp":1406419860,"value":"1","note":"I am a note about back pain."},{"timestamp":1406519865,"value":"3","note":"I am another note about back pain."}],"name":"Back Pain","source":"QuantiModo","category":"Symptoms","combinationOperation":"MEAN","unit":"/5"}]
             * @method
             * @name Test#postV1Measurements
             * @param {} Measurements - An array of measurements you want to insert.
             * 
             */
            Test.prototype.postV1Measurements = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/measurements';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['Measurements'] !== undefined) {
                    body = parameters['Measurements'];
                }

                if (parameters['Measurements'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: Measurements'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten. <br>Supported filter parameters:<br><ul><li><b>value</b> - Value of measurement</li><li><b>lastUpdated</b> - The time that this measurement was created or last updated in the UTC format "YYYY-MM-DDThh:mm:ss"</li></ul><br>
             * @method
             * @name Test#getV1MeasurementsDaily
             * @param {string} variableName - Name of the variable you want measurements for
             * @param {string} abbreviatedUnitName - The unit your want the measurements in
             * @param {string} startTime - The lower limit of measurements returned (Iso8601)
             * @param {string} endTime - The upper limit of measurements returned (Iso8601)
             * @param {integer} groupingWidth - The time (in seconds) over which measurements are grouped together
             * @param {string} groupingTimezone - The time (in seconds) over which measurements are grouped together
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * @param {integer} sort - Sort by given field. If the field is prefixed with `-, it will sort in descending order.
             * 
             */
            Test.prototype.getV1MeasurementsDaily = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/measurements/daily';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['variableName'] !== undefined) {
                    queryParameters['variableName'] = parameters['variableName'];
                }

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters['abbreviatedUnitName'] !== undefined) {
                    queryParameters['abbreviatedUnitName'] = parameters['abbreviatedUnitName'];
                }

                if (parameters['startTime'] !== undefined) {
                    queryParameters['startTime'] = parameters['startTime'];
                }

                if (parameters['endTime'] !== undefined) {
                    queryParameters['endTime'] = parameters['endTime'];
                }

                if (parameters['groupingWidth'] !== undefined) {
                    queryParameters['groupingWidth'] = parameters['groupingWidth'];
                }

                if (parameters['groupingTimezone'] !== undefined) {
                    queryParameters['groupingTimezone'] = parameters['groupingTimezone'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters['sort'] !== undefined) {
                    queryParameters['sort'] = parameters['sort'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get Unix time-stamp (epoch time) of the user's first and last measurements taken.
             * @method
             * @name Test#getV1MeasurementsRange
             * @param {string} sources - Enter source name to limit to specific source (varchar)
             * @param {integer} user - If not specified, uses currently logged in user (bigint)
             * 
             */
            Test.prototype.getV1MeasurementsRange = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/measurementsRange';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['sources'] !== undefined) {
                    queryParameters['sources'] = parameters['sources'];
                }

                if (parameters['user'] !== undefined) {
                    queryParameters['user'] = parameters['user'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Add a life-tracking app or device to the QuantiModo list of data sources.
             * @method
             * @name Test#postV1MeasurementSources
             * @param {} name - An array of names of data sources you want to add.
             * 
             */
            Test.prototype.postV1MeasurementSources = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/measurementSources';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['name'] !== undefined) {
                    body = parameters['name'];
                }

                if (parameters['name'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: name'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns a list of all the apps from which measurement data is obtained.
             * @method
             * @name Test#getV1MeasurementSources
             * 
             */
            Test.prototype.getV1MeasurementSources = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/measurementSources';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Ask the user if they want to allow a client's application to submit or obtain data from their QM account. It will redirect the user to the url provided by the client application with the code as a query parameter or error in case of an error.
             * @method
             * @name Test#getV1Oauth2Authorize
             * @param {string} client_id - This is the unique ID that QuantiModo uses to identify your application. Obtain a client id by emailing info@quantimo.do.
             * @param {string} client_secret - This is the secret for your obtained client_id. QuantiModo uses this to validate that only your application uses the client_id.
             * @param {string} response_type - If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
             * @param {string} scope - Scopes include basic, readmeasurements, and writemeasurements. The "basic" scope allows you to read user info (displayname, email, etc). The "readmeasurements" scope allows one to read a user's data. The "writemeasurements" scope allows you to write user data. Separate multiple scopes by a space.
             * @param {string} redirect_uri - The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
             * @param {string} state - An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
             * 
             */
            Test.prototype.getV1Oauth2Authorize = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/oauth2/authorize';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['client_id'] !== undefined) {
                    queryParameters['client_id'] = parameters['client_id'];
                }

                if (parameters['client_id'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: client_id'));
                    return deferred.promise;
                }

                if (parameters['client_secret'] !== undefined) {
                    queryParameters['client_secret'] = parameters['client_secret'];
                }

                if (parameters['client_secret'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: client_secret'));
                    return deferred.promise;
                }

                if (parameters['response_type'] !== undefined) {
                    queryParameters['response_type'] = parameters['response_type'];
                }

                if (parameters['response_type'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: response_type'));
                    return deferred.promise;
                }

                if (parameters['scope'] !== undefined) {
                    queryParameters['scope'] = parameters['scope'];
                }

                if (parameters['scope'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: scope'));
                    return deferred.promise;
                }

                if (parameters['redirect_uri'] !== undefined) {
                    queryParameters['redirect_uri'] = parameters['redirect_uri'];
                }

                if (parameters['state'] !== undefined) {
                    queryParameters['state'] = parameters['state'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Client provides authorization token obtained from /api/v1/oauth2/authorize to this endpoint and receives an access token. Access token can then be used to query different API endpoints of QuantiModo.
             * @method
             * @name Test#getV1Oauth2Token
             * @param {string} client_id - This is the unique ID that QuantiModo uses to identify your application. Obtain a client id by emailing info@quantimo.do.
             * @param {string} client_secret - This is the secret for your obtained client_id. QuantiModo uses this to validate that only your application uses the client_id.
             * @param {string} grant_type - Grant Type can be 'authorization_code' or 'refresh_token'
             * @param {string} response_type - If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
             * @param {string} scope - Scopes include basic, readmeasurements, and writemeasurements. The "basic" scope allows you to read user info (displayname, email, etc). The "readmeasurements" scope allows one to read a user's data. The "writemeasurements" scope allows you to write user data. Separate multiple scopes by a space.
             * @param {string} redirect_uri - The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
             * @param {string} state - An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
             * 
             */
            Test.prototype.getV1Oauth2Token = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/oauth2/token';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['client_id'] !== undefined) {
                    queryParameters['client_id'] = parameters['client_id'];
                }

                if (parameters['client_id'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: client_id'));
                    return deferred.promise;
                }

                if (parameters['client_secret'] !== undefined) {
                    queryParameters['client_secret'] = parameters['client_secret'];
                }

                if (parameters['client_secret'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: client_secret'));
                    return deferred.promise;
                }

                if (parameters['grant_type'] !== undefined) {
                    queryParameters['grant_type'] = parameters['grant_type'];
                }

                if (parameters['grant_type'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: grant_type'));
                    return deferred.promise;
                }

                if (parameters['response_type'] !== undefined) {
                    queryParameters['response_type'] = parameters['response_type'];
                }

                if (parameters['scope'] !== undefined) {
                    queryParameters['scope'] = parameters['scope'];
                }

                if (parameters['redirect_uri'] !== undefined) {
                    queryParameters['redirect_uri'] = parameters['redirect_uri'];
                }

                if (parameters['state'] !== undefined) {
                    queryParameters['state'] = parameters['state'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get user tokens for existing users, create new users
             * @method
             * @name Test#postV1OrganizationsByOrganizationIdUsers
             * @param {integer} organizationId - Organization ID
             * @param {} body - Provides organization token and user ID
             * 
             */
            Test.prototype.postV1OrganizationsByOrganizationIdUsers = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/organizations/{organizationId}/users';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                path = path.replace('{organizationId}', parameters['organizationId']);

                if (parameters['organizationId'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: organizationId'));
                    return deferred.promise;
                }

                if (parameters['body'] !== undefined) {
                    body = parameters['body'];
                }

                if (parameters['body'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: body'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Pairs cause measurements with effect measurements grouped over the duration of action after the onset delay.
             * @method
             * @name Test#getV1Pairs
             * @param {string} cause - Original variable name for the explanatory or independent variable
             * @param {string} causeSource - Name of data source that the cause measurements should come from
             * @param {string} causeUnit - Abbreviated name for the unit cause measurements to be returned in
             * @param {string} delay - Delay before onset of action (in seconds) from the cause variable settings.
             * @param {string} duration - Duration of action (in seconds) from the cause variable settings.
             * @param {string} effect - Original variable name for the outcome or dependent variable
             * @param {string} effectSource - Name of data source that the effectmeasurements should come from
             * @param {string} effectUnit - Abbreviated name for the unit effect measurements to be returned in
             * @param {string} endTime - The most recent date (in epoch time) for which we should return measurements
             * @param {string} startTime - The earliest date (in epoch time) for which we should return measurements
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * @param {integer} sort - Sort by given field. If the field is prefixed with `-, it will sort in descending order.
             * 
             */
            Test.prototype.getV1Pairs = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/pairs';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['cause'] !== undefined) {
                    queryParameters['cause'] = parameters['cause'];
                }

                if (parameters['cause'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: cause'));
                    return deferred.promise;
                }

                if (parameters['causeSource'] !== undefined) {
                    queryParameters['causeSource'] = parameters['causeSource'];
                }

                if (parameters['causeUnit'] !== undefined) {
                    queryParameters['causeUnit'] = parameters['causeUnit'];
                }

                if (parameters['delay'] !== undefined) {
                    queryParameters['delay'] = parameters['delay'];
                }

                if (parameters['duration'] !== undefined) {
                    queryParameters['duration'] = parameters['duration'];
                }

                if (parameters['effect'] !== undefined) {
                    queryParameters['effect'] = parameters['effect'];
                }

                if (parameters['effect'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: effect'));
                    return deferred.promise;
                }

                if (parameters['effectSource'] !== undefined) {
                    queryParameters['effectSource'] = parameters['effectSource'];
                }

                if (parameters['effectUnit'] !== undefined) {
                    queryParameters['effectUnit'] = parameters['effectUnit'];
                }

                if (parameters['endTime'] !== undefined) {
                    queryParameters['endTime'] = parameters['endTime'];
                }

                if (parameters['startTime'] !== undefined) {
                    queryParameters['startTime'] = parameters['startTime'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters['sort'] !== undefined) {
                    queryParameters['sort'] = parameters['sort'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get all available units
             * @method
             * @name Test#getV1Units
             * @param {string} unitName - Unit name
             * @param {string} abbreviatedUnitName - Restrict the results to a specific unit by providing the unit abbreviation.
             * @param {string} categoryName - Restrict the results to a specific unit category by providing the unit category name.
             * 
             */
            Test.prototype.getV1Units = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/units';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['unitName'] !== undefined) {
                    queryParameters['unitName'] = parameters['unitName'];
                }

                if (parameters['abbreviatedUnitName'] !== undefined) {
                    queryParameters['abbreviatedUnitName'] = parameters['abbreviatedUnitName'];
                }

                if (parameters['categoryName'] !== undefined) {
                    queryParameters['categoryName'] = parameters['categoryName'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get a list of the categories of measurement units such as 'Distance', 'Duration', 'Energy', 'Frequency', 'Miscellany', 'Pressure', 'Proportion', 'Rating', 'Temperature', 'Volume', and 'Weight'.
             * @method
             * @name Test#getV1UnitCategories
             * 
             */
            Test.prototype.getV1UnitCategories = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/unitCategories';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get a list of all possible units to use for a given variable
             * @method
             * @name Test#getV1UnitsVariable
             * @param {string} unitName - Name of Unit you want to retrieve
             * @param {string} abbreviatedUnitName - Abbreviated Unit Name of the unit you want
             * @param {string} categoryName - Name of the category you want units for
             * @param {string} variable - Name of the variable you want units for
             * 
             */
            Test.prototype.getV1UnitsVariable = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/unitsVariable';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['unitName'] !== undefined) {
                    queryParameters['unitName'] = parameters['unitName'];
                }

                if (parameters['abbreviatedUnitName'] !== undefined) {
                    queryParameters['abbreviatedUnitName'] = parameters['abbreviatedUnitName'];
                }

                if (parameters['categoryName'] !== undefined) {
                    queryParameters['categoryName'] = parameters['categoryName'];
                }

                if (parameters['variable'] !== undefined) {
                    queryParameters['variable'] = parameters['variable'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Returns user info for the currently authenticated user.
             * @method
             * @name Test#getV1UserMe
             * 
             */
            Test.prototype.getV1UserMe = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/user/me';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Allows the client to create a new variable in the `variables` table.
             * @method
             * @name Test#postV1Variables
             * @param {} variableName - Original name for the variable.
             * 
             */
            Test.prototype.postV1Variables = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['variableName'] !== undefined) {
                    body = parameters['variableName'];
                }

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get variables by the category name. <br>Supported filter parameters:<br><ul><li><b>name</b> - Original name of the variable (supports exact name match only)</li><li><b>lastUpdated</b> - Filter by the last time any of the properties of the variable were changed. Uses UTC format "YYYY-MM-DDThh:mm:ss"</li><li><b>source</b> - The name of the data source that created the variable (supports exact name match only). So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here</li><li><b>latestMeasurementTime</b> - Filter variables based on the last time a measurement for them was created or updated in the UTC format "YYYY-MM-DDThh:mm:ss"</li><li><b>numberOfMeasurements</b> - Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.</li><li><b>lastSource</b> - Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here. (supports exact name match only)</li></ul><br>
             * @method
             * @name Test#getV1Variables
             * @param {integer} userId - User id
             * @param {string} category - Filter data by category
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * @param {integer} sort - Sort by given field. If the field is prefixed with `-, it will sort in descending order.
             * 
             */
            Test.prototype.getV1Variables = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['userId'] !== undefined) {
                    queryParameters['userId'] = parameters['userId'];
                }

                if (parameters['category'] !== undefined) {
                    queryParameters['category'] = parameters['category'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters['sort'] !== undefined) {
                    queryParameters['sort'] = parameters['sort'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get all of the settings and information about a variable by its name. If the logged in user has modified the settings for the variable, these will be provided instead of the default settings for that variable.
             * @method
             * @name Test#getV1VariablesByVariableName
             * @param {string} variableName - Variable name
             * 
             */
            Test.prototype.getV1VariablesByVariableName = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables/{variableName}';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{variableName}', parameters['variableName']);

                if (parameters['variableName'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: variableName'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * This endpoint retrieves an array of all public variables. Public variables are things like foods, medications, symptoms, conditions, and anything not unique to a particular user. For instance, a telephone number or name would not be a public variable.
             * @method
             * @name Test#getV1PublicVariables
             * 
             */
            Test.prototype.getV1PublicVariables = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/public/variables';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get top 5 PUBLIC variables with the most correlations containing the entered search characters. For example, search for 'mood' as an effect. Since 'Overall Mood' has a lot of correlations with other variables, it should be in the autocomplete list.<br>Supported filter parameters:<br><ul><li><b>category</b> - Category of Variable</li></ul><br>
             * @method
             * @name Test#getV1PublicVariablesSearchBySearch
             * @param {string} search - Search query can be some fraction of a variable name.
             * @param {string} effectOrCause - Allows us to specify which column in the `correlations` table will be searched. Choices are effect or cause.
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * @param {integer} sort - Sort by given field. If the field is prefixed with `-, it will sort in descending order.
             * 
             */
            Test.prototype.getV1PublicVariablesSearchBySearch = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/public/variables/search/{search}';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{search}', parameters['search']);

                if (parameters['search'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: search'));
                    return deferred.promise;
                }

                if (parameters['effectOrCause'] !== undefined) {
                    queryParameters['effectOrCause'] = parameters['effectOrCause'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters['sort'] !== undefined) {
                    queryParameters['sort'] = parameters['sort'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Get variables containing the search characters for which the currently logged in user has measurements. Used to provide auto-complete function in variable search boxes.
             * @method
             * @name Test#getV1VariablesSearchBySearch
             * @param {string} search - Search query which may be an entire variable name or a fragment of one.
             * @param {string} categoryName - Filter variables by category name. The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Work.
             * @param {string} source - Specify a data source name to only return variables from a specific data source.
             * @param {integer} limit - The LIMIT is used to limit the number of results returned. So if you have 1000 results, but only want to the first 10, you would set this to 10 and offset to 0.
             * @param {integer} offset - Now suppose you wanted to show results 11-20. You'd set the offset to 10 and the limit to 10.
             * 
             */
            Test.prototype.getV1VariablesSearchBySearch = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variables/search/{search}';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                path = path.replace('{search}', parameters['search']);

                if (parameters['search'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: search'));
                    return deferred.promise;
                }

                if (parameters['categoryName'] !== undefined) {
                    queryParameters['categoryName'] = parameters['categoryName'];
                }

                if (parameters['source'] !== undefined) {
                    queryParameters['source'] = parameters['source'];
                }

                if (parameters['limit'] !== undefined) {
                    queryParameters['limit'] = parameters['limit'];
                }

                if (parameters['offset'] !== undefined) {
                    queryParameters['offset'] = parameters['offset'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Users can change things like the display name for a variable. They can also change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.
             * @method
             * @name Test#postV1UserVariables
             * @param {} sharingData - Variable user settings data
             * 
             */
            Test.prototype.postV1UserVariables = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/userVariables';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['sharingData'] !== undefined) {
                    body = parameters['sharingData'];
                }

                if (parameters['sharingData'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: sharingData'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Work.
             * @method
             * @name Test#getV1VariableCategories
             * 
             */
            Test.prototype.getV1VariableCategories = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/variableCategories';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                var options = {
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * This is to enable users to indicate their opinion on the plausibility of a causal relationship between a treatment and outcome. QuantiModo incorporates crowd-sourced plausibility estimations into their algorithm. This is done allowing user to indicate their view of the plausibility of each relationship with thumbs up/down buttons placed next to each prediction.
             * @method
             * @name Test#postV1Votes
             * @param {string} cause - Cause variable name
             * @param {string} effect - Effect variable name
             * @param {number} correlation - Correlation value
             * @param {boolean} vote - Vote: 0 (for implausible) or 1 (for plausible)
             * 
             */
            Test.prototype.postV1Votes = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/votes';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['cause'] !== undefined) {
                    queryParameters['cause'] = parameters['cause'];
                }

                if (parameters['cause'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: cause'));
                    return deferred.promise;
                }

                if (parameters['effect'] !== undefined) {
                    queryParameters['effect'] = parameters['effect'];
                }

                if (parameters['effect'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: effect'));
                    return deferred.promise;
                }

                if (parameters['correlation'] !== undefined) {
                    queryParameters['correlation'] = parameters['correlation'];
                }

                if (parameters['correlation'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: correlation'));
                    return deferred.promise;
                }

                if (parameters['vote'] !== undefined) {
                    queryParameters['vote'] = parameters['vote'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };
            /**
             * Delete previously posted vote
             * @method
             * @name Test#postV1VotesDelete
             * @param {string} cause - Cause variable name
             * @param {string} effect - Effect variable name
             * 
             */
            Test.prototype.postV1VotesDelete = function(parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                var deferred = $q.defer();

                var domain = this.domain;
                var path = '/v1/votes/delete';

                var body;
                var queryParameters = {};
                var headers = {};
                var form = {};

                if (this.token.isQuery) {
                    queryParameters[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }

                if (parameters['cause'] !== undefined) {
                    queryParameters['cause'] = parameters['cause'];
                }

                if (parameters['cause'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: cause'));
                    return deferred.promise;
                }

                if (parameters['effect'] !== undefined) {
                    queryParameters['effect'] = parameters['effect'];
                }

                if (parameters['effect'] === undefined) {
                    deferred.reject(new Error('Missing required  parameter: effect'));
                    return deferred.promise;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters)
                        .forEach(function(parameterName) {
                            var parameter = parameters.$queryParameters[parameterName];
                            queryParameters[parameterName] = parameter;
                        });
                }

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = Test.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };

            return Test;
        })();

        return Test;
    }]);