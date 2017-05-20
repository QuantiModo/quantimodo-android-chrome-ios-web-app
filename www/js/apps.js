// SubDomain : Filename
var appConfigFileNames = {
    "moodimodo" : "moodimodo",
    "energymodo" : "energymodo",
    "mindfirst" : "mindfirst",
    "medimodo" : "medimodo",
    "quantimodo" : "quantimodo",
    "local" : "quantimodo",
    "app" : "quantimodo",
    "ionic" : "quantimodo",
    "oauth" : "quantimodo",
    "yourlowercaseappnamehere": "yourlowercaseappnamehere"
};

function getSubDomain(){
    var full = window.location.host;
    var parts = full.split('.');
    return parts[0].toLowerCase();
}

function getLocalConfigLowerCaseAppNameFromUrl() {
    var parameterValue;
	if(appConfigFileNames[getSubDomain()]){return appConfigFileNames[getSubDomain()];}
    var queryString = document.location.toString().split('?')[1];
    if(!queryString) {return false;}
    var queryParameterStrings = queryString.split('&');
    if(!queryParameterStrings) {return false;}
    for (var i = 0; i < queryParameterStrings.length; i++) {
        var queryKeyValuePair = queryParameterStrings[i].split('=');
        if (queryKeyValuePair[0] === ('app' || 'appName' || 'lowercaseAppName')) {parameterValue = queryKeyValuePair[1].split('#')[0].toLowerCase();}
    }
    if(appConfigFileNames[parameterValue]){return appConfigFileNames[parameterValue];}
}

function getUrlParameter(parameterName, url, shouldDecode) {
    if(!url){url = window.location.href;}
    if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
    if(url.split('?').length > 1){
        var queryString = url.split('?')[1];
        var parameterKeyValuePairs = queryString.split('&');
        for (var i = 0; i < parameterKeyValuePairs.length; i++) {
            var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
            if (currentParameterKeyValuePair[0] === parameterName || currentParameterKeyValuePair[0].toCamel() === parameterName) {
                if(typeof shouldDecode !== "undefined")  {
                    return decodeURIComponent(currentParameterKeyValuePair[1]);
                } else {
                    return currentParameterKeyValuePair[1];
                }
            }
        }
    }
    return null;
}

var appsManager = { // jshint ignore:line
	defaultApp : "default",
	getAppConfig : function(){
        console.debug('getLocalConfigLowerCaseAppNameFromUrl returns ' + getLocalConfigLowerCaseAppNameFromUrl());
		if(getLocalConfigLowerCaseAppNameFromUrl()){
			return 'configs/' + getLocalConfigLowerCaseAppNameFromUrl() + '.js';
		} else {
			return 'configs/' + appsManager.defaultApp + '.js';
		}
	},
	getPrivateConfig : function(){
		if(getLocalConfigLowerCaseAppNameFromUrl()){
			return './private_configs/'+ getLocalConfigLowerCaseAppNameFromUrl() + '.config.js';
		} else {
			return './private_configs/'+ appsManager.defaultApp + '.config.js';
		}
	},
	doWeHaveLocalConfigFile: function () {
        if(getLocalConfigLowerCaseAppNameFromUrl()){return true;}
    },
	getSubDomain: function(){
		return getSubDomain();
	},
    getUrlParameter: function (parameterName, url, shouldDecode) {
        return getUrlParameter(parameterName, url, shouldDecode);
    },
    getAppSettingsFromUrlParameter: function(){
        var appSettings = getUrlParameter('appSettings');
        if(appSettings) {
            appSettings = JSON.parse(decodeURIComponent(appSettings));
            window.config = {appSettings: appSettings};
            return appSettings;
        }
    }
};