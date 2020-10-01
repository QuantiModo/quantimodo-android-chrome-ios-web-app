import sdkRepo from "app-root-path"
import * as cypress from "cypress"
import {slackRunner} from "cypress-slack-reporter/bin/slack/slack-alert.js"
import * as fs from "fs"
// @ts-ignore
import {merge} from "mochawesome-merge"
// @ts-ignore
import marge from "mochawesome-report-generator"
import rimraf from "rimraf"
import {loadEnv} from "./env-helper"
import * as fileHelper from "./qm.file-helper"
import * as qmGit from "./qm.git"
import {createSuccessFile, deleteEnvFile, deleteSuccessFile, getBuildLink, getCiProvider} from "./test-helpers"

loadEnv("local") // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
const ciProvider = getCiProvider()
const isWin = process.platform === "win32"
const outputReportDir = sdkRepo + "/mochawesome-report"
const screenshotDirectory = `${sdkRepo}/mochawesome-report/assets`
const unmerged = sdkRepo + "/cypress/reports/mocha"
const vcsProvider = "github"
const verbose = true
const videoDirectory = `${sdkRepo}/cypress/videos`
const mergedJsonPath = outputReportDir + "/mochawesome.json"
const lastFailedCypressTestPath = "last-failed-cypress-test"
const cypressJson = fileHelper.getAbsolutePath("cypress.json")
const releaseStage = process.env.RELEASE_STAGE || "production"
const envPath = fileHelper.getAbsolutePath(`cypress/config/cypress.${releaseStage}.json`)
const paths = {
    reports: {
        junit: "./cypress/reports/junit",
        mocha: "./cypress/reports/mocha",
    },
}
function getReportUrl() {
    if (process.env.JOB_URL && process.env.JOB_URL.indexOf("DEPLOY-") === 0) {
        return process.env.JOB_URL + "ws/tmp/quantimodo-sdk-javascript/mochawesome-report/mochawesome.html"
    }
    return getBuildLink()
}
export function mochawesome(failedTests: any[], cb: (err: any) => void) {
    // console.log("Merging reports...")
    merge({
        inline: true,
        reportDir: unmerged,
        saveJson: true,
    }).then((mergedJson: any) => {
        fs.writeFileSync(mergedJsonPath, JSON.stringify(mergedJson, null, 2))
        // console.log("Generating report from " + unmerged + " and outputting at " + outputReportDir)
        return marge.create(mergedJson, {
            // cdn: true,
            autoOpen: isWin,
            charts: true,
            inline: true,
            overwrite: true,
            reportDir: outputReportDir,
            saveJson: true,
            showPassed: true,
        })
    }).then((generatedReport: any[]) => {
        console.log("Merged report available here:-", generatedReport[0])
        // tslint:disable-next-line: no-console
        console.log("Constructing Slack message with the following options", {
            ciProvider,
            outputReportDir,
            screenshotDirectory,
            vcsProvider,
            verbose,
            videoDirectory,
        })
        try {
            // @ts-ignore
            // noinspection JSUnusedLocalSymbols
            if (!process.env.SLACK_WEBHOOK_URL) {
                console.error("env SLACK_WEBHOOK_URL not set!")
            } else {
                // @ts-ignore
                slackRunner(
                    ciProvider,
                    vcsProvider,
                    outputReportDir,
                    videoDirectory,
                    screenshotDirectory,
                    verbose,
                )
                // tslint:disable-next-line: no-console
                // console.log("Finished slack upload")
            }
        } catch (error) {
            console.error(error)
        }
        cb(generatedReport[0])
    })
}
function copyCypressEnvConfigIfNecessary() {
    console.info(`Copying ${envPath} to cypress.json`)
    try {
        fs.unlinkSync(cypressJson)
    } catch(err) {
        console.log(err)
    }
    fs.copyFileSync(envPath, cypressJson)
    let cypressJsonString = fs.readFileSync(cypressJson).toString()
    let cypressJsonObject: null
    try {
        cypressJsonObject = JSON.parse(cypressJsonString)
    } catch (e) {
        console.error("Could not parse  "+cypressJson+" because "+e.message+"! Here's the string "+cypressJsonString)
        const fixed = cypressJsonString.replace("}\n}", "}")
        console.error("Going to try replacing extra bracket. Here's the fixed version "+fixed)
        fs.writeFileSync(cypressJson, fixed)
        cypressJsonString = fs.readFileSync(cypressJson).toString()
        cypressJsonObject = JSON.parse(cypressJsonString)
    }
    if(!cypressJsonObject) {
        const before = fs.readFileSync(envPath).toString()
        throw Error(`Could not parse ${cypressJson} after copy! ${envPath} is ${before}`)
    }
    console.info("Cypress Configuration: " + cypressJsonString)
}
function setGithubStatusAndUploadTestResults(failedTests: any[] | null, context: string, cb: (err: any) => void) {
    // @ts-ignore
    const failedTestTitle = failedTests[0].title[1]
    // @ts-ignore
    const errorMessage = failedTests[0].error
    qmGit.setGithubStatus("failure", context, failedTestTitle + ": " +
        errorMessage, getReportUrl(), function() {
        uploadTestResults(function() {
            console.error(errorMessage)
            cb(errorMessage)
            // resolve();
        })
    })
}
function deleteJUnitTestResults() {
    const jUnitFiles = paths.reports.junit + "/*.xml"
    rimraf(jUnitFiles, function() {
        console.debug(`Deleted ${jUnitFiles}`)
    })
}

function logFailedTests(failedTests: any[], context: string, cb: (err: any) => void) {
    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < failedTests.length; j++) {
        const test = failedTests[j]
        const testName = test.title[1]
        let errorMessage = test.error || test.message
        if(!errorMessage) {
            errorMessage = JSON.stringify(test)
            console.error("no test.error or test.message property in "+errorMessage)
        }
        console.error("==============================================")
        console.error(testName + " FAILED")
        console.error(errorMessage)
        console.error("==============================================")
    }
    mochawesome(failedTests, function() {
        setGithubStatusAndUploadTestResults(failedTests, context, cb)
    })
}

export function runWithRecording(specName: string, cb: (err: any) => void) {
    const specsPath = getSpecsPath()
    const specPath = specsPath + "/" + specName
    const browser = process.env.CYPRESS_BROWSER || "electron"
    const context = specName.replace("_spec.js", "") + "-" + releaseStage
    console.info("Re-running " + specName + " with recording so you can check it at https://dashboard.cypress.io/")
    cypress.run({
        browser,
        record: true,
        spec: specPath,
    }).then((recordingResults) => {
        let runUrl: string | undefined = "No runUrl provided so just go to https://dashboard.cypress.io/"
        if ("runUrl" in recordingResults) {
            runUrl = recordingResults.runUrl
        }
        qmGit.setGithubStatus("error", context, "View recording of "+specName,
            runUrl)
        qmGit.createCommitComment(context, "\nView recording of "+specName+"\n"+
            "[Cypress Dashboard]("+runUrl+")")
        cb(recordingResults)
    })
}

function getFailedTestsFromResults(results: any) {
    if(!results.runs) {
        console.error("No runs on results obj: ", results)
    }
    const tests = results.runs[0].tests
    let failedTests: any[] = []
    if (tests) {
        failedTests = tests.filter(function(test: { state: string; }) {
            return test.state === "failed"
        })
        if (!failedTests) {
            failedTests = []
        }
    } else {
        console.error("No tests on ", results.runs[0])
    }
    return failedTests
}

function handleTestSuccess(results: any, context: string, cb: (err: any) => void) {
    deleteLastFailedCypressTest()
    console.info(results.totalPassed + " tests PASSED!")
    qmGit.setGithubStatus("success", context, results.totalPassed +
        " tests passed")
    cb(false)
}

export function runOneCypressSpec(specName: string, cb: ((err: any) => void)) {
    fs.writeFileSync(lastFailedCypressTestPath, specName) // Set last failed first so it exists if we have an exception
    const specsPath = getSpecsPath()
    const specPath = specsPath + "/" + specName
    const browser = process.env.CYPRESS_BROWSER || "electron"
    const context = specName.replace("_spec.js", "") + "-" + releaseStage
    qmGit.setGithubStatus("pending", context, `Running ${context} Cypress tests...`)
    // noinspection JSUnresolvedFunction
    cypress.run({
        browser,
        spec: specPath,
    }).then((results) => {
        // @ts-ignore
        if (!results.runs || !results.runs[0]) {
            console.log("No runs property on " + JSON.stringify(results, null, 2))
            cb(false)
        } else {
            const failedTests = getFailedTestsFromResults(results)
            if (failedTests.length) {
                process.env.LOGROCKET = "1"
                runWithRecording(specName, function(recordResults) {
                    const failedRecordedTests = getFailedTestsFromResults(recordResults)
                    if (failedRecordedTests.length) {
                        logFailedTests(failedRecordedTests, context, function(errorMessage) {
                            cb(errorMessage)
                            process.exit(1)
                        })
                    } else {
                        delete process.env.LOGROCKET
                        handleTestSuccess(results, context, cb)
                    }
                })
            } else {
                handleTestSuccess(results, context, cb)
            }
        }
    }).catch((runtimeError: any) => {
        qmGit.setGithubStatus("error", context, runtimeError, getReportUrl(), function() {
            console.error(runtimeError)
            process.exit(1)
        })
    })
}

function getSpecsPath() {
    return sdkRepo + "/cypress/integration"
}

export function runCypressTests(cb?: (err: any) => void) {
    deleteSuccessFile()
    try {
        copyCypressEnvConfigIfNecessary()
    } catch (e) {
        console.error(e.message+"!  Going to try again...")
        copyCypressEnvConfigIfNecessary()
    }
    deleteJUnitTestResults()
    rimraf(paths.reports.mocha + "/*.json", function() {
        const specsPath = getSpecsPath()
        fs.readdir(specsPath, function(err: any, specFileNames: string[]) {
            if (!specFileNames) {
                throw new Error("No specFileNames in " + specsPath)
            }
            for (let i = 0, p = Promise.resolve(); i < specFileNames.length; i++) {
                const specName = specFileNames[i]
                if (releaseStage === "ionic" && specName.indexOf("ionic_") === -1) {
                    console.debug("skipping " + specName + " because it doesn't test ionic app and release stage is "+
                        releaseStage)
                    continue
                }
                p = p.then((_) => new Promise((resolve) => {
                    runOneCypressSpec(specName,function() {
                        if (i === specFileNames.length - 1) {
                            createSuccessFile()
                            deleteEnvFile()
                            if (cb) {
                                cb(false)
                            }
                        }
                        resolve()
                    })
                }))
            }
        })
    })
}
function getLastFailedCypressTest() {
    try {
        return fs.readFileSync(lastFailedCypressTestPath, "utf8")
    } catch (error) {
        return null
    }
}
function deleteLastFailedCypressTest() {
    // tslint:disable-next-line:no-empty
    try {
        fs.unlinkSync(lastFailedCypressTestPath)
    } catch (err) {
        console.debug("No last-failed-cypress-test file to delete")
    }
}
// tslint:disable-next-line:unified-signatures
export function runLastFailedCypressTest(cb: (err: any) => void) {
    const name = getLastFailedCypressTest()
    if (!name) {
        console.info("No previously failed test!")
        cb(false)
        return
    }
    deleteSuccessFile()
    try {
        copyCypressEnvConfigIfNecessary()
    } catch (e) {
        console.error(e.message+"!  Going to try again...")
        copyCypressEnvConfigIfNecessary()
    }
    runOneCypressSpec(name, cb)
}
export function uploadTestResults(cb: (arg0: any) => void) {
    const path = "mochawesome/" + qmGit.getCurrentGitCommitSha()
    fileHelper.uploadToS3("./mochawesome-report/mochawesome.html", path, cb, "quantimodo",
        "public-read", "text/html")
}
