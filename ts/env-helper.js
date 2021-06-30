"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true, get: function () {
            return m[k];
        }
    });
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", {enumerable: true, value: v});
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.paths = exports.getAccessToken = exports.getAppHostName = exports.getClientSecret = exports.getClientId = exports.loadEnv = exports.getRequiredArgumentOrEnv = exports.getArgumentOrEnv = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
var fileHelper = __importStar(require("./qm.file-helper"));
var envs = {
    APP_HOST_NAME: "APP_HOST_NAME",
    QUANTIMODO_ACCESS_TOKEN: "QUANTIMODO_ACCESS_TOKEN",
    QUANTIMODO_CLIENT_ID: "QUANTIMODO_CLIENT_ID",
    QUANTIMODO_CLIENT_SECRET: "QUANTIMODO_CLIENT_SECRET",
};
function getArgumentOrEnv(name, defaultValue) {
    if (typeof process.env[name] !== "undefined") {
        // @ts-ignore
        return process.env[name];
    }
    if (typeof defaultValue === "undefined") {
        throw new Error("Please specify " + name + " in .env file in the root of this repo");
    }
    return defaultValue;
}

exports.getArgumentOrEnv = getArgumentOrEnv;

function getRequiredArgumentOrEnv(name, defaultValue) {
    var val = getArgumentOrEnv(name, defaultValue);
    if (!val) {
        throw new Error("Please specify " + name + " env or argument");
    }
    return val;
}

exports.getRequiredArgumentOrEnv = getRequiredArgumentOrEnv;

function loadEnv(path) {
    if (!path) {
        path = fileHelper.getAbsolutePath(".env");
    }
    console.info("Loading .env");
    // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    var result = dotenv_1.default.config();
    if (result.error) {
        throw result.error;
    }
    console.log(result.parsed);
}

exports.loadEnv = loadEnv;

function getClientId() {
    return getRequiredArgumentOrEnv(envs.QUANTIMODO_CLIENT_ID);
}

exports.getClientId = getClientId;

function getClientSecret() {
    return getArgumentOrEnv(envs.QUANTIMODO_CLIENT_ID);
}

exports.getClientSecret = getClientSecret;

function getAppHostName() {
    return getArgumentOrEnv(envs.APP_HOST_NAME);
}

exports.getAppHostName = getAppHostName;

function getAccessToken() {
    return getRequiredArgumentOrEnv(envs.QUANTIMODO_ACCESS_TOKEN);
}

exports.getAccessToken = getAccessToken;
exports.paths = {
    apk: {
        arm7Release: "platforms/android/app/build/outputs/apk/release/app-arm7-release.apk",
        builtApk: null,
        combinedDebug: "platforms/android/app/build/outputs/apk/release/app-debug.apk",
        combinedRelease: "platforms/android/app/build/outputs/apk/release/app-release.apk",
        outputFolder: "platforms/android/app/build/outputs/apk",
        x86Release: "platforms/android/app/build/outputs/apk/release/app-x86-release.apk",
    },
    chcpLogin: ".chcplogin",
    sass: ["./src/scss/**/*.scss"],
    src: {
        defaultPrivateConfig: "src/default.private_config.json",
        devCredentials: "src/dev-credentials.json",
        firebase: "src/lib/firebase/**/*",
        icons: "src/img/icons",
        js: "src/js/*.js",
        serviceWorker: "src/firebase-messaging-sw.js",
        staticData: "src/data/qmStaticData.js",
    },
    www: {
        defaultPrivateConfig: "www/default.private_config.json",
        devCredentials: "www/dev-credentials.json",
        firebase: "www/lib/firebase/",
        icons: "www/img/icons",
        js: "www/js/",
        scripts: "www/scripts",
        staticData: "src/data/qmStaticData.js",
    },
};
loadEnv();
//# sourceMappingURL=env-helper.js.map
