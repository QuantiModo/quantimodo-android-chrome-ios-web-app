"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: no-reference
/// <reference path='../../node_modules/cypress/types/cypress-npm-api.d.ts'/>
var slack_alert_1 = require("cypress-slack-reporter/bin/slack/slack-alert");
// tslint:disable: no-var-requires
var marge = require("mochawesome-report-generator");
var merge = require("mochawesome-merge").merge;
// tslint:disable: no-var-requires
var options = {
    reportDir: "cypress/reports/mocha",
    inline: true,
    saveJson: true,
};
process.env.CI_PROJECT_REPONAME = process.env.CI_PROJECT_REPONAME || "qm-ui-tests";
process.env.CI_PROJECT_USERNAME = process.env.CI_PROJECT_USERNAME || "mikepsinn";
merge(options).then(function (report) {
    return marge.create(report, options);
}).then(function (_generatedReport) {
    console.log("Merged report available here:-", _generatedReport);
    var base = process.env.PWD || ".";
    var program = {
        ciProvider: "circleci",
        videoDir: base + "/cypress/videos",
        vcsProvider: "github",
        screenshotDir: base + "/cypress/screenshots",
        verbose: true,
        reportDir: base + "/mochawesome-report"
    };
    var ciProvider = program.ciProvider;
    var vcsProvider = program.vcsProvider;
    var reportDirectory = program.reportDir;
    var videoDirectory = program.videoDir;
    var screenshotDirectory = program.screenshotDir;
    var verbose = program.verbose;
    // tslint:disable-next-line: no-console
    // console.log("Constructing Slack message with the following options", {
    //     ciProvider,
    //     vcsProvider,
    //     reportDirectory,
    //     videoDirectory,
    //     screenshotDirectory,
    //     verbose
    // });
    // @ts-ignore
    var slack = slack_alert_1.slackRunner(ciProvider, vcsProvider, reportDirectory, videoDirectory, screenshotDirectory, verbose);
    // tslint:disable-next-line: no-console
    // console.log("Finished slack upload")
});
