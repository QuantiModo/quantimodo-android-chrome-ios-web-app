"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var api = __importStar(require("../src/api/node"));
var env = __importStar(require("./env-helper"));
var fileHelper = __importStar(require("./qm.file-helper"));
var qmLog = __importStar(require("./qm.log"));
var timeHelper = __importStar(require("./qm.time-helper"));
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
api.AppSettingsService.getAppSettings(env.getClientId(), true)
    .then(function (AppSettingsResponse) {
    qm.staticData = AppSettingsResponse.staticData;
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
    var url = env.getAppHostName();
    if (url) {
        qm.getAppSettings().apiUrl = url.replace("https://", "");
    }
    return writeStaticDataFile();
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
function writeStaticDataFile() {
    qm.staticData.buildInfo = qm.buildInfoHelper.getCurrentBuildInfo();
    var content = "var staticData = " + qmLog.prettyJSONStringify(qm.staticData) +
        '; if(typeof window !== "undefined"){window.qm.staticData = staticData;} ' +
        ' else if(typeof qm !== "undefined"){qm.staticData = staticData;} else {module.exports = staticData;} ' +
        'if(typeof qm !== "undefined"){qm.stateNames = staticData.stateNames;}';
    try {
        fileHelper.writeToFile(env.paths.www.staticData, content);
    }
    catch (e) {
        qmLog.error(e.message + ".  Maybe www/data doesn't exist but it might be resolved when we copy from src");
    }
    try {
        fileHelper.writeToFile("build/chrome_extension/data/qmStaticData.js", content);
    }
    catch (e) {
        qmLog.error(e.message + ".  Maybe build/chrome_extension/data doesn't exist but it might be resolved when we copy from src");
    }
    return fileHelper.writeToFile(env.paths.src.staticData, content);
}
//# sourceMappingURL=qm.app-settings.js.map