"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var chai_1 = require("chai")
var chai_2 = require("chai")
var qmGit = require("../ts/qm.git")
var qmShell = require("../ts/qm.shell")
var fileHelper = require("../ts/qm.file-helper")
var qmTests = require("../ts/cypress-functions")
var urlParser = require("url")
var https = require("https")
var _str = require("underscore.string")
var simpleGit = require("simple-git/promise")
var th = require("../ts/test-helpers")
var git = simpleGit()
beforeEach(function (done) {
    var t = this.currentTest
    this.timeout(10000) // Default 2000 is too fast for Github API
    // @ts-ignore
    qmGit.setGithubStatus("pending", t.title, "Running...", null, function (res) {
        var logResult = false
        if (logResult) {
            console.debug(res)
        }
        done()
    })
})
afterEach(function (done) {
    var t = this.currentTest
    // @ts-ignore
    var state = t.state
    if (!state) {
        console.debug("No test state in afterEach!")
        done()
        return
    }
    var githubState = "success"
    if (state === "failed") {
        githubState = "failure"
    }
    // @ts-ignore
    qmGit.setGithubStatus(githubState, t.title, t.title, null, function (res) {
        var logResult = false
        if (logResult) {
            console.debug(res)
        }
        done()
    })
})
describe("git", function () {
    it.skip("sets commit status", function (done) {
        qmGit.setGithubStatus("pending", "test context", "test description", "https://get-bent.com", function (res) {
            chai_1.expect(res.status).to.eq(201)
            done()
        })
    })
    it.skip("creates a feature branch and deletes it", function (done) {
        var featureName = "test-feature"
        var branchName = "feature/" + featureName
        qmGit.createFeatureBranch("test-feature")
        git.branchLocal().then(function (branchSummary) {
            chai_1.expect(branchSummary.all).to.contain(branchName)
            qmShell.executeSynchronously("git checkout -B develop", true)
            git.deleteLocalBranch(branchName).then(function () {
                git.branchLocal().then(function (branchSummary) {
                    chai_1.expect(branchSummary.all).not.to.contain(branchName)
                    done()
                })
            })
        })
    })
})
function downloadFileContains(url, expectedToContain, cb) {
    downloadFile(url, function (str) {
        chai_1.expect(str).to.contain(expectedToContain)
        cb()
    })
}
function downloadFile(url, cb) {
    var parsedUrl = urlParser.parse(url)
    var options = {
        hostname: parsedUrl.hostname,
        method: "GET",
        path: parsedUrl.path,
        port: 443,
    }
    var req = https.request(options, function (res) {
        console.log("statusCode: " + res.statusCode)
        chai_1.expect(res.statusCode).to.eq(200)
        var str = ""
        res.on("data", function (chunk) {
            str += chunk
        })
        res.on("end", function () {
            console.log("RESPONSE: " + _str.truncate(str, 30))
            cb(str)
        })
    })
    req.on("error", function (error) {
        console.error(error)
    })
    req.end()
}
describe("uploader", function () {
    it("uploads a file", function (done) {
        fileHelper.uploadToS3("ionIcons.js", "tests", function (uploadResponse) {
            downloadFileContains(uploadResponse.Location, "iosArrowUp", done)
        })
    })
    it.skip("uploads test results", function (done) {
        this.timeout(10000) // Default 2000 is too fast
        qmTests.uploadTestResults(function (uploadResponse) {
            downloadFileContains(uploadResponse.Location, "mocha", done)
        })
    })
})
describe("gi-tester", function () {
    it("runs tests on staging API", function (done) {
        var previouslySetApiUrl = process.env.API_URL || null
        delete process.env.API_URL
        chai_2.assert.isUndefined(process.env.API_URL)
        process.env.RELEASE_STAGE = "staging"
        var url = th.getApiUrl()
        chai_1.expect(url).to.contain("https://staging.quantimo.do")
        if (previouslySetApiUrl) {
            process.env.API_URL = previouslySetApiUrl
        }
        done()
    })
})
