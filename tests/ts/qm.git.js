"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = __importDefault(require("@octokit/rest"));
var app_root_path_1 = __importDefault(require("app-root-path"));
var path = __importStar(require("path"));
var remote_origin_url_1 = __importDefault(require("remote-origin-url"));
// @ts-ignore
var git = __importStar(require("simple-git"));
var underscore_string_1 = __importDefault(require("underscore.string"));
var env_helper_1 = require("./env-helper");
var qmLog = __importStar(require("./qm.log"));
var qmShell = __importStar(require("./qm.shell"));
var test_helpers_1 = require("./test-helpers");
function getOctoKit() {
    return new rest_1.default({ auth: getAccessToken() });
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
function getAccessToken() {
    var t = process.env.GITHUB_ACCESS_TOKEN_FOR_STATUS || process.env.GITHUB_ACCESS_TOKEN || process.env.GH_TOKEN;
    if (!t) {
        env_helper_1.loadEnv("local");
        t = process.env.GITHUB_ACCESS_TOKEN_FOR_STATUS || process.env.GITHUB_ACCESS_TOKEN || process.env.GH_TOKEN;
    }
    if (!t) {
        throw new Error("Please set GITHUB_ACCESS_TOKEN or GH_TOKEN env");
    }
    return t;
}
exports.getAccessToken = getAccessToken;
function getRepoUrl() {
    if (process.env.REPOSITORY_URL_FOR_STATUS) {
        return process.env.REPOSITORY_URL_FOR_STATUS;
    }
    if (process.env.GIT_URL) {
        return process.env.GIT_URL;
    }
    var appRootString = app_root_path_1.default.toString();
    var configPath = path.resolve(appRootString, ".git/config");
    // @ts-ignore
    var gitUrl = remote_origin_url_1.default.sync({ path: configPath, cwd: app_root_path_1.default });
    if (!gitUrl) {
        throw new Error('cannot find ".git/config"');
    }
    return gitUrl;
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
    description = underscore_string_1.default.truncate(description, 135);
    url = url || test_helpers_1.getBuildLink();
    if (!url) {
        var message = "No build link or target url for status!";
        console.error(message);
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
        console.error(err);
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
//# sourceMappingURL=qm.git.js.map