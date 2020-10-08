"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var rimraf_1 = __importDefault(require("rimraf"));
var qmEnv = __importStar(require("./env-helper"));
var fileHelper = __importStar(require("./qm.file-helper"));
var qmGit = __importStar(require("./qm.git"));
var qmLog = __importStar(require("./qm.log"));
function getBuildLink() {
    if (process.env.BUILD_URL_FOR_STATUS) {
        return process.env.BUILD_URL_FOR_STATUS + "console";
    }
    if (process.env.BUILD_URL) {
        return process.env.BUILD_URL + "console";
    }
    if (process.env.BUDDYBUILD_APP_ID) {
        return "https://dashboard.buddybuild.com/apps/" + process.env.BUDDYBUILD_APP_ID + "/build/" +
            process.env.BUDDYBUILD_APP_ID;
    }
    if (process.env.CIRCLE_BUILD_NUM) {
        return "https://circleci.com/gh/QuantiModo/quantimodo-android-chrome-ios-web-app/" +
            process.env.CIRCLE_BUILD_NUM;
    }
    if (process.env.TRAVIS_BUILD_ID) {
        return "https://travis-ci.org/" + process.env.TRAVIS_REPO_SLUG + "/builds/" + process.env.TRAVIS_BUILD_ID;
    }
}
exports.getBuildLink = getBuildLink;
var successFilename = "success-file";
function createSuccessFile() {
    fileHelper.writeToFile("lastCommitBuilt", qmGit.getCurrentGitCommitSha());
    return fs.writeFileSync(successFilename, qmGit.getCurrentGitCommitSha());
}
exports.createSuccessFile = createSuccessFile;
function deleteSuccessFile() {
    qmLog.info("Deleting success file so we know if build completed...");
    rimraf_1.default(successFilename, function () {
        qmLog.info("Deleted success file!");
    });
}
exports.deleteSuccessFile = deleteSuccessFile;
function deleteEnvFile() {
    rimraf_1.default(".env", function () {
        qmLog.info("Deleted env file!");
    });
}
exports.deleteEnvFile = deleteEnvFile;
function getCiProvider() {
    if (process.env.CIRCLE_BRANCH) {
        return "circleci";
    }
    if (process.env.BUDDYBUILD_BRANCH) {
        return "buddybuild";
    }
    if (process.env.JENKINS_URL) {
        return "jenkins";
    }
    // @ts-ignore
    return process.env.HOSTNAME;
}
exports.getCiProvider = getCiProvider;
exports.releaseStages = {
    development: "development",
    production: "production",
    staging: "staging",
};
exports.apiUrls = {
    development: "https://local.quantimo.do",
    production: "https://app.quantimo.do",
    staging: "https://staging.quantimo.do",
};
function getApiUrl() {
    if (!process.env.API_URL && process.env.RELEASE_STAGE === "ionic") {
        console.debug("Using https://app.quantimo.do as apiUrl because API_URL env not set and RELEASE_STAGE is ionic");
        return "https://app.quantimo.do";
    }
    var url = qmEnv.getArgumentOrEnv("API_URL", null);
    if (!url) {
        var stage = qmEnv.getArgumentOrEnv("RELEASE_STAGE", null);
        if (stage) {
            // @ts-ignore
            if (typeof exports.apiUrls[stage] !== "undefined") {
                // @ts-ignore
                return exports.apiUrls[stage];
            }
        }
        throw new Error("Please provide API_URL");
    }
    url = url.replace("production.quantimo.do", "app.quantimo.do");
    if (url.indexOf("http") !== 0) {
        url = "https://" + url;
    }
    return url;
}
exports.getApiUrl = getApiUrl;
function getReleaseStage() {
    var stage = qmEnv.getArgumentOrEnv("RELEASE_STAGE", null);
    if (stage) {
        return stage;
    }
    var url = qmEnv.getArgumentOrEnv("API_URL", null);
    if (!url) {
        throw Error("Please set RELEASE_STAGE env");
    }
    if (url.indexOf("utopia.") !== -1) {
        return exports.releaseStages.development;
    }
    if (url.indexOf("production.") !== -1) {
        return exports.releaseStages.production;
    }
    if (url.indexOf("staging.") !== -1) {
        return exports.releaseStages.staging;
    }
    if (url.indexOf("app.") !== -1) {
        return exports.releaseStages.production;
    }
    throw Error("Please set RELEASE_STAGE env");
}
exports.getReleaseStage = getReleaseStage;
exports.releaseStage = {
    is: {
        production: function () {
            return getReleaseStage() === exports.releaseStages.production;
        },
        staging: function () {
            return getReleaseStage() === exports.releaseStages.staging;
        },
        development: function () {
            return getReleaseStage() === exports.releaseStages.development;
        },
    },
};
//# sourceMappingURL=test-helpers.js.map