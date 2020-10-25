// tslint:disable-next-line: no-reference
/// <reference path='../../node_modules/cypress/types/cypress-npm-api.d.ts'/>
import {slackRunner} from "cypress-slack-reporter/bin/slack/slack-alert";
// tslint:disable: no-var-requires
const marge = require("mochawesome-report-generator");
const {merge} = require("mochawesome-merge");
// tslint:disable: no-var-requires
let options = {
    reportDir: "cypress/reports/mocha",
    inline: true,
    saveJson: true,
};
process.env.CI_PROJECT_REPONAME = process.env.CI_PROJECT_REPONAME || "qm-ui-tests";
process.env.CI_PROJECT_USERNAME = process.env.CI_PROJECT_USERNAME || "mikepsinn";
merge(options).then((report: any) => {
    return marge.create(report, options)
}).then((_generatedReport: any) => {
    console.log("Merged report available here:-", _generatedReport);
    const base = process.env.PWD || ".";
    const program: any = {
        ciProvider: "circleci",
        videoDir: `${base}/cypress/videos`,
        vcsProvider: "github",
        screenshotDir: `${base}/cypress/screenshots`,
        verbose: true,
        reportDir: `${base}/cypress/reports/mocha`
    };
    const ciProvider: string = program.ciProvider;
    const vcsProvider: string = program.vcsProvider;
    const reportDirectory: string = program.reportDir;
    const videoDirectory: string = program.videoDir;
    const screenshotDirectory: string = program.screenshotDir;
    const verbose: boolean = program.verbose;
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
    const slack = slackRunner(
        ciProvider,
        vcsProvider,
        reportDirectory,
        videoDirectory,
        screenshotDirectory,
        verbose
    );
    // tslint:disable-next-line: no-console
    // console.log("Finished slack upload")

})

