"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var qmEnv = __importStar(require("./env-helper"));
var qmGit = __importStar(require("./qm.git"));
var qmLog = __importStar(require("./qm.log"));
var th = __importStar(require("./test-helpers"));
function runEverything(callback) {
    exports.gi.runFailedApi(function () {
        exports.gi.runFailedIonic(function () {
            exports.gi.runAllIonic(function () {
                exports.gi.runAllApi(function () {
                    if (callback) {
                        callback();
                    }
                    process.exit(0);
                });
            });
        });
    });
}
exports.runEverything = runEverything;
function runIonicFailedAll(callback) {
    exports.gi.runFailedIonic(function () {
        exports.gi.runAllIonic(function () {
            if (callback) {
                callback();
            }
            process.exit(0);
        });
    });
}
exports.runIonicFailedAll = runIonicFailedAll;
function logTestParameters(apiUrl, startUrl, testUrl) {
    console.info("startUrl: " + startUrl);
    console.info("apiUrl: " + apiUrl);
    console.info("View test at: " + testUrl);
}
function handleTestErrors(errorMessage) {
    var context = exports.gi.context;
    if (!context || context === "") {
        context = "unknown-context";
    }
    qmGit.setGithubStatus("error", context, errorMessage, th.getBuildLink(), function () {
        throw Error(context + " Error: " + errorMessage);
    });
}
exports.gi = {
    context: "",
    getStartUrl: function () {
        if (exports.gi.suiteType === "api") {
            return th.getApiUrl() + "/api/v2/auth/login";
        }
        var defaultValue = "https://web.quantimo.do";
        if (th.getApiUrl().indexOf("utopia") !== -1) {
            defaultValue = "https://dev-web.quantimo.do";
        }
        if (process.env.RELEASE_STAGE === "ionic") {
            return "https://medimodo.herokuapp.com";
        }
        var startUrl = qmEnv.getArgumentOrEnv("START_URL", defaultValue);
        if (!startUrl) {
            handleTestErrors("Please set START_URL env");
        }
        // @ts-ignore
        return startUrl;
    },
    outputErrorsForTest: function (testResults) {
        var name = testResults.testName || testResults.name;
        var url = "https://app.ghostinspector.com/results/" + testResults._id;
        console.error(name + (" FAILED: " + url));
        qmLog.logBugsnagLink("ionic", testResults.dateExecutionStarted, testResults.dateExecutionFinished);
        qmLog.logBugsnagLink("slim-api", testResults.dateExecutionStarted, testResults.dateExecutionFinished);
        console.error("=== CONSOLE ERRORS ====");
        var logObject;
        for (var _i = 0, _a = testResults.console; _i < _a.length; _i++) {
            logObject = _a[_i];
            if (logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1) {
                console.error(logObject.output + " at " + logObject.url);
            }
        }
        qmGit.setGithubStatus("failure", exports.gi.context, name, url, function () {
            process.exit(1);
        });
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
    getSuiteId: function (type) {
        exports.gi.suiteType = type;
        // @ts-ignore
        return qmEnv.getArgumentOrEnv("TEST_SUITE", exports.gi.suites[type][th.getReleaseStage()]);
    },
    runAllIonic: function (callback) {
        exports.gi.context = "all-gi-ionic";
        // qmTests.currentTask = this.currentTask.name;
        console.info("runAllIonic on RELEASE STAGE " + th.getReleaseStage());
        exports.gi.runTestSuite(exports.gi.getSuiteId("ionic"), exports.gi.getStartUrl(), callback);
    },
    runFailedIonic: function (callback) {
        exports.gi.context = "failed-gi-ionic";
        // qmTests.currentTask = this.currentTask.name;
        console.info("runFailedIonic on RELEASE STAGE " + th.getReleaseStage());
        exports.gi.runFailedTests(exports.gi.getSuiteId("ionic"), exports.gi.getStartUrl(), callback);
    },
    runFailedApi: function (callback) {
        exports.gi.context = "failed-gi-api";
        // qmTests.currentTask = this.currentTask.name;
        console.info("runFailedApi on RELEASE STAGE " + th.getReleaseStage());
        exports.gi.runFailedTests(exports.gi.getSuiteId("api"), exports.gi.getStartUrl(), callback);
    },
    runAllApi: function (callback) {
        exports.gi.context = "all-gi-api";
        // qmTests.currentTask = this.currentTask.name;
        console.info("runAllApi on RELEASE STAGE " + th.getReleaseStage());
        exports.gi.runTestSuite(exports.gi.getSuiteId("api"), exports.gi.getStartUrl(), callback);
    },
    runTests: function (tests, callback, startUrl) {
        var options = exports.gi.getOptions(startUrl);
        var test = tests.pop();
        var testUrl = "https://app.ghostinspector.com/tests/" + test._id;
        qmGit.setGithubStatus("pending", exports.gi.context, options.apiUrl, testUrl);
        logTestParameters(options.apiUrl, options.startUrl, testUrl);
        getGhostInspector().executeTest(test._id, options, function (err, testResults, passing) {
            console.info("RESULTS:");
            if (err) {
                handleTestErrors(err);
            }
            if (!passing) {
                exports.gi.outputErrorsForTest(testResults);
                qmGit.setGithubStatus("failure", exports.gi.context, options.apiUrl, testUrl, function () {
                    process.exit(1);
                });
            }
            else {
                console.log(test.name + " passed! :D");
                qmGit.setGithubStatus("success", exports.gi.context, test.name + " passed! :D", testUrl, function () {
                    if (tests && tests.length) {
                        exports.gi.runTests(tests, callback, startUrl);
                    }
                    else if (callback) {
                        callback();
                    }
                });
            }
        });
    },
    runFailedTests: function (suiteId, startUrl, callback) {
        console.info("\n=== Failed " + exports.gi.suiteType.toUpperCase() + " GI Tests from suite " + suiteId + " ===\n");
        getGhostInspector().getSuiteTests(suiteId, function (err, tests) {
            function runFailedTests() {
                if (err) {
                    handleTestErrors(err);
                }
                var failedTests = tests.filter(function (test) {
                    return !test.passing;
                });
                if (!failedTests || !failedTests.length) {
                    console.info("No previously failed tests!");
                    if (callback) {
                        callback();
                    }
                    return;
                }
                else {
                    tests = failedTests;
                }
                var testResult;
                for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
                    testResult = tests_1[_i];
                    var passFail = (testResult.passing) ? "passed" : "failed";
                    console.info(testResult.name + " recently " + passFail);
                }
                exports.gi.runTests(tests, callback, startUrl);
            }
            return runFailedTests();
        });
    },
    runTestSuite: function (suiteId, startUrl, callback) {
        console.info("\n=== All " + exports.gi.suiteType.toUpperCase() + " GI Tests ===\n");
        var options = exports.gi.getOptions(startUrl);
        var testSuiteUrl = "https://app.ghostinspector.com/suites/" + suiteId;
        logTestParameters(options.apiUrl, startUrl, testSuiteUrl);
        qmGit.setGithubStatus("pending", exports.gi.context, options.apiUrl, testSuiteUrl);
        getGhostInspector().executeSuite(suiteId, options, function (err, suiteResults, passing) {
            console.info("RESULTS:");
            if (err) {
                handleTestErrors(err);
            }
            console.log(passing ? "Passed" : "Failed");
            if (!passing) {
                var testResults = void 0;
                for (var _i = 0, suiteResults_1 = suiteResults; _i < suiteResults_1.length; _i++) {
                    testResults = suiteResults_1[_i];
                    if (!testResults.passing) {
                        exports.gi.outputErrorsForTest(testResults);
                    }
                }
            }
            else {
                console.log(testSuiteUrl + " " + " passed! :D");
                qmGit.setGithubStatus("success", exports.gi.context, options.apiUrl, testSuiteUrl, callback);
            }
        });
    },
    getOptions: function (startUrl) {
        return {
            apiUrl: th.getApiUrl(),
            sha: qmGit.getCurrentGitCommitSha(),
            startUrl: startUrl || exports.gi.getStartUrl(),
        };
    },
};
function getGhostInspector() {
    if (!process.env.GI_API_KEY) {
        handleTestErrors("Please set GI_API_KEY env from https://app.ghostinspector.com/account");
    }
    // console.debug(`Using GI_API_KEY starting with ` + process.env.GI_API_KEY.substr(0, 4) + "...")
    return require("ghost-inspector")(process.env.GI_API_KEY);
}
//# sourceMappingURL=gi-functions.js.map