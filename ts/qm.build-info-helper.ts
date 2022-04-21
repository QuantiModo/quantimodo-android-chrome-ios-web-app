import {paths} from "./env-helper"
import {writeToFile} from "./qm.file-helper"
import * as gitHelper from "./qm.git"
import * as qmLog from "./qm.log"
import * as timeHelper from "./qm.time-helper"
import * as th from "./test-helpers"
const majorMinorVersionNumbers = "2.10."
const date = new Date()
let minorNum = getMinutesSinceMidnight() * 99 / 1440
minorNum = Math.round(minorNum)
const minor = appendLeadingZero(minorNum)
function getPatchVersionNumber() {
    const monthNumber = (date.getMonth() + 1).toString()
    const dayOfMonth = ("0" + date.getDate()).slice(-2)
    return monthNumber + dayOfMonth
}
function getIosMinorVersionNumber() {
    return (getMinutesSinceMidnight()).toString()
}
function getMinutesSinceMidnight() {
    return date.getHours() * 60 + date.getMinutes()
}
function appendLeadingZero(integer: string | number) {return ("0" + integer).slice(-2)}
function getLongDateFormat() {
    return date.getFullYear().toString() + appendLeadingZero(date.getMonth() + 1) + appendLeadingZero(date.getDate())
}

export function getCurrentBuildInfo() {
    return {
        buildLink: th.getBuildLink(),
        buildServer: qmLog.getCurrentServerContext(),
        builtAt: timeHelper.getUnixTimestampInSeconds(),
        builtAtString:  new Date().toISOString(),
        gitBranch: gitHelper.getBranchName(),
        gitCommitShaHash: gitHelper.getCurrentGitCommitSha(),
        iosCFBundleVersion: majorMinorVersionNumbers + getPatchVersionNumber() + "." + getIosMinorVersionNumber(),
        versionNumber: majorMinorVersionNumbers + getPatchVersionNumber(),
        versionNumbers: {
            androidVersionCode: getLongDateFormat() + minor,
            // androidVersionCodes: {armV7: getLongDateFormat() + appendLeadingZero(date.getHours()),
            // x86: getLongDateFormat() + appendLeadingZero(date.getHours() + 1)},
            ionicApp: majorMinorVersionNumbers + getPatchVersionNumber(),
            iosCFBundleVersion: majorMinorVersionNumbers + getPatchVersionNumber() + "." + getIosMinorVersionNumber(),
        },
    }
}
export function writeBuildInfoFile() {
    const as = getCurrentBuildInfo()
    const content =
        'if(typeof qm === "undefined"){if(typeof window === "undefined") {global.qm = {}; }else{window.qm = {};}}\n' +
        'if(typeof qm.staticData === "undefined"){qm.staticData = {};}\n' +
        "qm.staticData.buildInfo =" + qmLog.prettyJSONStringify(as)
    try {
        writeToFile(paths.www.data+"/buildInfo.js", content)
    } catch(e) {
        qmLog.error(e.message + ".  Maybe www/data doesn't exist but it might be resolved when we copy from src")
    }
    try {
        writeToFile("build/chrome_extension/data/buildInfo.js", content)
    } catch(e) {
        qmLog.error(e.message + ".  Maybe build/chrome_extension/data doesn't exist but it might be resolved when we copy from src")
    }
    return writeToFile(paths.src.data+"/buildInfo.js", content)
}
