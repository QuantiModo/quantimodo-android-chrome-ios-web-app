"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test_helpers_1 = require("./test-helpers");
var QUANTIMODO_CLIENT_ID = process.env.QUANTIMODO_CLIENT_ID || process.env.CLIENT_ID;
// tslint:disable-next-line:max-line-length
var AWS_SECRET_ACCESS_KEY = process.env.QM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY; // Netlify has their own
function isTruthy(value) { return (value && value !== "false"); }
function error(message, metaData, maxCharacters) {
    metaData = addMetaData(metaData);
    console.error(obfuscateStringify(message, metaData, maxCharacters));
    // bugsnag.notify(new Error(obfuscateStringify(message)));
}
exports.error = error;
function info(message, object, maxCharacters) {
    console.info(obfuscateStringify(message, object, maxCharacters));
}
exports.info = info;
function debug(message, object, maxCharacters) {
    if (isTruthy(process.env.BUILD_DEBUG || process.env.DEBUG_BUILD)) {
        info("DEBUG: " + message, object, maxCharacters);
    }
}
exports.debug = debug;
function addMetaData(metaData) {
    metaData = metaData || {};
    metaData.environment = obfuscateSecrets(process.env);
    metaData.subsystem = { name: test_helpers_1.getCiProvider() };
    metaData.client_id = QUANTIMODO_CLIENT_ID;
    metaData.build_link = test_helpers_1.getBuildLink();
    return metaData;
}
exports.addMetaData = addMetaData;
function obfuscateStringify(message, object, maxCharacters) {
    maxCharacters = maxCharacters || 140;
    var objectString = "";
    if (object) {
        object = obfuscateSecrets(object);
        objectString = ":  " + prettyJSONStringify(object);
    }
    if (maxCharacters && objectString.length > maxCharacters) {
        objectString = objectString.substring(0, maxCharacters) + "...";
    }
    message += objectString;
    if (process.env.QUANTIMODO_CLIENT_SECRET) {
        message = message.replace(process.env.QUANTIMODO_CLIENT_SECRET, "HIDDEN");
    }
    if (AWS_SECRET_ACCESS_KEY) {
        message = message.replace(AWS_SECRET_ACCESS_KEY, "HIDDEN");
    }
    if (process.env.ENCRYPTION_SECRET) {
        message = message.replace(process.env.ENCRYPTION_SECRET, "HIDDEN");
    }
    if (process.env.QUANTIMODO_ACCESS_TOKEN) {
        message = message.replace(process.env.QUANTIMODO_ACCESS_TOKEN, "HIDDEN");
    }
    message = obfuscateString(message);
    return message;
}
exports.obfuscateStringify = obfuscateStringify;
function isSecretWord(propertyName) {
    var lowerCaseProperty = propertyName.toLowerCase();
    return lowerCaseProperty.indexOf("secret") !== -1 ||
        lowerCaseProperty.indexOf("password") !== -1 ||
        lowerCaseProperty.indexOf("key") !== -1 ||
        lowerCaseProperty.indexOf("database") !== -1 ||
        lowerCaseProperty.indexOf("token") !== -1;
}
exports.isSecretWord = isSecretWord;
function obfuscateString(str) {
    var env = process.env;
    for (var propertyName in env) {
        if (env.hasOwnProperty(propertyName)) {
            if (isSecretWord(propertyName)) {
                // @ts-ignore
                str = str.replace(env[propertyName], "[SECURE]");
            }
        }
    }
    return str;
}
exports.obfuscateString = obfuscateString;
function obfuscateSecrets(object) {
    if (typeof object !== "object") {
        return object;
    }
    object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
    for (var propertyName in object) {
        if (object.hasOwnProperty(propertyName)) {
            if (isSecretWord(propertyName)) {
                object[propertyName] = "[SECURE]";
            }
            else {
                object[propertyName] = obfuscateSecrets(object[propertyName]);
            }
        }
    }
    return object;
}
exports.obfuscateSecrets = obfuscateSecrets;
function prettyJSONStringify(object) {
    return JSON.stringify(object, null, "\t");
}
exports.prettyJSONStringify = prettyJSONStringify;
function logBugsnagLink(suite, start, end) {
    var query = "filters[event.since][0]=" + start +
        "&filters[error.status][0]=open&filters[event.before][0]=" + end +
        "&sort=last_seen";
    console.error("https://app.bugsnag.com/quantimodo/" + suite + "/errors?" + query);
}
exports.logBugsnagLink = logBugsnagLink;
//# sourceMappingURL=qm.log.js.map