// Quantimodo.com JavaScript API v1.2.4
// Requires JQuery.
Quantimodo = function () {

    var hostUrl = apiHost + '/api/';

    var GET = function (baseURL, allowedParams, params, successHandler, disableLooping) {
        var urlParams = [];
        for (var key in params) {
            if (jQuery.inArray(key, allowedParams) == -1) {
                throw 'invalid parameter; allowed parameters: ' + allowedParams.toString();
            }
            urlParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }

        var results = [];

        fetchAPI(0);

        function fetchAPI(offset) {

            var url = hostUrl;

            if (urlParams.length == 0) {
                url += baseURL + '?offset=' + offset + '&limit=200';
            } else {
                url += baseURL + '?' + urlParams.join('&') + '&offset=' + offset + '&limit=200';
            }
            console.debug('Fecthing: ' + url);
            jQuery.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    if (typeof accessToken !== 'undefined' && accessToken) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                    }
                    if (typeof mashapeKey !== 'undefined' && mashapeKey) {
                        xhr.setRequestHeader('X-Mashape-Key', mashapeKey);
                    }
                },
                success: function (data, status, xhr) {

                    if (data.constructor === Array && !disableLooping) {
                        console.debug('Fetched: ' + data.length + ' items');
                        if (data.length > 0) {
                            results = results.concat(data);
                            fetchAPI(offset + 200);
                        } else {
                            successHandler(results);
                        }
                    } else {
                        successHandler(data)
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    console.log('Request failed. ' + textStatus + ': ' + errorThrown);
                    if(errorThrown == "Unauthorized") {
                        handleUnauthorizedRequest(apiHost);
                        return false;
                    } else {
                        console.log('Request failed. ' + textStatus + ': ' + errorThrown + ': ' + xhr.responseText);
                    }
                }
            });
        }
    };

    var POST = function (baseURL, requiredFields, items, successHandler) {
        console.debug('POST API Call');

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            for (var j = 0; j < requiredFields.length; j++) {
                if (!(requiredFields[j] in item)) {
                    throw 'missing required field in POST data; required fields: ' + requiredFields.toString();
                }
            }
        }
        jQuery.ajax({
            type: 'POST',
            url: hostUrl + baseURL,
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                if (typeof mashapeKey !== 'undefined' && mashapeKey) {
                    xhr.setRequestHeader('X-Mashape-Key', mashapeKey);
                }
            },
            data: JSON.stringify(items),
            dataType: 'json',
            success: successHandler,
            error: function(xhr, textStatus, errorThrown){
                console.log('Request failed. ' + textStatus + ': ' + errorThrown);
                if(errorThrown == "Unauthorized") {
                    handleUnauthorizedRequest(apiHost);
                    return false;
                } else {
                    console.log('Request failed. ' + textStatus + ': ' + errorThrown + ': ' +  xhr.responseText);
                }
            }
        });
    };

    var localCache = {

        timeOut: 1000 * 420,    //cache valid for 7 minutes
        cacheKeysPrefix: 'qmwp_cache_',

        exist: function (key) {
            if (localStorage.getItem(localCache.cacheKeysPrefix + key)) {

                var cachedData = JSON.parse(localStorage.getItem(localCache.cacheKeysPrefix + key));

                return new Date().getTime() - cachedData.cachedAt < localCache.timeOut;

            }
        },

        get: function (key) {

            var cachedData = JSON.parse(localStorage.getItem(localCache.cacheKeysPrefix + key));

            return cachedData.payload;

        },

        set: function (key, data) {

            localCache.clearOldData();

            localStorage.removeItem(localCache.cacheKeysPrefix + key);

            var dataToCache = JSON.stringify({
                cachedAt: new Date().getTime(),
                payload: data
            });

            localStorage.setItem(localCache.cacheKeysPrefix + key, dataToCache)

        },

        clearOldData: function () {
            //get all storage entries of current page local storage
            var storageEntries = Object.keys(localStorage);
            //go with each
            for (var i = 0; i < storageEntries.length; i++) {
                //and check if its a cache object
                if (storageEntries[i].substr(0, 11) == localCache.cacheKeysPrefix) {
                    //parse it if it's  a cahce object
                    var cachedData = JSON.parse(localStorage[storageEntries[i]]);
                    //check if it is still valid
                    if (new Date().getTime() - cachedData.cachedAt > localCache.timeOut) {
                        //if it's outdated - remove
                        localStorage.removeItem(storageEntries[i]);
                    }
                }
            }

        }

    };

    var disableLooping = true;

    return {
        getMeasurements: function (params, f) {
            GET('measurements', [
                'variableName',
                'startTime',
                'endTime',
                'groupingWidth',
                'groupingTimezone',
                'source'], params, f);
        },
        getDailyMeasurements: function (params, f) {
            GET('v1/measurements/daily', [
                'variableName',
                'startTime',
                'endTime',
                'groupingWidth',
                'groupingTimezone'], params, f);
        },
        postMeasurements: function (measurements, f) {
            POST('measurements', [
                'source',
                'variable',
                'combinationOperation',
                'timestamp',
                'value',
                'unit'], measurements, f);
        },
        postMeasurementsV2: function (measurementset, f) {
            POST('measurements/v2', [
                'measurements',
                'name',
                'source',
                'category',
                'combinationOperation',
                'unit'], measurementset, f);
        },
        deleteVariableMeasurements: function (variables, f) {
            POST('measurements/delete', [
                'variableId',
                'variableName'], variables, f);
        },

        getMeasurementsRange: function (params, f) {
            GET('measurementsRange', [], params, f, disableLooping);
        },

        getMeasurementSources: function (params, f) {
            GET('measurementSources', [], params, f, disableLooping);
        },
        postMeasurementSources: function (measurements, f) {
            POST('measurementSources', ['name'], measurements, f);
        },
        getUnits: function (params, f) {
            GET('units', [
                'unitName',
                'abbreviatedUnitName',
                'categoryName'], params, f, disableLooping);
        },
        getUnitsForVariable: function (params, f) {
            GET('unitsVariable', [
                'variable',
                'unitName',
                'abbreviatedUnitName',
                'categoryName'], params, f, disableLooping);
        },
        postUnits: function (measurements, f) {
            POST('units', [
                'name',
                'abbreviatedName',
                'category',
                'conversionSteps'], measurements, f);
        },

        getUnitCategories: function (params, f) {
            GET('unitCategories', [], params, f, disableLooping);
        },
        postUnitCategories: function (measurements, f) {
            POST('unitCategories', ['name'], measurements, f);
        },

        getVariables: function (params, f) {

            if (localCache.exist('variables')) {
                f(localCache.get('variables'));
            } else {
                GET('variables', ['categoryName'], params, function (variables) {
                    localCache.set('variables', variables);
                    f(variables);
                }, disableLooping);
            }

        },

        getVariableByName: function (name, f) {
            GET('variables/' + encodeURIComponent(name), ['categoryName'], null, f, disableLooping);
        },

        postVariables: function (measurements, f) {
            POST('variables', ['name', 'category', 'unit', 'combinationOperation'], measurements, f);
        },

        searchVariables: function (query, f, params) {
            if (localCache.exist('searchVariables_' + query)) {
                f(localCache.get('searchVariables_' + query));
            } else {
                GET('variables/search/' + query, ['categoryName', 'includePublic'], params, function (variables) {
                    localCache.set('searchVariables_' + query, variables);
                    f(variables);
                }, disableLooping);

            }
        },

        getVariableCategories: function (params, f) {

            if (localCache.exist('variableCategories')) {
                f(localCache.get('variableCategories'));
            } else {
                GET('variableCategories', [], params, function (variableCategories) {
                    localCache.set('variableCategories', variableCategories);
                    f(variableCategories);
                }, disableLooping);
            }

        },
        postVariableCategories: function (measurements, f) {
            POST('variableCategories', ['name'], measurements, f);
        },

        getPairs: function (params, f) {
            GET('pairs', [
                'cause',
                'effect',
                'duration',
                'delay',
                'startTime',
                'endTime',
                'causeSource',
                'effectSource',
                'causeUnit',
                'effectUnit'], params, f);
        },

        getUserVariables: function (params, f) {
            GET('userVariables', ['variableName'], params, f, disableLooping);
        },
        postUserVariables: function (measurements, f) {
            POST('userVariables', ['variable'], measurements, f);
        },

        getCorrelations: function (params, f) {
            GET('correlations', ['effect'], params, f, disableLooping);
        },

        getCorrelateShare: function (params, f) {
            GET('share', ['id'], params, f, disableLooping);
        },
        postCorrelateShare: function (measurements, f) {
            POST('share', ['type', 'inputVariable', 'outputVariable'], measurements, f);
        },

        connectorsInterface: function (baseURL, defaultConnector) {
            this.params = {
                baseURL: typeof baseURL == 'undefined' ? hostUrl : hostUrl + baseURL,
                connector: typeof defaultConnector == 'undefined' ? null : defaultConnector
            };
            this.connector = function (name) {
                this.params.connector = name;
                return this;
            };
            this.do = function () {
                var action = arguments[0],
                    params = {},
                    f = undefined;

                if (typeof arguments[1] == 'object') {
                    params = arguments[1];
                    f = arguments[2];
                } else if (typeof arguments[1] == 'function') {
                    f = arguments[1];
                }
                switch (action) {
                    case 'connect':
                        this.sendRequest('connectors/' + this.params.connector + '/connect', params, f);
                        break;
                    case 'disconnect':
                        this.sendRequest('connectors/' + this.params.connector + '/disconnect', params, f);
                        break;
                    case 'update':
                        this.sendRequest('connectors/' + this.params.connector + '/update', params, f);
                        break;
                    case 'info':
                        this.sendRequest('connectors/' + this.params.connector + '/info', params, f);
                        break;
                }
            };
            this.listConnectors = function (f) {
                this.sendRequest('connectors/list', {}, f);
            };
            this.sendRequest = function (url, params, f) {
                console.debug('API Call via QM JS SDK ');

                var that = this;
                jQuery.ajax(this.params.baseURL + url, {
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                        if (typeof mashapeKey !== 'undefined' && mashapeKey) {
                            xhr.setRequestHeader('X-Mashape-Key', mashapeKey);
                        }
                    },
                    data: params,
                    dataType: 'json'
                }).done(function (data) {
                    if (typeof f != 'undefined') {
                        f(data, that.params.connector);
                    }
                });

            };
        },

        getCurrentUser: function (f) {
            GET('user/me', ['id', 'wpId', 'displayName', 'loginName', 'email', 'token', 'clientId', 'userRegistered'],
                null, f, disableLooping);
        },

        url: hostUrl
    };
}();

function extractDomainWithPort(url) {
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        return url.split('/')[2];
    }
    else {
        return url.split('/')[0];
    }
}

function stripPort(extractedDomainWithPort){
    //find & remove port number
    return extractedDomainWithPort.split(':')[0];
}

function handleUnauthorizedRequest(apiHostUrl) {
    var currentDomainWithPort = extractDomainWithPort(window.location.href);
    var apiHostDomainWithPort = extractDomainWithPort(apiHostUrl);
    var currentDomainWithoutPort = stripPort(currentDomainWithPort);
    var apiHostDomainWithoutPort = stripPort(apiHostDomainWithPort);
    if (currentDomainWithoutPort == apiHostDomainWithoutPort) {
        window.location.href = 'https://' + currentDomainWithPort + '/api/v2/auth/login?redirect_uri=' + window.location.href;
        return false;
    } else {
        window.location.replace('https://' + currentDomainWithPort + '?connect=quantimodo');
        return false;
    }
}