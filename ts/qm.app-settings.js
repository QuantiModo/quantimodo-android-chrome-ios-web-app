"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var env = require("./env-helper");
var api = require("./qm.api");
var qmLog = require("./qm.log");
var timeHelper = require("./qm.time-helper");
env.loadEnv("local");
// tslint:disable-next-line:no-var-requires
var qm = require("../src/js/qmHelpers.js");
function isTruthy(value) { return (value && value !== "false"); }
function getRequestOptions(path) {
    var options = {
        headers: { "User-Agent": "Request-Promise", "Content-Type": "application/json" },
        json: true,
        qs: {
            access_token: env.getAccessToken(),
            allStaticAppData: true,
            clientId: env.getClientId(),
            includeClientSecret: true,
        },
        uri: qm.getAppHostName() + path,
    };
    if (options.qs.access_token) {
        qmLog.info("Using QUANTIMODO_ACCESS_TOKEN: " + options.qs.access_token.substring(0, 4) + "...");
    }
    else {
        qmLog.error("Please add your QUANTIMODO_ACCESS_TOKEN environmental variable from " + env.getAppHostName()
            + "/api/v2/account");
    }
    return options;
}
api.makeApiRequest(getRequestOptions("/api/v1/appSettings"), function (response) {
    qm.staticData = response.staticData;
    process.env.APP_DISPLAY_NAME = qm.getAppDisplayName(); // Need env for Fastlane
    process.env.APP_IDENTIFIER = qm.getAppIdentifier(); // Need env for Fastlane
    function addBuildInfoToAppSettings() {
        qm.getAppSettings().buildServer = qmLog.getCurrentServerContext();
        qm.getAppSettings().buildLink = qm.buildInfoHelper.getBuildLink();
        qm.getAppSettings().versionNumber = qm.buildInfoHelper.buildInfo.versionNumbers.ionicApp;
        qm.getAppSettings().androidVersionCode = qm.buildInfoHelper.buildInfo.versionNumbers.androidVersionCode;
        qm.getAppSettings().debugMode = isTruthy(process.env.APP_DEBUG);
        qm.getAppSettings().builtAt = timeHelper.getUnixTimestampInSeconds();
    }
    addBuildInfoToAppSettings();
    qmLog.info("Got app settings for " + qm.getAppDisplayName() + ". You can change your app settings at " +
        getAppEditUrl());
    // qm.staticData.appSettings = removeCustomPropertiesFromAppSettings(qm.staticData.appSettings);
    if (process.env.APP_HOST_NAME) {
        qm.getAppSettings().apiUrl = process.env.APP_HOST_NAME.replace("https://", "");
    }
});
function getAppEditUrl() {
    return getAppsListUrl() + "?clientId=" + qm.getClientId();
}
function getAppsListUrl() {
    return "https://builder.quantimo.do/#/app/configuration";
}
function getAppDesignerUrl() {
    return "https://builder.quantimo.do/#/app/configuration?clientId=" + qm.getClientId();
}
