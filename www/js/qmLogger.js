// A separate logger file allows us to use "black-boxing" in the Chrome dev console to preserve actual file line numbers
// BLACK BOX THESE
// \.min\.js$ — for all minified sources
// qmLogger.js
// bugsnag.js
// node_modules and bower_components — for dependencies
//     ~ — home for dependencies in Webpack bundle
// bundle.js — it’s a bundle itself (we use sourcemaps, don’t we?)
// \(webpack\)-hot-middleware — HMR
window.isTruthy = function(value){return value && value !== "false"; };
window.getDebugMode = function() {
    //return true;
    if(window.getUrlParameter('debug') || window.getUrlParameter('debugMode') || (typeof appSettings !== "undefined" && window.isTruthy(appSettings.debugMode))){
        window.debugMode = true;
    }
    return window.debugMode;
};
function getStackTrace() {
    var err = new Error();
    var stackTrace = err.stack;
    stackTrace = stackTrace.substring(stackTrace.indexOf('getStackTrace')).replace('getStackTrace', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logDebug')).replace('window.logDebug', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logInfo')).replace('window.logInfo', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logError')).replace('window.logError', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logDebug')).replace('window.logDebug', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logInfo')).replace('window.logInfo', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logError')).replace('window.logError', '');
    return stackTrace;
}
function addStackTraceToMessage(message, stackTrace) {
    if(message.toLowerCase().indexOf('stacktrace') !== -1){return message;}
    if(!stackTrace){stackTrace = getStackTrace();}
    return message + ".  StackTrace: " + stackTrace;
}
function addCallerFunctionToMessage(message) {
    var calleeFunction = arguments.callee.caller.caller;
    if(calleeFunction && calleeFunction.name && calleeFunction.name !== ""){
        message = "callee " + calleeFunction.name + ": " + message;
    } else if (window.getDebugMode()) {
        return addStackTraceToMessage(message);
    }
    var callerFunction;
    if(calleeFunction){
        try {
            callerFunction = calleeFunction.caller;
        } catch (error) {
            console.error(error);
        }
    }
    if(callerFunction && callerFunction.name && callerFunction.name !== ""){
        return "Caller " + callerFunction.name + " called " + message;
    } else if (window.getDebugMode()) {
        return addStackTraceToMessage(message);
    }
    return message;
}
window.logDebug = function(message) {
    message = addCallerFunctionToMessage(message);
    if(window.getDebugMode()){console.debug(message);}
};
window.logInfo = function(message) {
    message = addCallerFunctionToMessage(message);
    console.info(message);
};
window.logError = function(message, additionalMetaData, stackTrace) {
    if(message && message.message){message = message.message;}
    message = addCallerFunctionToMessage(message);
    bugsnagNotify(message, additionalMetaData, stackTrace);
    console.error(message);
};