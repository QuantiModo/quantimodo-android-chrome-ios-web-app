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

function getClientIdFromQueryParameters() {
    var clientId = getUrlParameter('clientId');
    if(!clientId){clientId = getUrlParameter('appName');}
    if(!clientId){clientId = getUrlParameter('lowerCaseAppName');}
    if(!clientId){clientId = getUrlParameter('quantimodoClientId');}
    if(clientId){localStorage.setItem('clientId', clientId);}
    return clientId;
}

function getQuantiModoClientId() {
    if(onMobile()){
        console.debug("Using default.config.js because we're on mobile");
        return "default"; // On mobile
    }
    var clientId = getClientIdFromQueryParameters();
    if(clientId){
        console.debug("Using clientIdFromQueryParams: " + clientId);
        return clientId;
    }
    if(!clientId){clientId = localStorage.getItem('clientId');}
    if(clientId){
        console.debug("Using clientId From localStorage: " + clientId);
        return clientId;
    }
    if(window.location.href.indexOf('quantimo.do') === -1){
        console.debug("Using default.config.js because we're not on a quantimo.do domain");
        return "default"; // On mobile
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

function onMobile() {
    return window.location.href.indexOf('https://') === -1;
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
    getUrlParameter: function (parameterName, url, shouldDecode) {
        return getUrlParameter(parameterName, url, shouldDecode);
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
    shouldWeUseLocalConfig: function () {
        if(onMobile()){return true;}
        var designMode = window.location.href.indexOf('configuration-index.html') !== -1;
        if(designMode){return false;}
        if(getClientIdFromQueryParameters() === 'app'){return true;}
    }
};