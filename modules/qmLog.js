var qmLog = {
    error: function (message, metaData, maxCharacters) {
        metaData = qmLog.addMetaData(metaData);
        console.error(qmLog.obfuscateStringify(message, metaData, maxCharacters));
        metaData.build_info = qmGulp.buildInfoHelper.getCurrentBuildInfo();
        bugsnag.notify(new Error(qmLog.obfuscateStringify(message), qmLog.obfuscateSecrets(metaData)));
    },
    info: function (message, object, maxCharacters) {console.log(qmLog.obfuscateStringify(message, object, maxCharacters));},
    debug: function (message, object, maxCharacters) {
        if(isTruthy(process.env.BUILD_DEBUG || process.env.DEBUG_BUILD)){
            qmLog.info("DEBUG: " + message, object, maxCharacters);
        }
    },
    logErrorAndThrowException: function (message, object) {
        qmLog.error(message, object);
        throw message;
    },
    addMetaData: function(metaData){
        metaData = metaData || {};
        metaData.environment = qmLog.obfuscateSecrets(process.env);
        metaData.subsystem = { name: qmLog.getCurrentServerContext() };
        metaData.client_id = QUANTIMODO_CLIENT_ID;
        metaData.build_link = qmGulp.buildInfoHelper.getBuildLink();
        return metaData;
    },
    obfuscateStringify: function(message, object, maxCharacters) {
        if(maxCharacters !== false){maxCharacters = maxCharacters || 140;}
        var objectString = '';
        if(object){
            object = qmLog.obfuscateSecrets(object);
            objectString = ':  ' + qmLog.prettyJSONStringify(object);
        }
        if (maxCharacters !== false && objectString.length > maxCharacters) {objectString = objectString.substring(0, maxCharacters) + '...';}
        message += objectString;
        if(process.env.QUANTIMODO_CLIENT_SECRET){message = message.replace(process.env.QUANTIMODO_CLIENT_SECRET, 'HIDDEN');}
        if(process.env.AWS_SECRET_ACCESS_KEY){message = message.replace(process.env.AWS_SECRET_ACCESS_KEY, 'HIDDEN');}
        if(process.env.ENCRYPTION_SECRET){message = message.replace(process.env.ENCRYPTION_SECRET, 'HIDDEN');}
        if(process.env.QUANTIMODO_ACCESS_TOKEN){message = message.replace(process.env.QUANTIMODO_ACCESS_TOKEN, 'HIDDEN');}
        return message;
    },
    obfuscateSecrets: function(object){
        if(typeof object !== 'object'){return object;}
        object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                var lowerCaseProperty = propertyName.toLowerCase();
                if(lowerCaseProperty.indexOf('secret') !== -1 || lowerCaseProperty.indexOf('password') !== -1 || lowerCaseProperty.indexOf('token') !== -1){
                    object[propertyName] = "HIDDEN";
                } else {
                    object[propertyName] = qmLog.obfuscateSecrets(object[propertyName]);
                }
            }
        }
        return object;
    },
    getCurrentServerContext: function() {
        if(process.env.CIRCLE_BRANCH){return "circleci";}
        if(process.env.BUDDYBUILD_BRANCH){return "buddybuild";}
        return process.env.HOSTNAME;
    },
    prettyJSONStringify: function(object) {return JSON.stringify(object, null, '\t');}
};
var bugsnag = require("bugsnag");
bugsnag.register("ae7bc49d1285848342342bb5c321a2cf");
bugsnag.releaseStage = qmLog.getCurrentServerContext();
process.on('unhandledRejection', function (err) {
    console.error("Unhandled rejection: " + (err && err.stack || err));
    bugsnag.notify(err);
});
bugsnag.onBeforeNotify(function (notification) {
    var metaData = notification.events[0].metaData;
    metaData = qmLog.addMetaData(metaData);
});
if(typeof window !== "undefined"){ window.qmLog = qmLog;} else {module.exports = qmLog;}