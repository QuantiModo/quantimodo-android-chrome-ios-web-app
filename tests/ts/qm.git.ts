import Octokit from "@octokit/rest"
import appRoot from "app-root-path"
import * as path from "path"
import origin from "remote-origin-url"
// @ts-ignore
import * as git from "simple-git"
import _str from "underscore.string"
import {loadEnv} from "./env-helper"
import * as qmLog from "./qm.log"
import * as qmShell from "./qm.shell"
import {getBuildLink} from "./test-helpers"
export function getOctoKit() {
    return new Octokit({auth: getAccessToken()})
}
export function getCurrentGitCommitSha() {
    if (process.env.GIT_COMMIT_FOR_STATUS) {
        return process.env.GIT_COMMIT_FOR_STATUS
    }
    if (process.env.SOURCE_VERSION) {
        return process.env.SOURCE_VERSION
    }
    if (process.env.GIT_COMMIT) {
        return process.env.GIT_COMMIT
    }
    if (process.env.CIRCLE_SHA1) {
        return process.env.CIRCLE_SHA1
    }
    if (process.env.SHA) {
        return process.env.SHA
    }
    try {
        return require("child_process").execSync("git rev-parse HEAD").toString().trim()
    } catch (error) {
        console.info(error)
    }
}
export function getAccessToken() {
    let t = process.env.GITHUB_ACCESS_TOKEN_FOR_STATUS || process.env.GITHUB_ACCESS_TOKEN || process.env.GH_TOKEN
    if(!t) {
        loadEnv("local")
        t = process.env.GITHUB_ACCESS_TOKEN_FOR_STATUS || process.env.GITHUB_ACCESS_TOKEN || process.env.GH_TOKEN
    }
    if(!t) {
        throw new Error("Please set GITHUB_ACCESS_TOKEN or GH_TOKEN env")
    }
    return t
}
export function getRepoUrl() {
    if (process.env.REPOSITORY_URL_FOR_STATUS) {
        return process.env.REPOSITORY_URL_FOR_STATUS
    }
    if (process.env.GIT_URL) {
        return process.env.GIT_URL
    }
    const appRootString = appRoot.toString()
    const configPath = path.resolve(appRootString, ".git/config")
    // @ts-ignore
    const gitUrl = origin.sync({path: configPath, cwd: appRoot})
    if (!gitUrl) {
        throw new Error('cannot find ".git/config"')
    }
    return gitUrl
}
export function getRepoParts() {
    let gitUrl = getRepoUrl()
    gitUrl = _str.strRight(gitUrl, "github.com/")
    gitUrl = gitUrl.replace(".git", "")
    const parts = gitUrl.split("/")
    if (!parts || parts.length > 2) {
        throw new Error("Could not parse repo name!")
    }
    return parts
}
export function getRepoName() {
    if (process.env.REPO_NAME_FOR_STATUS) {
        return process.env.REPO_NAME_FOR_STATUS
    }
    if (process.env.CIRCLE_PROJECT_REPONAME) {
        return process.env.CIRCLE_PROJECT_REPONAME
    }
    const arr = getRepoParts()
    if (arr) {
        return arr[1]
    }
    throw new Error("Could not determine repo name!")
}
export function getRepoUserName() {
    if (process.env.REPO_USERNAME_FOR_STATUS) {
        return process.env.REPO_USERNAME_FOR_STATUS
    }
    if (process.env.CIRCLE_PROJECT_USERNAME) {
        return process.env.CIRCLE_PROJECT_USERNAME
    }
    const arr = getRepoParts()
    if (arr) {
        return arr[0]
    }
    try {
        return require("child_process").execSync("git rev-parse HEAD").toString().trim()
    } catch (error) {
        // tslint:disable-next-line:no-console
        console.info(error)
    }
}

export const githubStatusStates = {
    error: "error",
    failure: "failure",
    pending: "pending",
    success: "success",
}

/**
 * state can be one of `error`, `failure`, `pending`, or `success`.
 */
// tslint:disable-next-line:max-line-length
export function setGithubStatus(testState: "error" | "failure" | "pending" | "success", context: string,
                                description: string, url?: string | null, cb?: ((arg0: any) => void) | undefined) {
    description = _str.truncate(description, 135)
    url = url || getBuildLink()
    if(!url) {
        const message = "No build link or target url for status!"
        console.error(message)
        if (cb) {cb(message)}
        return
    }
    // @ts-ignore
    const params: Octokit.ReposCreateStatusParams = {
        context,
        description,
        owner: getRepoUserName(),
        repo: getRepoName(),
        sha: getCurrentGitCommitSha(),
        state: testState,
        target_url: url,
    }
    console.log(`${context} - ${description} - ${testState} at ${url}`)
    getOctoKit().repos.createStatus(params).then((data: any) => {
        if (cb) {
            cb(data)
        }
    }).catch((err: any) => {
        console.error(err)
        // Don't fail when we trigger abuse detection mechanism
        // process.exit(1)
        // throw err
    })
}
// tslint:disable-next-line:max-line-length
export function createCommitComment(context: string, body: string, cb?: ((arg0: any) => void) | undefined) {
    body += "\n### "+context+"\n"
    body += "\n[BUILD LOG]("+getBuildLink()+")\n"
    // @ts-ignore
    const params: Octokit.ReposCreateCommitCommentParams = {
        body,
        commit_sha: getCurrentGitCommitSha(),
        owner: getRepoUserName(),
        repo: getRepoName(),
    }
    console.log(body)
    getOctoKit().repos.createCommitComment(params).then((data: any) => {
        if (cb) {
            cb(data)
        }
    }).catch((err: any) => {
        console.error(err)
        // Don't fail when we trigger abuse detection mechanism
        // process.exit(1)
        // throw err
    })
}
export function getBranchName() {
    // tslint:disable-next-line:max-line-length
    const name = process.env.CIRCLE_BRANCH || process.env.BUDDYBUILD_BRANCH || process.env.TRAVIS_BRANCH || process.env.GIT_BRANCH
    if (!name) {
        throw new Error("Branch name not set!")
    }
}
export function deleteLocalFeatureBranches() {
    git.branchLocal(function(branches: []) {
        branches.forEach(function(branch: string) {
            if(branch.indexOf("feature/") !== -1) {
                git.deleteLocalBranch(branch)
            }
        })
    })
}
export function createFeatureBranch(featureName: string) {
    const branchName = "feature/" + featureName
    try {
        qmShell.executeSynchronously(`git checkout -b ${branchName} develop`, false)
    } catch (e) {
        qmLog.error(e)
        return
    }
}
