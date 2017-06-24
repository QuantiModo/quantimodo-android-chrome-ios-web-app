// SubDomain : Filename
var appConfigFileNames = {
    "app" : "quantimodo",
    "energymodo" : "energymodo",
    "default" : "default",
    "ionic" : "quantimodo",
    "local" : "quantimodo",
    "medimodo" : "medimodo",
    "mindfirst" : "mindfirst",
    "moodimodo" : "moodimodo",
    "oauth" : "quantimodo",
    "quantimodo" : "quantimodo",
    "your_quantimodo_client_id_here": "your_quantimodo_client_id_here"
};

function getSubDomain(){
    var full = window.location.host;
    var parts = full.split('.');
    return parts[0].toLowerCase();
}

function getClientIdFromQueryParameters(fallbackToSubDomain) {
    var clientId;
    var queryString = document.location.toString().split('?')[1];
    if(queryString) {
        var queryParameterStrings = queryString.split('&');
        if (queryParameterStrings) {
            for (var i = 0; i < queryParameterStrings.length; i++) {
                var queryKeyValuePair = queryParameterStrings[i].split('=');
                if (['app', 'appname', 'lowercaseappname', 'clientid'].contains(queryKeyValuePair[0].toLowerCase().replace('_', ''))) {
                    clientId = queryKeyValuePair[1].split('#')[0].toLowerCase();
                    localStorage.setItem('clientId', clientId);
                }
            }
        }
    }
    if(!clientId){clientId = localStorage.getItem('clientId');}
    if(!clientId && fallbackToSubDomain){clientId = getSubDomain();}
    return clientId;
}

function getQuantiModoClientId() {
    if(window.location.href.indexOf('http') === -1 || window.location.href.indexOf('quantimo.do') === -1){
        console.debug("Using default.config.js because we're not on a website or a quantimo.do domain");
        return "default"; // On mobile
    }
    var clientIdFromQueryParams = getClientIdFromQueryParameters();
    if(clientIdFromQueryParams){
        console.debug("Using clientIdFromQueryParams: " + clientIdFromQueryParams);
        return clientIdFromQueryParams;
    }
    var subdomain = getSubDomain();
    var clientIdFromAppConfigName = appConfigFileNames[getSubDomain()];
    if(clientIdFromAppConfigName){
        console.debug("Using client id " + clientIdFromAppConfigName + " derived from appConfigFileNames using subdomain: " + subdomain);
        return clientIdFromAppConfigName;
    }
    console.debug("Using subdomain as client id: " + subdomain);
    return subdomain;
}

function getUrlParameter(parameterName, url, shouldDecode) {
    if(!url){url = window.location.href;}
    if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
    if(url.split('?').length > 1){
        var queryString = url.split('?')[1];
        var parameterKeyValuePairs = queryString.split('&');
        for (var i = 0; i < parameterKeyValuePairs.length; i++) {
            var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
            if (currentParameterKeyValuePair[0].replace('_', '').toLowerCase() === parameterName.replace('_', '').toLowerCase()) {
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
        console.debug('getQuantiModoClientId returns ' + getQuantiModoClientId());
		if(getQuantiModoClientId()){
			return 'configs/' + getQuantiModoClientId() + '.js';
		} else {
			return 'configs/' + appsManager.defaultApp + '.js';
		}
	},
	getPrivateConfig : function(){
		if(getQuantiModoClientId()){
			return './private_configs/'+ getQuantiModoClientId() + '.config.js';
		} else {
			return './private_configs/'+ appsManager.defaultApp + '.config.js';
		}
	},
	doWeHaveLocalConfigFile: function () {
        if(appConfigFileNames[getQuantiModoClientId()]){return true;}
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
            window.config.appSettings = appSettings;
            return appSettings;
        }
    },
    getQuantiModoClientId: function () {
        return getQuantiModoClientId();
    },
    getQuantiModoApiUrl: function () {
        if(getUrlParameter('apiUrl')){return "https://" + getUrlParameter('apiUrl');}
        if(localStorage.getItem('apiUrl')){return localStorage.getItem('apiUrl');}
        if(window.location.origin.indexOf('staging.quantimo.do') !== -1){return "https://staging.quantimo.do";}
        if(window.location.origin.indexOf('local.quantimo.do') !== -1){return "https://local.quantimo.do";}
        return "https://app.quantimo.do";
    },
    getClientIdFromQueryParameters: function (fallbackToSubDomain) {
        return  getClientIdFromQueryParameters(fallbackToSubDomain);
    },
    shouldWeUseLocalConfig: function () {
        var onMobile = window.location.href.indexOf('https://') === -1;
        if(onMobile){return true;}
        var designMode = window.location.href.indexOf('configuration-index.html') !== -1;
        if(designMode){return false;}
        if(getClientIdFromQueryParameters(true) === 'app'){return true;}
    }
};