import * as qmEnv from "./env-helper"
import * as qmGit from "./qm.git"
import * as qmLog from "./qm.log"
import * as th from "./test-helpers"
export function runEverything(callback: () => void) {
    gi.runFailedApi(function() {
        gi.runFailedIonic(function() {
            gi.runAllIonic(function() {
                gi.runAllApi(function() {
                    if(callback) {callback()}
                    process.exit(0)
                })
            })
        })
    })
}
export function runIonicFailedAll(callback: () => void) {
    gi.runFailedIonic(function() {
        gi.runAllIonic(function() {
            if(callback) {callback()}
            process.exit(0)
        })
    })
}
function logTestParameters(apiUrl: string, startUrl: string, testUrl: string) {
    console.info(`startUrl: ` + startUrl)
    console.info(`apiUrl: ` + apiUrl)
    console.info(`View test at: ` + testUrl)
}
function handleTestErrors(errorMessage: string) {
    let context = gi.context
    if(!context || context === "") {context = "unknown-context"}
    qmGit.setGithubStatus("error", context, errorMessage, th.getBuildLink(), function() {
        throw Error(context + ` Error: ` + errorMessage)
    })
}
export const gi = {
    context: "",
    getStartUrl(): string {
        if (gi.suiteType === "api") {
            return th.getApiUrl() + `/api/v2/auth/login`
        }
        let defaultValue = "https://web.quantimo.do"
        if (th.getApiUrl().indexOf("utopia") !== -1) {
            defaultValue = "https://dev-web.quantimo.do"
        }
        if(process.env.RELEASE_STAGE === "ionic") {
            const CYPRESS_OAUTH_APP_HOST = process.env.CYPRESS_OAUTH_APP_HOST
            if(CYPRESS_OAUTH_APP_HOST) {
                qmLog.info("Using startUrl "+CYPRESS_OAUTH_APP_HOST+ " from process.env.CYPRESS_OAUTH_APP_HOST")
                return CYPRESS_OAUTH_APP_HOST
            }
            return "https://medimodo.herokuapp.com"
        }
        const startUrl = qmEnv.getenv("START_URL", defaultValue)
        if (!startUrl) {
            handleTestErrors("Please set START_URL env")
        }
        // @ts-ignore
        return startUrl
    },
    outputErrorsForTest(testResults: { testName: any; name: any; _id: string; dateExecutionStarted: any;
        dateExecutionFinished: any; console: string | any[] }) {
        const name = testResults.testName || testResults.name
        const url = `https://app.ghostinspector.com/results/` + testResults._id
        console.error(name + ` FAILED: ${url}`)

        qmLog.logBugsnagLink("ionic", testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        qmLog.logBugsnagLink("slim-api", testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        console.error(`=== CONSOLE ERRORS ====`)
        let logObject
        for (logObject of testResults.console) {
            if (logObject.error || logObject.output.toLowerCase().indexOf(`error`) !== -1) {
                console.error(logObject.output + ` at ` + logObject.url)
            }
        }
        qmGit.setGithubStatus("failure", gi.context, name, url, function() {
            process.exit(1)
        })
    },
    suiteType: "",
    suites: {
        api: {
            development: "5c0a8e87c4036f64df154e77",
            production: "5c0a8c83c4036f64df153b3f",
            staging: "5c0a8e5ac4036f64df154d8e",
        },
        ionic: {
            development: "5c072f704182f16946402eb3",
            ionic: "56f5b92519d90d942760ea96",
            production: "5c0729fb4182f16946402914",
            staging: "5c0716164a85d01c022def70",
        },
    },
    getSuiteId(type: string): string {
        gi.suiteType = type
        // @ts-ignore
        return qmEnv.getenv("TEST_SUITE", gi.suites[type][th.getReleaseStage()])
    },
    runAllIonic(callback: () => void) {
        gi.context = "all-gi-ionic"
        // qmTests.currentTask = this.currentTask.name;
        console.info("runAllIonic on RELEASE STAGE "+th.getReleaseStage())
        gi.runTestSuite(gi.getSuiteId("ionic"), gi.getStartUrl(), callback)
    },
    runFailedIonic(callback: () => void) {
        gi.context = "failed-gi-ionic"
        // qmTests.currentTask = this.currentTask.name;
        console.info("runFailedIonic on RELEASE STAGE "+th.getReleaseStage())
        gi.runFailedTests(gi.getSuiteId("ionic"), gi.getStartUrl(), callback)
    },
    runFailedApi(callback: () => void) {
        gi.context = "failed-gi-api"
        // qmTests.currentTask = this.currentTask.name;
        console.info("runFailedApi on RELEASE STAGE "+th.getReleaseStage())
        gi.runFailedTests(gi.getSuiteId("api"), gi.getStartUrl(), callback)
    },
    runAllApi(callback: () => void) {
        gi.context = "all-gi-api"
        // qmTests.currentTask = this.currentTask.name;
        console.info("runAllApi on RELEASE STAGE "+th.getReleaseStage())
        gi.runTestSuite(gi.getSuiteId("api"), gi.getStartUrl(), callback)
    },
    runTests(tests: any[], callback: () => void, startUrl: string) {
        const options = gi.getOptions(startUrl)
        const test = tests.pop()
        const testUrl = `https://app.ghostinspector.com/tests/` + test._id
        qmGit.setGithubStatus("pending", gi.context, options.apiUrl, testUrl)
        logTestParameters(options.apiUrl, options.startUrl, testUrl)
        getGhostInspector().executeTest(test._id, options, function(err: string, testResults: any, passing: any) {
            console.info(`RESULTS:`)
            if (err) {
                handleTestErrors(err)
            }
            if (!passing) {
                gi.outputErrorsForTest(testResults)
                qmGit.setGithubStatus("failure", gi.context, options.apiUrl, testUrl, function() {
                    process.exit(1)
                })
            } else {
                console.log(test.name + " passed! :D")
                qmGit.setGithubStatus("success", gi.context, test.name + " passed! :D", testUrl,
                    function() {
                        if (tests && tests.length) {
                            gi.runTests(tests, callback, startUrl)
                        } else if (callback) {
                            callback()
                        }
                    })
            }
        })
    },
    runFailedTests(suiteId: string, startUrl: string, callback: () => void) {
        console.info(`\n=== Failed ${gi.suiteType.toUpperCase()} GI Tests from suite ${suiteId} ===\n`)
        getGhostInspector().getSuiteTests(suiteId, function(err: string, tests: any[]) {
            function runFailedTests() {
                if (err) {
                    handleTestErrors(err)
                }
                const failedTests = tests.filter(function(test: { passing: any }) {
                    return !test.passing
                })
                if (!failedTests || !failedTests.length) {
                    console.info(`No previously failed tests!`)
                    if (callback) {
                        callback()
                    }
                    return
                } else {
                    tests = failedTests
                }
                let testResult
                for (testResult of tests) {
                    const passFail = (testResult.passing) ? "passed" : "failed"
                    console.info(testResult.name + ` recently ` + passFail)
                }
                gi.runTests(tests, callback, startUrl)
            }
            return runFailedTests()
        })
    },
    runTestSuite(suiteId: string, startUrl: string, callback: () => void) {
        console.info(`\n=== All ${gi.suiteType.toUpperCase()} GI Tests ===\n`)
        const options = gi.getOptions(startUrl)
        const testSuiteUrl = `https://app.ghostinspector.com/suites/` + suiteId
        logTestParameters(options.apiUrl, startUrl, testSuiteUrl)
        qmGit.setGithubStatus("pending", gi.context, options.apiUrl, testSuiteUrl)
        getGhostInspector().executeSuite(suiteId, options, function(err: string, suiteResults: string |
            any[],                                                  passing: boolean) {
            console.info(`RESULTS:`)
            if (err) {
                handleTestErrors(err)
            }
            console.log(passing ? "Passed" : "Failed")
            if (!passing) {
                let testResults
                for (testResults of suiteResults) {
                    if (!testResults.passing) {
                        gi.outputErrorsForTest(testResults)
                    }
                }
            } else {
                console.log(testSuiteUrl + " " + " passed! :D")
                qmGit.setGithubStatus("success", gi.context, options.apiUrl, testSuiteUrl, callback)
            }
        })
    },
    getOptions(startUrl: any) {
        return {
            apiUrl: th.getApiUrl(),
            sha: qmGit.getCurrentGitCommitSha(),
            startUrl: startUrl || gi.getStartUrl(),
        }
    },
}
function getGhostInspector() {
    if (!process.env.GI_API_KEY) {
        handleTestErrors(`Please set GI_API_KEY env from https://app.ghostinspector.com/account`)
    }
    // console.debug(`Using GI_API_KEY starting with ` + process.env.GI_API_KEY.substr(0, 4) + "...")
    return require("ghost-inspector")(process.env.GI_API_KEY)
}
