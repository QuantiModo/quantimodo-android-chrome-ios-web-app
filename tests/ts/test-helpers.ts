import * as fs from "fs"
import rimraf from "rimraf"
import * as qmEnv from "./env-helper"
import * as fileHelper from "./qm.file-helper"
import * as qmGit from "./qm.git"
import * as qmLog from "./qm.log"
export function getBuildLink() {
    if (process.env.BUILD_URL_FOR_STATUS) {
        return process.env.BUILD_URL_FOR_STATUS + "console"
    }
    if (process.env.BUILD_URL) {
        return process.env.BUILD_URL + "console"
    }
    if (process.env.BUDDYBUILD_APP_ID) {
        return "https://dashboard.buddybuild.com/apps/" + process.env.BUDDYBUILD_APP_ID + "/build/" +
            process.env.BUDDYBUILD_APP_ID
    }
    if (process.env.CIRCLE_BUILD_NUM) {
        return "https://circleci.com/gh/QuantiModo/quantimodo-android-chrome-ios-web-app/" +
            process.env.CIRCLE_BUILD_NUM
    }
    if (process.env.TRAVIS_BUILD_ID) {
        return "https://travis-ci.org/" + process.env.TRAVIS_REPO_SLUG + "/builds/" + process.env.TRAVIS_BUILD_ID
    }
}
const successFilename = "success-file"
export function createSuccessFile() {
    fileHelper.writeToFile("lastCommitBuilt", qmGit.getCurrentGitCommitSha())
    return fs.writeFileSync(successFilename, qmGit.getCurrentGitCommitSha())
}
export function deleteSuccessFile() {
    qmLog.info("Deleting success file so we know if build completed...")
    rimraf(successFilename, function() {
        qmLog.info("Deleted success file!")
    })
}
export function deleteEnvFile() {
    rimraf(".env", function() {
        qmLog.info("Deleted env file!")
    })
}
export function getCiProvider(): string {
    if (process.env.CIRCLE_BRANCH) {
        return "circleci"
    }
    if (process.env.BUDDYBUILD_BRANCH) {
        return "buddybuild"
    }
    if (process.env.JENKINS_URL) {
        return "jenkins"
    }
    // @ts-ignore
    return process.env.HOSTNAME
}
export const releaseStages = {
    development: "development",
    production: "production",
    staging: "staging",
}
export const apiUrls = {
    development: "https://local.quantimo.do",
    production: "https://app.quantimo.do",
    staging: "https://staging.quantimo.do",
}

export function getApiUrl(): string {
    if(!process.env.API_URL && process.env.RELEASE_STAGE === "ionic") {
        console.debug("Using https://app.quantimo.do as apiUrl because API_URL env not set and RELEASE_STAGE is ionic")
        return "https://app.quantimo.do"
    }
    let url = qmEnv.getArgumentOrEnv("API_URL", null)
    if(!url) {
        const stage = qmEnv.getArgumentOrEnv("RELEASE_STAGE", null)
        if(stage) {
            // @ts-ignore
            if(typeof apiUrls[stage] !== "undefined") {
                // @ts-ignore
                return apiUrls[stage]
            }
        }
        throw new Error("Please provide API_URL")
    }
    url = url.replace("production.quantimo.do", "app.quantimo.do")
    if (url.indexOf("http") !== 0) {
        url = `https://` + url
    }
    return url
}
export function getReleaseStage() {
    const stage = qmEnv.getArgumentOrEnv("RELEASE_STAGE", null)
    if(stage) {return stage}
    const url = qmEnv.getArgumentOrEnv("API_URL", null)
    if(!url) {
        throw Error("Please set RELEASE_STAGE env")
    }
    if (url.indexOf("utopia.") !== -1) {
        return releaseStages.development
    }
    if (url.indexOf("production.") !== -1) {
        return releaseStages.production
    }
    if (url.indexOf("staging.") !== -1) {
        return releaseStages.staging
    }
    if (url.indexOf("app.") !== -1) {
        return releaseStages.production
    }
    throw Error("Please set RELEASE_STAGE env")
}
export const releaseStage = {
    is: {
        production() {
            return getReleaseStage() === releaseStages.production
        },
        staging() {
            return getReleaseStage() === releaseStages.staging
        },
        development() {
            return getReleaseStage() === releaseStages.development
        },
    },
}
