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
exports.uploadMochawesome = exports.runLastFailedCypressTest = exports.runCypressTests = exports.runCypressTestsInParallel = exports.downloadLastFailed = exports.uploadLastFailed = exports.uploadCypressVideo = exports.getVideoPath = exports.runOneCypressSpec = exports.runWithRecording = exports.mochawesome = void 0;
var app_root_path_1 = __importDefault(require("app-root-path"));
var cypress = __importStar(require("cypress"));
var slack_alert_js_1 = require("cypress-slack-reporter/bin/slack/slack-alert.js");
var fs = __importStar(require("fs"));
// @ts-ignore
var mochawesome_merge_1 = require("mochawesome-merge");
// @ts-ignore
var mochawesome_report_generator_1 = __importDefault(require("mochawesome-report-generator"));
var Q = __importStar(require("q"));
var rimraf_1 = __importDefault(require("rimraf"));
var fileHelper = __importStar(require("./qm.file-helper"));
// require untyped library file
// tslint:disable-next-line:no-var-requires
var qm = require("../src/js/qmHelpers.js");
var qmGit = __importStar(require("./qm.git"));
var qmLog = __importStar(require("./qm.log"));
var test_helpers_1 = require("./test-helpers");
// https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
// loadEnv(".env.local")
var ciProvider = test_helpers_1.getCiProvider();
var isWin = process.platform === "win32";
var outputReportDir = app_root_path_1.default + "/cypress/reports/mocha";
var screenshotDirectory = outputReportDir + "/assets";
var unmerged = app_root_path_1.default + "/cypress/reports/mocha";
var vcsProvider = "github";
var verbose = true;
var videoDirectory = app_root_path_1.default + "/cypress/videos";
var mergedJsonPath = outputReportDir + "/mochawesome.json";
var lastFailedCypressTestPath = "last-failed-cypress-test";
var cypressJson = fileHelper.getAbsolutePath("cypress.json");
var releaseStage = process.env.RELEASE_STAGE || "production";
var envPath = fileHelper.getAbsolutePath("cypress/config/cypress." + releaseStage + ".json");
var s3Bucket = "qmimages";
var paths = {
    reports: {
        junit: "./cypress/reports/junit",
        mocha: "./cypress/reports/mocha",
    },
};
function getReportUrl() {
    var url = process.env.JOB_URL;
    if (url && url.indexOf("DEPLOY-") === 0) {
        return url + "ws/tmp/quantimodo-sdk-javascript/mochawesome-report/mochawesome.html";
    }
    return test_helpers_1.getBuildLink();
}
function mochawesome(failedTests, cb) {
    var abs = fileHelper.getAbsolutePath(unmerged);
    console.log("Merging reports in " + abs);
    mochawesome_merge_1.merge({
        inline: true,
        reportDir: abs,
        saveJson: true,
    }).then(function (mergedJson) {
        fs.writeFileSync(mergedJsonPath, JSON.stringify(mergedJson, null, 2));
        // console.log("Generating report from " + unmerged + " and outputting at " + outputReportDir)
        return mochawesome_report_generator_1.default.create(mergedJson, {
            // cdn: true,
            autoOpen: isWin,
            charts: true,
            inline: true,
            overwrite: true,
            reportDir: outputReportDir,
            saveJson: true,
            showPassed: true,
        });
    }).then(function (generatedReport) {
        console.log("Merged report available here:-", generatedReport[0]);
        // tslint:disable-next-line: no-console
        console.log("Constructing Slack message with the following options", {
            ciProvider: ciProvider,
            outputReportDir: outputReportDir,
            screenshotDirectory: screenshotDirectory,
            vcsProvider: vcsProvider,
            verbose: verbose,
            videoDirectory: videoDirectory,
        });
        try {
            // @ts-ignore
            // noinspection JSUnusedLocalSymbols
            if (!process.env.SLACK_WEBHOOK_URL) {
                console.error("env SLACK_WEBHOOK_URL not set!");
            }
            else {
                // @ts-ignore
                slack_alert_js_1.slackRunner(ciProvider, vcsProvider, outputReportDir, videoDirectory, screenshotDirectory, verbose);
                // tslint:disable-next-line: no-console
                // console.log("Finished slack upload")
            }
        }
        catch (error) {
            console.error(error);
        }
        cb(generatedReport[0]);
    });
}
exports.mochawesome = mochawesome;
function copyCypressEnvConfigIfNecessary() {
    console.info("Copying " + envPath + " to cypress.json");
    try {
        fs.unlinkSync(cypressJson);
    }
    catch (err) {
        console.log(err);
    }
    fs.copyFileSync(envPath, cypressJson);
    var cypressJsonString = fs.readFileSync(cypressJson).toString();
    var cypressJsonObject;
    try {
        cypressJsonObject = JSON.parse(cypressJsonString);
    }
    catch (e) {
        console.error("Could not parse  " + cypressJson + " because " + e.message + "! Here's the string " + cypressJsonString);
        var fixed = cypressJsonString.replace("}\n}", "}");
        console.error("Going to try replacing extra bracket. Here's the fixed version " + fixed);
        fs.writeFileSync(cypressJson, fixed);
        cypressJsonString = fs.readFileSync(cypressJson).toString();
        cypressJsonObject = JSON.parse(cypressJsonString);
    }
    if (!cypressJsonObject) {
        var before_1 = fs.readFileSync(envPath).toString();
        throw Error("Could not parse " + cypressJson + " after copy! " + envPath + " is " + before_1);
    }
    console.info("Cypress Configuration: " + cypressJsonString);
}
function setGithubStatusAndUploadTestResults(failedTests, context, cb) {
    // @ts-ignore
    var failedTestTitle = failedTests[0].title[1];
    // @ts-ignore
    var errorMessage = failedTests[0].error;
    qmGit.setGithubStatus("failure", context, failedTestTitle + ": " +
        errorMessage, getReportUrl(), function () {
        uploadMochawesome().then(function (urls) {
            console.error(errorMessage);
            cb(errorMessage);
            // resolve();
        });
    });
}
function deleteJUnitTestResults() {
    var jUnitFiles = paths.reports.junit + "/*.xml";
    rimraf_1.default(jUnitFiles, function () {
        console.debug("Deleted " + jUnitFiles);
    });
}
function logFailedTests(failedTests, context, cb) {
    // tslint:disable-next-line:prefer-for-of
    for (var j = 0; j < failedTests.length; j++) {
        var test_1 = failedTests[j];
        var testName = test_1.title[1];
        var errorMessage = test_1.error || test_1.message || test_1.displayError;
        if (!errorMessage) {
            errorMessage = JSON.stringify(test_1);
            console.error("no test.error or test.message or test.displayError property in " + errorMessage);
        }
        console.error("==============================================");
        console.error(testName + " FAILED");
        console.error(errorMessage);
        console.error("==============================================");
    }
    test_helpers_1.deleteSuccessFile().then(function () {
        mochawesome(failedTests, function () {
            setGithubStatusAndUploadTestResults(failedTests, context, cb);
        });
    });
}
function runWithRecording(specName, cb) {
    var specsPath = getSpecsPath();
    var specPath = specsPath + "/" + specName;
    var browser = process.env.CYPRESS_BROWSER || "electron";
    var context = specName.replace("_spec.js", "") + "-" + releaseStage;
    console.info("Re-running " + specName + " with recording so you can check it at https://dashboard.cypress.io/");
    cypress.run({
        browser: browser,
        record: true,
        spec: specPath,
    }).then(function (recordingResults) {
        var runUrl = "No runUrl provided so just go to https://dashboard.cypress.io/";
        if ("runUrl" in recordingResults) {
            runUrl = recordingResults.runUrl;
        }
        uploadCypressVideo(specName)
            .then(function (s3Url) {
            var url = s3Url || test_helpers_1.getBuildLink() || runUrl;
            qmGit.setGithubStatus("error", context, "View recording of " + specName, url, function () {
                qmGit.createCommitComment(context, "\nView recording of " + specName + "\n" +
                    "[Cypress Dashboard](" + runUrl + ") or [Build Log](" + test_helpers_1.getBuildLink() + ") or [S3](" + s3Url + ")", function () {
                    cb(recordingResults);
                });
            });
        });
    });
}
exports.runWithRecording = runWithRecording;
function getFailedTestsFromResults(results) {
    if (!results.runs) {
        console.error("No runs on results obj: ", results);
    }
    var tests = results.runs[0].tests;
    var failedTests = [];
    if (tests) {
        failedTests = tests.filter(function (test) {
            return test.state === "failed";
        });
        if (!failedTests) {
            failedTests = [];
        }
    }
    else {
        console.error("No tests on ", results.runs[0]);
    }
    return failedTests;
}
function handleTestSuccess(results, context, cb) {
    deleteLastFailedCypressTest();
    console.info(results.totalPassed + " tests PASSED!");
    qmGit.setGithubStatus("success", context, results.totalPassed + " tests passed", null, function () {
        test_helpers_1.createSuccessFile()
            .then(function () {
            cb(false);
        });
    });
}
function runOneCypressSpec(specName, cb) {
    uploadLastFailed(specName); // Set last failed first so it exists if we have an exception
    var specsPath = getSpecsPath();
    var specPath = specsPath + "/" + specName;
    var browser = process.env.CYPRESS_BROWSER || "electron";
    var context = specName.replace("_spec.js", "") + "-" + releaseStage;
    qmGit.setGithubStatus("pending", context, "Running " + context + " Cypress tests...");
    console.info("Running " + specPath + "...");
    // noinspection JSUnresolvedFunction
    cypress.run({
        browser: browser,
        record: true,
        spec: "cypress/integration/" + specName,
    }).then(function (results) {
        // @ts-ignore
        if (!results.runs || !results.runs[0]) {
            console.log("No runs property on " + JSON.stringify(results, null, 2));
            cb(false);
        }
        else {
            var failedTests = getFailedTestsFromResults(results);
            if (failedTests.length) {
                process.env.LOGROCKET = "1";
                fileHelper.uploadToS3InSubFolderWithCurrentDateTime(getVideoPath(specName), "cypress")
                    .then(function (url) {
                    runWithRecording(specName, function (recordResults) {
                        var failedRecordedTests = getFailedTestsFromResults(recordResults);
                        if (failedRecordedTests.length) {
                            logFailedTests(failedRecordedTests, context, function (errorMessage) {
                                cb(errorMessage);
                                process.exit(1);
                            });
                        }
                        else {
                            delete process.env.LOGROCKET;
                            handleTestSuccess(results, context, cb);
                        }
                    });
                });
            }
            else {
                handleTestSuccess(results, context, cb);
            }
        }
    }).catch(function (runtimeError) {
        qmGit.setGithubStatus("error", context, runtimeError, getReportUrl(), function () {
            console.error(runtimeError);
            process.exit(1);
        });
    });
}
exports.runOneCypressSpec = runOneCypressSpec;
function getVideoPath(specName) {
    return "cypress/videos/" + specName + ".mp4";
}
exports.getVideoPath = getVideoPath;
function uploadCypressVideo(specName) {
    return fileHelper.uploadToS3InSubFolderWithCurrentDateTime(getVideoPath(specName), "cypress");
}
exports.uploadCypressVideo = uploadCypressVideo;
function uploadLastFailed(specName, cb) {
    fs.writeFileSync(lastFailedCypressTestPath, specName);
    return fileHelper.uploadToS3(lastFailedCypressTestPath, "cypress/" + lastFailedCypressTestPath, "qmimages");
}
exports.uploadLastFailed = uploadLastFailed;
function downloadLastFailed() {
    return fileHelper.downloadFromS3(lastFailedCypressTestPath, "cypress" + "/" + lastFailedCypressTestPath, s3Bucket);
}
exports.downloadLastFailed = downloadLastFailed;
function getSpecsPath() {
    return app_root_path_1.default + "/cypress/integration";
}
function runCypressTestsInParallel(cb) {
    test_helpers_1.deleteSuccessFile();
    try {
        copyCypressEnvConfigIfNecessary();
    }
    catch (e) {
        console.error(e.message + "!  Going to try again...");
        copyCypressEnvConfigIfNecessary();
    }
    deleteJUnitTestResults();
    rimraf_1.default(paths.reports.mocha + "/*.json", function () {
        var specsPath = getSpecsPath();
        fs.readdir(specsPath, function (err, specFileNames) {
            if (!specFileNames) {
                throw new Error("No specFileNames in " + specsPath);
            }
            var promises = [];
            var _loop_1 = function (specName) {
                if (releaseStage === "ionic" && specName.indexOf("ionic_") === -1) {
                    console.debug("skipping " + specName + " because it doesn't test ionic app and release stage is " +
                        releaseStage);
                    return "continue";
                }
                promises.push(new Promise(function (resolve) {
                    runOneCypressSpec(specName, function () {
                        resolve();
                    });
                }));
            };
            for (var _i = 0, specFileNames_1 = specFileNames; _i < specFileNames_1.length; _i++) {
                var specName = specFileNames_1[_i];
                _loop_1(specName);
            }
            Promise.all(promises).then(function (values) {
                console.log(values);
                test_helpers_1.createSuccessFile()
                    .then(function () {
                    test_helpers_1.deleteEnvFile();
                    if (cb) {
                        cb(false);
                    }
                });
            });
        });
    });
}
exports.runCypressTestsInParallel = runCypressTestsInParallel;
function runCypressTests(cb) {
    test_helpers_1.deleteSuccessFile();
    try {
        copyCypressEnvConfigIfNecessary();
    }
    catch (e) {
        console.error(e.message + "!  Going to try again...");
        copyCypressEnvConfigIfNecessary();
    }
    deleteJUnitTestResults();
    rimraf_1.default(paths.reports.mocha + "/*.json", function () {
        var specsPath = getSpecsPath();
        fs.readdir(specsPath, function (err, specFileNames) {
            if (!specFileNames) {
                throw new Error("No specFileNames in " + specsPath);
            }
            var _loop_2 = function (i, p) {
                var specName = specFileNames[i];
                if (releaseStage === "ionic" && specName.indexOf("ionic_") === -1) {
                    console.debug("skipping " + specName + " because it doesn't test ionic app and release stage is " +
                        releaseStage);
                    return out_p_1 = p, "continue";
                }
                p = p.then(function (_) { return new Promise(function (resolve) {
                    runOneCypressSpec(specName, function () {
                        if (i === specFileNames.length - 1) {
                            test_helpers_1.createSuccessFile()
                                .then(function () {
                                test_helpers_1.deleteEnvFile();
                                if (cb) {
                                    cb(false);
                                }
                            });
                        }
                        resolve();
                    });
                }); });
                out_p_1 = p;
            };
            var out_p_1;
            for (var i = 0, p = Promise.resolve(); i < specFileNames.length; i++) {
                _loop_2(i, p);
                p = out_p_1;
            }
        });
    });
}
exports.runCypressTests = runCypressTests;
function getLastFailedCypressTest() {
    var deferred = Q.defer();
    try {
        downloadLastFailed()
            .then(function (absPath) {
            if (!absPath) {
                deferred.resolve(null);
                return;
            }
            try {
                // @ts-ignore
                var spec = fs.readFileSync(absPath, "utf8");
                deferred.resolve(spec);
            }
            catch (error) {
                deferred.resolve(null);
            }
        });
    }
    catch (error) {
        qmLog.error(error);
        deferred.resolve(null);
    }
    return deferred.promise;
}
function deleteLastFailedCypressTest() {
    // tslint:disable-next-line:no-empty
    try {
        fs.unlinkSync(lastFailedCypressTestPath);
    }
    catch (err) {
        console.debug("No last-failed-cypress-test file to delete");
    }
}
// tslint:disable-next-line:unified-signatures
function runLastFailedCypressTest(cb) {
    getLastFailedCypressTest()
        .then(function (name) {
        if (!name) {
            console.info("No previously failed test!");
            cb(false);
            return;
        }
        test_helpers_1.deleteSuccessFile();
        try {
            copyCypressEnvConfigIfNecessary();
        }
        catch (e) {
            console.error(e.message + "!  Going to try again...");
            copyCypressEnvConfigIfNecessary();
        }
        // @ts-ignore
        runOneCypressSpec(name, cb);
    });
}
exports.runLastFailedCypressTest = runLastFailedCypressTest;
function uploadMochawesome() {
    var s3Key = "mochawesome/" + qmGit.getCurrentGitCommitSha();
    return fileHelper.uploadFolderToS3(outputReportDir, s3Key, s3Bucket, "public-read");
}
exports.uploadMochawesome = uploadMochawesome;
//# sourceMappingURL=cypress-functions.js.map