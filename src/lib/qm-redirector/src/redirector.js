function addUrlQueryParamsToUrlString(params, url) {
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            if (url.indexOf(key + '=') === -1) {
                if (params[key] === null) {
                    console.error("Not adding null param " + key);
                    continue;
                }
                if (url.indexOf('?') === -1) {
                    url = url + "?" + key + "=" + encodeURIComponent(params[key]);
                } else {
                    url = url + "&" + key + "=" + encodeURIComponent(params[key]);
                }
            }
        }
    }
    return url;
}
function getSubDomain() {
    const full = window.location.host;
    const parts = full.split('.');
    return parts[0].toLowerCase();
}
function getClientIdFromSubDomain() {
    const appConfigFileNames = {
        "app": "quantimodo",
        "energymodo": "energymodo",
        "default": "default",
        "ionic": "quantimodo",
        "local": "quantimodo",
        "medimodo": "medimodo",
        "mindfirst": "mindfirst",
        "moodimodo": "moodimodo",
        "oauth": "quantimodo",
        "quantimodo": "quantimodo",
        "staging": "quantimodo",
        "utopia": "quantimodo",
        "your_quantimodo_client_id_here": "your_quantimodo_client_id_here"
    };
    if (window.location.hostname.indexOf('.quantimo.do') === -1) {
        return null;
    }
    let subDomain = getSubDomain();
    subDomain = subDomain.replace('qm-', '');
    if (subDomain === 'web' || subDomain === 'staging-web') {
        return null;
    }
    const clientIdFromAppConfigName = appConfigFileNames[subDomain];
    if (clientIdFromAppConfigName) {
        return clientIdFromAppConfigName;
    }
    console.debug('Using subDomain as client id: ' + subDomain);
    return subDomain;
}
function redirectToIonic(stateName) {
    let newUrl = "https://web.quantimo.do/#/app/" + stateName;
    addQueryStringAndRedirect(newUrl);
}
function redirectToWebSubdomain() {
    let newUrl = "https://web.quantimo.do/#/app/intro";
    if(window.location.hash.indexOf('app') !== -1){
        newUrl = "https://web.quantimo.do/"+window.location.hash;
    }
    addQueryStringAndRedirect(newUrl);
}
function redirectToBuilder() {
    let newUrl = "https://builder.quantimo.do/#/app/configuration";
    addQueryStringAndRedirect(newUrl);
}
function addSubDomainClientIdToQuery(newUrl) {
    if (window.location.search.indexOf('client') === -1) {
        let clientId = getClientIdFromSubDomain();
        if (clientId) {
            newUrl = addUrlQueryParamsToUrlString({clientId: clientId}, newUrl);
        }
    }
    return newUrl;
}
function redirect(newUrl) {
    console.log("Going to " + newUrl);
    window.location.href = newUrl;
}
function addQueryStringWithSubDomainClientIdIfNecessary(newUrl) {
    if (window.location.search) {
        newUrl += window.location.search;
    }
    newUrl = addSubDomainClientIdToQuery(newUrl);
    return newUrl;
}
function isQuantiModoSubDomain() {
    let subDomain = getSubDomain();
    let baseDomain = window.location.host.replace(subDomain + '.', '');
    return baseDomain === 'quantimo.do';
}
function clientSubDomainRedirectToWebWithQueryParam() {
    let ionicUrl = "https://web.quantimo.do/" + window.location.hash;
    ionicUrl = addSubDomainClientIdToQuery(ionicUrl);
    redirect(ionicUrl);
}
function addQueryStringAndRedirect(newUrl) {
    newUrl = addQueryStringWithSubDomainClientIdIfNecessary(newUrl);
    redirect(newUrl);
}
function generalRedirectHandler() {
    const hostToRedirectUrlMap = {
        'studies.quantimo.do': "quantimo.do/studies",
        'build.quantimo.do': "builder.quantimo.do"
    };
    if (typeof hostToRedirectUrlMap[window.location.host] !== "undefined") {
        let newUrl = "https://" + hostToRedirectUrlMap[window.location.host];
        if (window.location.search) {newUrl += window.location.search;}
        redirect(newUrl);
    } else if (isQuantiModoSubDomain() && getSubDomain() !== "web") {
        clientSubDomainRedirectToWebWithQueryParam();
    }
}
