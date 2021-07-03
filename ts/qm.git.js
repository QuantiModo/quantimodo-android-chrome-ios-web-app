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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeatureBranch = exports.deleteLocalFeatureBranches = exports.getBranchName = exports.createCommitComment = exports.setGithubStatus = exports.githubStatusStates = exports.getRepoUserName = exports.getRepoName = exports.getRepoParts = exports.getRepoUrl = exports.getCurrentGitCommitSha = exports.getOctoKit = void 0;
var rest_1 = __importDefault(require("@octokit/rest"));
// @ts-ignore
var git = __importStar(require("simple-git"));
var underscore_string_1 = __importDefault(require("underscore.string"));
var env_helper_1 = require("./env-helper");
var qmLog = __importStar(require("./qm.log"));
var qmShell = __importStar(require("./qm.shell"));
var test_helpers_1 = require("./test-helpers");
// tslint:disable-next-line:no-var-requires
var qm = require("../src/js/qmHelpers.js");
function getOctoKit() {
    return new rest_1.default({ auth: env_helper_1.getGithubAccessToken() });
}
exports.getOctoKit = getOctoKit;
function getCurrentGitCommitSha() {
    if (process.env.GIT_COMMIT_FOR_STATUS) {
        return process.env.GIT_COMMIT_FOR_STATUS;
    }
    if (process.env.SOURCE_VERSION) {
        return process.env.SOURCE_VERSION;
    }
    if (process.env.GIT_COMMIT) {
        return process.env.GIT_COMMIT;
    }
    if (process.env.CIRCLE_SHA1) {
        return process.env.CIRCLE_SHA1;
    }
    if (process.env.SHA) {
        return process.env.SHA;
    }
    try {
        return require("child_process").execSync("git rev-parse HEAD").toString().trim();
    }
    catch (error) {
        console.info(error);
    }
}
exports.getCurrentGitCommitSha = getCurrentGitCommitSha;
function getRepoUrl() {
    if (process.env.REPOSITORY_URL_FOR_STATUS) {
        return process.env.REPOSITORY_URL_FOR_STATUS;
    }
    if (process.env.GIT_URL) {
        return process.env.GIT_URL;
    }
    return "https://github.com/QuantiModo/quantimodo-android-chrome-ios-web-app.git";
}
exports.getRepoUrl = getRepoUrl;
function getRepoParts() {
    var gitUrl = getRepoUrl();
    gitUrl = underscore_string_1.default.strRight(gitUrl, "github.com/");
    gitUrl = gitUrl.replace(".git", "");
    var parts = gitUrl.split("/");
    if (!parts || parts.length > 2) {
        throw new Error("Could not parse repo name!");
    }
    return parts;
}
exports.getRepoParts = getRepoParts;
function getRepoName() {
    if (process.env.REPO_NAME_FOR_STATUS) {
        return process.env.REPO_NAME_FOR_STATUS;
    }
    if (process.env.CIRCLE_PROJECT_REPONAME) {
        return process.env.CIRCLE_PROJECT_REPONAME;
    }
    var arr = getRepoParts();
    if (arr) {
        return arr[1];
    }
    throw new Error("Could not determine repo name!");
}
exports.getRepoName = getRepoName;
function getRepoUserName() {
    if (process.env.REPO_USERNAME_FOR_STATUS) {
        return process.env.REPO_USERNAME_FOR_STATUS;
    }
    if (process.env.CIRCLE_PROJECT_USERNAME) {
        return process.env.CIRCLE_PROJECT_USERNAME;
    }
    var arr = getRepoParts();
    if (arr) {
        return arr[0];
    }
    try {
        return require("child_process").execSync("git rev-parse HEAD").toString().trim();
    }
    catch (error) {
        // tslint:disable-next-line:no-console
        console.info(error);
    }
}
exports.getRepoUserName = getRepoUserName;
exports.githubStatusStates = {
    error: "error",
    failure: "failure",
    pending: "pending",
    success: "success",
};
/**
 * state can be one of `error`, `failure`, `pending`, or `success`.
 */
// tslint:disable-next-line:max-line-length
function setGithubStatus(testState, context, description, url, cb) {
    if (testState === "error") {
        qmLog.error(description + " " + context);
    }
    qmLog.info("Setting status on Github: " + description + " " + context);
    description = underscore_string_1.default.truncate(description, 135);
    url = url || test_helpers_1.getBuildLink();
    if (!url) {
        url = "No url from getBuildLink()";
        var message = "No build link or target url for status!";
        if (!qm.env.isLocal()) {
            console.error(message);
        }
        if (cb) {
            cb(message);
        }
        return;
    }
    // @ts-ignore
    var params = {
        context: context,
        description: description,
        owner: getRepoUserName(),
        repo: getRepoName(),
        sha: getCurrentGitCommitSha(),
        state: testState,
        target_url: url,
    };
    console.log(context + " - " + description + " - " + testState + " at " + url);
    getOctoKit().repos.createStatus(params).then(function (data) {
        if (cb) {
            cb(data);
        }
    }).catch(function (err) {
        qmLog.error(err);
        if (cb) {
            cb(err);
        }
        // Don't fail when we trigger abuse detection mechanism
        // process.exit(1)
        // throw err
    });
}
exports.setGithubStatus = setGithubStatus;
// tslint:disable-next-line:max-line-length
function createCommitComment(context, body, cb) {
    body += "\n### " + context + "\n";
    body += "\n[BUILD LOG](" + test_helpers_1.getBuildLink() + ")\n";
    // @ts-ignore
    var params = {
        body: body,
        commit_sha: getCurrentGitCommitSha(),
        owner: getRepoUserName(),
        repo: getRepoName(),
    };
    console.log(body);
    getOctoKit().repos.createCommitComment(params).then(function (data) {
        if (cb) {
            cb(data);
        }
    }).catch(function (err) {
        console.error(err);
        // Don't fail when we trigger abuse detection mechanism
        // process.exit(1)
        // throw err
    });
}
exports.createCommitComment = createCommitComment;
function getBranchName() {
    // tslint:disable-next-line:max-line-length
    var name = process.env.CIRCLE_BRANCH || process.env.BUDDYBUILD_BRANCH || process.env.TRAVIS_BRANCH || process.env.GIT_BRANCH;
    if (!name) {
        throw new Error("Branch name not set!");
    }
}
exports.getBranchName = getBranchName;
function deleteLocalFeatureBranches() {
    git.branchLocal(function (branches) {
        branches.forEach(function (branch) {
            if (branch.indexOf("feature/") !== -1) {
                git.deleteLocalBranch(branch);
            }
        });
    });
}
exports.deleteLocalFeatureBranches = deleteLocalFeatureBranches;
function createFeatureBranch(featureName) {
    var branchName = "feature/" + featureName;
    try {
        qmShell.executeSynchronously("git checkout -b " + branchName + " develop", false);
    }
    catch (e) {
        qmLog.error(e);
        return;
    }
}
exports.createFeatureBranch = createFeatureBranch;
function createFeatureBranch(featureName) {
    var branchName = "feature/" + featureName;
    try {
        qmShell.executeSynchronously("git checkout -b " + branchName + " develop", false);
    }
    catch (e) {
        qmLog.error(e);
        return;
    }
}
exports.createFeatureBranch = createFeatureBranch;
//# sourceMappingURL=qm.git.js.map