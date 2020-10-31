"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var path = require('path')
var appDir = path.resolve(".")
var chai = require("chai")
var expect = chai.expect
var qmGit = require("../../ts/qm.git")
var qmShell = require("../../ts/qm.shell")
var fileHelper = global.fileHelper = require("../../ts/qm.file-helper")
var cypressFunctions = require("../../ts/cypress-functions")
var urlParser = require("url")
var https = require("https")
global.fetch = require("../../node_modules/node-fetch/lib/index.js")
global.Headers = fetch.Headers
var _str = require("underscore.string")
var simpleGit = require("simple-git/promise")
var th = require("../../ts/test-helpers")
var git = simpleGit()
global.bugsnagClient = require('./../../node_modules/bugsnag')
//global.Swal = require('./../../src/lib/swee')
var argv = require('./../../node_modules/yargs').argv
global.qm = require('./../../src/js/qmHelpers')
qm.appMode.mode = 'mocha'
global.qmLog = require('./../../src/js/qmLogger')
qmLog.color = require('./../../node_modules/ansi-colors')
qm.github = require('./../../node_modules/gulp-github')
qm.Quantimodo = require('./../../node_modules/quantimodo')
require('./../../src/data/qmStaticData')
qm.stateNames = qm.staticData.stateNames
qm.qmLog = qmLog
qmLog.qm = qm
qm.qmLog.setLogLevelName(process.env.LOG_LEVEL || 'info')
global.nlp = require('./../../src/lib/compromise')
var Q = global.Q = require('./../../src/lib/q')
global.Swal = require('./../../node_modules/sweetalert2/dist/sweetalert2.all')
//global.moment = require('./../../src/lib/moment/moment')
global.moment = require('./../../src/lib/moment-timezone/moment-timezone')
const chrome = require('sinon-chrome/extensions')
var qmTests = {
    getTestAccessToken(){
        var t = process.env.TEST_ACCESS_TOKEN
        if(!t){
            t = "test-token"
        }
        return t
    },
    setTestAccessToken(){
        qm.storage.setItem(qm.items.accessToken, qmTests.getTestAccessToken())
    },
    testParams: {},
    setTestParams(params){
        qmTests.testParams = params
        qmLog.debug("Setting test params: " + JSON.stringify(params))
    },
    getTestParams(){
        if(typeof qmTests.testParams === 'string'){
            return JSON.parse(qmTests.testParams)
        }
        return qmTests.testParams
    },
    startUrl: null,
    getStartUrl(){
        var params = qmTests.getTestParams()
        var startUrl = 'https://medimodo.herokuapp.com'
        if(params && params.startUrl){ startUrl = params.startUrl }
        if(params && params.deploy_ssl_url){ startUrl = params.deploy_ssl_url }
        if(params && params.START_URL){ startUrl = params.START_URL }
        if(process.env.START_URL){ startUrl = process.env.START_URL }
        if(process.env.DEPLOY_PRIME_URL){ startUrl = process.env.DEPLOY_PRIME_URL }
        if(argv.startUrl){ startUrl = argv.startUrl }
        if(startUrl.indexOf('https') === -1){ startUrl = "https://" + startUrl }
        return startUrl
    },
    getSha(){
        var params = qmTests.getTestParams()
        if(params && params.commit_ref){ return params.commit_ref }
        if(params && params.sha){ return params.sha }
    },
    getStatusesUrl(){
        var params = qmTests.getTestParams()
        if(params && params.statuses_url){ return params.statuses_url }
        /** @namespace params.commit_url */
        if(params && params.commit_url){
            var url = params.commit_url
            url = url.replace('github.com', 'api.github.com/repos')
            url = url.replace('commit', 'statuses')
            return url
        }
        return null
    },
    getApiUrl(){
        var params = qmTests.getTestParams()
        if(params && params.API_URL){ return params.API_URL }
        if(process.env.API_URL){ return process.env.API_URL }
        if(argv.apiUrl){ return argv.apiUrl }
        return 'api.quantimo.do'
    },
    tests: {
        checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, callback){
            var intents = qm.staticData.dialogAgent.intents
            var entities = qm.staticData.dialogAgent.entities
            info("Got " + entities.length + " entities")
            var matchedEntities = qm.dialogFlow.getEntitiesFromUserInput(userInput)
            for (var expectedEntityName in expectedEntities) {
                if (!expectedEntities.hasOwnProperty(expectedEntityName)) { continue }
                qm.assert.doesNotEqual(typeof matchedEntities[expectedEntityName], "undefined",
                    expectedEntityName + " not in matchedEntities!")
                qm.assert.equals(matchedEntities[expectedEntityName].matchedEntryValue, expectedEntities[expectedEntityName])
            }
            var expectedIntent = intents[expectedIntentName]
            var triggerPhraseMatchedIntent = qm.dialogFlow.getIntentMatchingCommandOrTriggerPhrase(userInput)
            qm.assert.equals(triggerPhraseMatchedIntent.name, expectedIntentName)
            var score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput)
            var filledParameters = expectedIntent.parameters
            var expectedParameterName
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) { continue }
                if(typeof filledParameters[expectedParameterName] === "undefined"){
                    score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput)
                }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!")
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName])
            }
            qm.assert.greaterThan(-2, score)
            var matchedIntent = qm.dialogFlow.getIntent(userInput)
            filledParameters = matchedIntent.parameters
            qm.assert.equals(matchedIntent.name, expectedIntentName)
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) { continue }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!")
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName])
            }
            if(callback){ callback() }
        },
        getOptions(startUrl){
            var options = {}
            options.startUrl = startUrl || qmTests.getStartUrl()
            options.apiUrl = qmTests.getApiUrl()
            if(qmTests.getSha()){ options.sha = qmTests.getSha() }
            if(qmTests.getStatusesUrl()){ options.statuses_url = qmTests.getStatusesUrl() }
            return options
        },
    },
    logBugsnagLink(suite, start, end){
        var query = "filters[event.since][0]=" +
            start + "&filters[error.status][0]=open&filters[event.before][0]=" +
            end + "&sort=last_seen"
        console.error(suite.toUpperCase() + " errors: https://app.bugsnag.com/quantimodo/" + suite + "/errors?" + query)
    },
    outputErrorsForTest(testResults){
        var name = testResults.testName || testResults.name
        console.error(name + " FAILED: https://app.ghostinspector.com/results/" + testResults._id)
        qmTests.logBugsnagLink('ionic', testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        qmTests.logBugsnagLink('slim-api', testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        console.error("=== CONSOLE ERRORS ====")
        for (var i = 0; i < testResults.console.length; i++) {
            var logObject = testResults.console[i]
            if(logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1){
                console.error(logObject.output + " at " + logObject.url)
            }
        }
        process.exit(1)
    },
    runAllTestsForType (testType, callback) {
        console.info("=== " + testType + " Tests ===")
        var tests = qm.tests[testType]
        for (var testName in tests) {
            if (!tests.hasOwnProperty(testName)) continue
            console.info(testName + "...")
            tests[testName]()
            console.info(testName + " passed! :D")
        }
        if(callback){ callback() }
    },
}
beforeEach(function (done) {
    var t = this.currentTest
    this.timeout(10000) // Default 2000 is too fast for Github API
    // @ts-ignore
    qmGit.setGithubStatus("pending", t.title, "Running...", null, function (res) {
        qmLog.debug(res)
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
        qmLog.debug(res)
        done()
    })
})
function downloadFileContains(url, expectedToContain) {
    const deferred = Q.defer()
    downloadFile(url)
        .then(function (str) {
            expect(str).to.contain(expectedToContain)
            deferred.resolve(str)
        })
    return deferred.promise
}
function downloadFile(url) {
    const deferred = Q.defer()
    var parsedUrl = urlParser.parse(url)
    var options = {
        hostname: parsedUrl.hostname,
        method: "GET",
        path: parsedUrl.path,
        port: 443,
    }
    var req = https.request(options, function (res) {
        console.log("statusCode: " + res.statusCode)
        expect(res.statusCode).to.eq(200)
        var str = ""
        res.on("data", function (chunk) {
            str += chunk
        })
        res.on("end", function () {
            console.log("RESPONSE: " + _str.truncate(str, 30))
            deferred.resolve(str)
        })
    })
    req.on("error", function (error) {
        console.error(error)
        deferred.reject(error)
    })
    req.end()
    return deferred.promise
}
function expectInteger(val){
    expect(val).to.be.a('number')
    expect(val % 1).to.equal(0)
}
function info(str, meta){
    qmLog.info("mocha: " + str, meta)
}
describe("Measurement", function () {
    function checkPostMeasurementResponse(data, variableName, value) {
        var measurements = qm.measurements.toArray(data.measurements)
        var id
        measurements.forEach(function (m) {
            id = m.id
            expectInteger(id)
            expect(m.variableName).eq(variableName)
            expect(m.value).eq(value)
        })
        expect(measurements).length(1)
        expect(data.userVariables).length(1)
        var queue = qm.measurements.getMeasurementsFromQueue()
        expect(queue).length(0)
        return id
    }
    it('can record, edit, and delete a rating measurement', function () {
        this.timeout(60000)
        let d = new Date()
        let seconds = d.getSeconds()
        let initialValue = (seconds % 5) + 1
        let editedValue = ((initialValue % 5) + 1)
        qmTests.setTestAccessToken()
        var variableName = "Alertness"
        let measurementId
        return qm.userHelper.getUserFromApi()
            .then(function (user) {
                info("Getting user variables...")
                expect(user.accessToken).to.eq(qmTests.getTestAccessToken())
                return qm.userVariables.getFromApi()
            })
            .then(function (userVariables) {
                expect(userVariables).to.be.a('array')
                info("getMeasurements...")
                return qm.measurements.getMeasurements({variableName, sort: "-startAt"})
            })
            .then(function (measurements) {
                info("Deleting last " + variableName + " measurement...")
                qm.measurements.logMeasurements(measurements, variableName + " Measurements")
                info("deleteLastMeasurementForVariable...")
                return qm.measurements.deleteLastMeasurementForVariable(variableName)
            })
            .then(function () {
                info("Recording " + initialValue + " /5 " + variableName + " measurement...")
                var body = {
                    value: initialValue,
                    variableName,
                    unitAbbreviatedName: "/5",
                }
                info("qm.measurements.recordMeasurement: ", body)
                return qm.measurements.recordMeasurement(body)
            })
            .then(function (data) {
                info("Checking post measurement response...")
                measurementId = checkPostMeasurementResponse(data, variableName, initialValue)
                info("userVariables.getFromLocalStorage...")
                return qm.userVariables.getFromLocalStorage({variableName})
            })
            .then(function (userVariables) {
                info("Checking qm.userVariables.getFromLocalStorage({variableName}) after post measurement response...")
                expect(userVariables).length(1)
                info("getting charts...")
                return qm.userVariables.findWithCharts(variableName)
            })
            .then(function (uv) {
                expect(uv.charts).to.not.be.null
                info("measurements.getLocalMeasurements...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                info("Checking qm.measurements.getLocalMeasurements({variableName}) measurements...")
                var m = measurements[0]
                expect(m.value).eq(initialValue)
                expectInteger(m.id)
                measurements.forEach(function(m){
                    expectInteger(m.id)
                    expect(m.variableName).eq(variableName)
                })
                info("userVariables.getFromLocalStorage...")
                return qm.userVariables.getFromLocalStorage({variableName})
            })
            .then(function (userVariables) {
                expect(userVariables).length(1)
                info("Checking qm.userVariables.getFromLocalStorage({})...")
                var uv = userVariables[0]
                expect(uv.variableName).to.eq(variableName) // Should be first since it has most recent measurement
                info("measurements.getLocalMeasurements 2...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                info("Checking qm.measurements.getLocalMeasurements({variableName})...")
                expect(measurements).length.to.be.greaterThan(0)
                measurements.forEach(function (measurement) {
                    expect(measurement.pngPath).to.be.a('string')
                        .and.satisfy((msg) => msg.startsWith("img/rating/face_rating_button_256_"))
                })
                info("Finding local measurement by id...")
                return qm.measurements.find(measurementId)
            })
            .then(function (measurement) {
                expect(measurement.id).to.eq(measurementId)
                qm.measurements.cache = {}
                info("Finding remote measurement by id...")
                return qm.measurements.find(measurementId)
            })
            .then(function (measurement) {
                expect(measurement.id).to.eq(measurementId)
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                info("Editing measurement...")
                var m = measurements[0]
                expect(m.id).to.eq(measurementId)
                m.value = editedValue
                return qm.measurements.recordMeasurement(m)
            })
            .then(function (data) {
                var editedId = checkPostMeasurementResponse(data, variableName, editedValue)
                expect(editedId).to.eq(measurementId)
                info("qm.measurements.getLocalMeasurements({variableName})...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                expect(measurements[0].value).to.eq(editedValue)
                info("measurements.deleteMeasurement...")
                return qm.measurements.deleteMeasurement(measurements[0])
            })
            .then(function () {
                info("measurements.getLocalMeasurements 4...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                measurements.forEach(function(m){
                    expect(m.id).to.not.eq(measurementId)
                })
            })
        // .catch(function (error) {
        //     throw Error(error)
        // })
    })
})
describe("API", function (){
    it("Makes sure api url is app.quantimo.do", function (done) {
        expect(qm.api.getApiUrl()).to.eq("https://app.quantimo.do")
        done()
    })
})
describe("Chrome Extension", function () {
    before(function () {
        global.chrome = chrome
    })
    it('can create a popup window', function(done) {
        info("TODO: Figure out how to mock chrome.extension.onMessage")
        done()
        //qm.chrome.initialize()
        //qmTests.runAllTestsForType('chrome', done)
    })
})
describe("Cypress", function () {
    it('can upload Cypress video', function(done) {
        const specName = "test_spec"
        const relative = cypressFunctions.getVideoPath(specName)
        const downloadPath = 'tmp/download.mp4'
        let s3Url
        fileHelper.deleteFile(relative).then(function (){
            let exists = fileHelper.exists(relative)
            expect(exists).to.be.false
            return fileHelper.createFile(relative, "test video")
        }).then(function (){
            return cypressFunctions.uploadCypressVideo(specName)
        }).then(function (url){
            s3Url = url
            return fileHelper.deleteFile(downloadPath)
        }).then(function (){
            fileHelper.assertDoesNotExist(downloadPath)
            return fileHelper.download(s3Url, downloadPath)
        }).then(function (){
            fileHelper.assertExists(downloadPath)
            done()
        })
    })
})
describe("File Helper", function () {
    it("creates success file", function (done) {
        const filename = "success-file"
        fileHelper.deleteFile(filename)
            .then(function (){
                let exists = fileHelper.exists(filename)
                expect(exists).to.be.false
                th.createSuccessFile()
                    .then(function (){
                        exists = fileHelper.exists(filename)
                        expect(exists).to.be.true
                        done()
                    })
            })
    })
    it("determines the absolute path", function (done) {
        var abs = fileHelper.getAbsolutePath("tests/ionIcons.js")
        expect(abs).contains(appDir)
        done()
    })
    it("uploads a file", function () {
        return fileHelper.uploadToS3("tests/ionIcons.js", "tests/ionIcons.js")
            .then(function (url) {
                return downloadFileContains(url, "iosArrowUp")
            })
    })
    it.skip("uploads test results", function (done) {
        this.timeout(60000) // Default 2000 is too fast
        cypressFunctions.uploadMochawesome()
            .then(function(urls) {
                expect(urls.find(function(url){
                    return url.indexOf("/assets/app.css") !== -1
                })).is.not.null
                expect(urls.find(function(url){
                    return url.indexOf("/assets/app.js") !== -1
                })).is.not.null
                expect(urls).length.to.be.greaterThan(2)
                done()
            })
    })
})
function deleteLastMeasurement(variableName) {
    return function () {
        return qm.measurements.getMeasurements({variableName}).then(function (measurements) {
            qm.measurements.logMeasurements(measurements, variableName + " Measurements Before Deleting")
        }).then(function () {
            return qm.measurements.deleteLastMeasurementForVariable(variableName)
        }).then(function () {
            return qm.measurements.getMeasurements({variableName}).then(function (measurements) {
                qm.measurements.logMeasurements(measurements, variableName + " Measurements After Deleting")
            })
        })
    }
}
describe("Favorites", function () {
    function createFavorite(variableName) {
        return function (reminders) {
            expect(reminders).length(0)
            expect(qm.reminderHelper.getQueue()).length(0)
            return createReminder({variableName, reminderFrequency: 0, defaultValue: 100},
                1, 0, 1)
        }
    }
    function trackByFavorite(variableName) {
        return function (favorites) {
            expect(favorites).length(1)
            expect(qm.reminderHelper.getQueue()).length(0)
            const notifications = qm.notifications.getCached()
            expect(notifications).length(0)
            var f = favorites[0]
            qm.reminderHelper.trackByFavorite(f, 100)
            expect(f.value).to.eq(100)
            expect(f.displayTotal).to.eq("Recorded " + f.value + " " + f.unitAbbreviatedName)
            var timeout = f.timeout
            timeout._onTimeout()
            clearTimeout(timeout)
            return qm.measurements.getLocalMeasurements({variableName})
        }
    }
    it("record measurement by favorite", function () {
        this.timeout(90000)
        const variableName = "Aaa Test Treatment"
        const variableCategoryName = "Treatments"
        qmTests.setTestAccessToken()
        return qm.userHelper.getUserFromApi({})
            .then(function (user){
                expect(user.accessToken, qmTests.getTestAccessToken())
                return qm.reminderHelper.deleteByVariableName(variableName)
            })
            .then(function () {
                return qm.reminderHelper.getReminders({variableName})
            })
            .then(createFavorite(variableName))
            .then(function (){
                var cached = qm.reminderHelper.getCached()
                expect(cached[0].reminderFrequency).to.eq(0)
            })
            .then(deleteLastMeasurement(variableName))
            .then(function() {
                return qm.reminderHelper.getFavorites(variableCategoryName)
            })
            .then(trackByFavorite(variableName))
            .then(function (measurements) {
                expect(measurements).length(1)
                var m = measurements[0]
                expect(m.value).to.eq(100)
            })
    })
})
describe("Ghost Inspector", function () {
    it("runs tests on staging API", function (done) {
        var previouslySetApiUrl = process.env.API_URL || null
        if(previouslySetApiUrl){
            expect(previouslySetApiUrl).to.eq(qmTests.getApiUrl())
        }
        delete process.env.API_URL
        chai.assert.isUndefined(process.env.API_URL)
        process.env.RELEASE_STAGE = "staging"
        var url = th.getApiUrl()
        expect(url).to.contain("https://staging.quantimo.do")
        if (previouslySetApiUrl) {
            process.env.API_URL = previouslySetApiUrl
        }
        done()
    })
})
describe("Git Helper", function () {
    it.skip("sets commit status", function (done) {
        qmGit.setGithubStatus("pending", "test context", "test description",
            "https://get-bent.com", function (res) {
            expect(res.status).to.eq(201)
            done()
        })
    })
    it.skip("creates a feature branch and deletes it", function (done) {
        var featureName = "test-feature"
        var branchName = "feature/" + featureName
        qmGit.createFeatureBranch("test-feature")
        git.branchLocal().then(function (branchSummary) {
            expect(branchSummary.all).to.contain(branchName)
            qmShell.executeSynchronously("git checkout -B develop", true)
            git.deleteLocalBranch(branchName).then(function () {
                git.branchLocal().then(function (branchSummary) {
                    expect(branchSummary.all).not.to.contain(branchName)
                    done()
                })
            })
        })
    })
})
describe("Intent Handler", function () {
    it('can record measurement from user speech command', function(done) {
        var userInput = "Record 1 Overall Mood"
        var expectedIntentName = 'Record Measurement Intent'
        var expectedEntities = {variableName: 'Overall Mood', recordMeasurementTriggerPhrase: "record"}
        var expectedParameters = {variableName: 'Overall Mood', value: 1}
        qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, done)
    })
    it.skip('can remember stuff', function(done) {
        var userInput = "Remember where my keys are"
        var expectedIntentName = 'Remember Intent'
        var expectedEntities = {interrogativeWord: 'where', rememberCommand: "remember"}
        var expectedParameters = {memoryQuestion: 'where my keys are'}
        qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, done)
    })
})
describe("Notifications", function () {
    it('can parse pushed tracking reminder notification', function(done) {
        // noinspection HtmlRequiredAltAttribute,RequiredAttributes,HtmlUnknownAttribute
        var pushData = {
            actions: '[{"longTitle":"Rate 3\\/5","callback":"trackThreeRatingAction","modifiedValue":3,"action":"track","foreground":false,"shortTitle":"3\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_ok.png","accessibilityText":"3\\/5","functionName":"track","html":"<md-tooltip>Rate 3\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_ok.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":3,"modifiedValue":3,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 3 out of 5","text":"3\\/5","title":"3\\/5","tooltip":"Rate 3\\/5"},{"longTitle":"Rate 2\\/5","callback":"trackTwoRatingAction","modifiedValue":2,"action":"track","foreground":false,"shortTitle":"2\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_sad.png","accessibilityText":"2\\/5","functionName":"track","html":"<md-tooltip>Rate 2\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_sad.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":2,"modifiedValue":2,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 2 out of 5","text":"2\\/5","title":"2\\/5","tooltip":"Rate 2\\/5"},{"longTitle":"Rate 4\\/5","callback":"trackFourRatingAction","modifiedValue":4,"action":"track","foreground":false,"shortTitle":"4\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_happy.png","accessibilityText":"4\\/5","functionName":"track","html":"<md-tooltip>Rate 4\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_happy.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":4,"modifiedValue":4,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 4 out of 5","text":"4\\/5","title":"4\\/5","tooltip":"Rate 4\\/5"}]',
            color: "#2196F3",
            "content-available": "1",
            "force-start": "1",
            foreground: "false",
            icon: "https://web.quantimo.do/img/variable_categories/emotions.png",
            image: "",
            isBackground: "true",
            lastValue: "3",
            message: "Pull down and select a value to record or tap to open inbox for more options",
            notId: "1398",
            secondToLastValue: "2",
            soundName: "false",
            thirdToLastValue: "4",
            title: "Track Overall Mood",
            trackingReminderNotificationId: "40611535",
            unitAbbreviatedName: "/5",
            url: "https://web.quantimo.do/#/app/reminders-inbox",
            valence: "positive",
            variableCategoryId: "1",
            variableDisplayName: "Overall Mood",
            variableName: "Overall Mood",
        }
        var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, qm.getAppSettings())
        qm.assert.equals(3, notificationOptions.actions.length)
        qm.assert.equals("Overall Mood", notificationOptions.title)
        done()
    })
    it('can parse correlation push notification', function(done) {
        var pushData = {
            color: "#2196F3",
            "content-available": "1",
            "force-start": "0",
            forceStart: "0",
            foreground: "false",
            image: "https://web.quantimo.do/img/variable_categories/symptoms.png",
            isBackground: "true",
            message: "Your EffectVariableName is generally 40% higher after $1.1 over the previous 30 days. ",
            notId: "100624100625",
            soundName: "false",
            title: "↑Higher Purchases Of CauseVariableName Predicts Significantly ↑Higher EffectVariableName",
            url: "https://web.quantimo.do/#/app/study?causeVariableId=100624&effectVariableId=100625&userId=1&clientId=quantimodo",
            user: "1",
        }
        var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, qm.getAppSettings())
        qm.assert.equals(notificationOptions.title, pushData.title)
        qm.assert.equals(notificationOptions.body, pushData.message)
        done()
    })
})
describe("Menu", function () {
    it("can move menu item down", function (done) {
        var original = JSON.parse(JSON.stringify(qm.menu.getMenu()))
        var reordered = qm.menu.moveMenuItemDown(JSON.parse(JSON.stringify(original)), 0)
        qm.assert.doesNotEqual(original[0].id, reordered[0].id)
        qm.assert.doesNotEqual(original[1].id, reordered[1].id)
        qm.assert.equals(original[0].id, reordered[1].id)
        done()
    })
    it("can move first menu item up", function (done) {
        var original = JSON.parse(JSON.stringify(qm.menu.getMenu()))
        var reordered = qm.menu.moveMenuItemUp(JSON.parse(JSON.stringify(original)), 0)
        qm.assert.equals(original[0].id, reordered[0].id)
        done()
    })
    it("can move menu item up", function (done) {
        var original = JSON.parse(JSON.stringify(qm.menu.getMenu()))
        var reordered = qm.menu.moveMenuItemUp(JSON.parse(JSON.stringify(original)), 1)
        qm.assert.equals(original[1].id, reordered[0].id)
        qm.assert.doesNotEqual(original[0].id, reordered[0].id)
        qm.assert.doesNotEqual(original[1].id, reordered[1].id)
        done()
    })
    it("can change variable category", function (done) {
        var before = {
            "stateName": "app.historyAllCategory",
            "href": "#/app/history-all-category/Physical+Activity",
            "url": "/history-all-category/:variableCategoryName",
            "icon": "ion-ios-body-outline",
            "subMenu": null,
            "params": {
                "showAds": true,
                "variableCategoryName": null,
                "refresh": null,
                "title": "History",
                "ionIcon": "ion-ios-list-outline",
            },
            "title": "Activity History",
            "id": "history-all-category-physical-activity",
            "showSubMenu": true,
            "$$hashKey": "object:3482",
            "cache": true,
            "views": {
                "menuContent": {
                    "templateUrl": "templates/history-all.html",
                    "controller": "historyAllMeasurementsCtrl",
                },
            },
            "name": "app.historyAllCategory",
        }
        before.params.variableCategoryName = "Nutrients"
        var updated = qm.menu.onParameterChange(JSON.parse(JSON.stringify(before)))
        qm.assert.contains("Nutrients", updated.href)
        qm.assert.equals("history-all-category-nutrients", updated.id)
        qm.assert.equals("Nutrients History", updated.title)
        qm.assert.doesNotContain(":variableCategory", updated.href)
        done()
    })
    it("can change state", function (done) {
        var before = {
            "stateName": "app.historyAllCategory",
            "href": "#/app/history-all-category/Physical+Activity",
            "url": "/history-all-category/:variableCategoryName",
            "icon": "ion-ios-body-outline",
            "subMenu": null,
            "params": {
                "showAds": true,
                "variableCategoryName": null,
                "refresh": null,
                "title": "History",
                "ionIcon": "ion-ios-list-outline",
            },
            "title": "Activity History",
            "id": "history-all-category-physical-activity",
            "showSubMenu": true,
            "$$hashKey": "object:3482",
            "cache": true,
            "views": {
                "menuContent": {
                    "templateUrl": "templates/history-all.html",
                    "controller": "historyAllMeasurementsCtrl",
                },
            },
            "name": "app.historyAllCategory",
        }
        before.stateName = qm.staticData.stateNames.charts
        var updated = qm.menu.onStateChange(JSON.parse(JSON.stringify(before)))
        qm.assert.contains("charts", updated.href)
        qm.assert.contains("charts", updated.id)
        qm.assert.equals("Charts", updated.title)
        qm.assert.doesNotContain(":variableCategory", updated.href)
        updated.params.variableName = "Overall Mood"
        updated = qm.menu.onStateChange(JSON.parse(JSON.stringify(before)))
        qm.assert.contains("Overall", updated.href)
        qm.assert.equals("charts-overall-mood", updated.id)
        qm.assert.equals("Overall Mood Charts", updated.title)
        qm.assert.doesNotContain(":variableName", updated.href)
        qm.assert.doesNotHaveProperty(updated.params, 'variableCategoryName')
        done()
    })
})

function createReminder(tr, expectedVariables, expectedNotifications, expectedReminders) {
    var queueBefore = qm.reminderHelper.getQueue()
    qm.reminderHelper.addToQueue([tr])
    expect(qm.reminderHelper.getQueue()).length(queueBefore.length + 1)
    return qm.reminderHelper.syncReminders()
        .then(function (response) {
            const data = (response && response.data) ? response.data : null
            expect(data.trackingReminders).length(expectedReminders)
            expect(data.userVariables).length(expectedVariables)
            expect(data.trackingReminderNotifications).length(expectedNotifications)
            expect(qm.notifications.getCached()).length(expectedNotifications)
            expect(qm.reminderHelper.getCached()).length(expectedReminders)
        })
}

describe("Reminders", function () {
    it("can create a reminder and track the notification", function () {
        this.timeout(90000)
        //expect(qm.appMode.isLocal()).to.be.true
        const variableName = "Hostility"
        qmTests.setTestAccessToken()
        var yesterday = qm.timeHelper.getYesterdayDate()
        return qm.userHelper.getUserFromApi({})
            .then(function (user){
                expect(user.accessToken, qmTests.getTestAccessToken())
                return qm.reminderHelper.deleteByVariableName(variableName)
            })
            .then(function () {
                return qm.reminderHelper.getReminders({variableName})
            })
            .then(function (reminders) {
                expect(reminders).length(0)
                expect(qm.reminderHelper.getQueue()).length(0)
                return createReminder({variableName, frequency: 60},
                    1, 1, 1)
            })
            .then(deleteLastMeasurement(variableName))
            .then(function () {
                expect(qm.reminderHelper.getQueue()).length(0)
                expect(qm.reminderHelper.getCached()).length(1)
                const notifications = qm.notifications.getCached()
                expect(notifications).length(1)
                const n = notifications[0]
                n.value = 1
                expect(qm.notifications.timeout).to.be.null
                qm.notifications.track(notifications[0])
                expect(qm.notifications.timeout).to.not.be.null
                expect(qm.notifications.getQueue()).length(1)
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                qm.measurements.logMeasurements(measurements, "Local Measurements")
                expect(measurements).length(1)
                return qm.notifications.syncIfQueued()
            })
            .then(function (response) {
                expect(qm.notifications.getQueue()).length(0)
                expect(qm.notifications.getCached()).length(0)
                var measurements = qm.measurements.toArray(response.measurements)
                expect(measurements).length(1)
                expect(response.userVariables).length(1)
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                expect(measurements).length(1)
                return qm.reminderHelper.getReminders({variableName})
            })
            .then(function (reminders) {
                expect(reminders).length(1)
                expect(qm.reminderHelper.getQueue()).length(0)
                var tr = reminders[0]
                expect(tr.variableName).to.eq(variableName)
                expect(tr.stopTrackingDate).to.be.null
                expect(qm.reminderHelper.getActive()).length(1)
                expect(qm.reminderHelper.getArchived()).length(0)
                tr.stopTrackingDate = yesterday
                expect(qm.reminderHelper.getQueue()).length(0)
                return createReminder(tr, 1, 0, 1)
            })
            .then(function (){
                var reminders = qm.reminderHelper.getCached()
                expect(qm.reminderHelper.getQueue()).length(0)
                expect(reminders).length(1)
                expect(qm.reminderHelper.getActive()).length(0)
                expect(qm.reminderHelper.getArchived()).length(1)
                expect(qm.notifications.getCached()).length(0)
                var tr = reminders[0]
                expect(tr.stopTrackingDate).to.eq(yesterday)
                tr.stopTrackingDate = null
                return createReminder(tr, 1, 1, 1)
            })
            .then(function (){
                var reminders = qm.reminderHelper.getCached()
                expect(qm.reminderHelper.getQueue()).length(0)
                expect(reminders).length(1)
                expect(qm.reminderHelper.getActive()).length(1)
                expect(qm.reminderHelper.getArchived()).length(0)
                var tr = reminders[0]
                expect(tr.stopTrackingDate).to.be.null
                expect(qm.notifications.getCached()).length(1)
                return createReminder(tr, 1, 1, 1)
            })
    })
})
describe("Studies", function () {
    it('can get a study showing relationship between eggs and mood', function() {
        this.timeout(20000)
        qmTests.setTestAccessToken()
        var causeName = "Eggs (serving)"
        var effectName = "Overall Mood"
        return qm.studyHelper.getStudyFromApi({
            causeVariableName: causeName,
            effectVariableName: effectName,
            userId: 230,
        }, function(study){
            info("Got study " + study.causeVariableName)
            expect(qm.userVariables.cached).to.not.have.property(causeName)
            expect(qm.userVariables.cached).to.not.have.property(effectName)
            expect(qm.commonVariablesHelper.cached).to.not.have.property(causeName)
            expect(qm.commonVariablesHelper.cached).to.not.have.property(effectName)
            qm.variablesHelper.getFromLocalStorageOrApi({
                variableName: "Eggs (serving)",
            }).then(function(variables){
                expect(variables).length(1, "Why did we get " + variables.length +
                    " variables for Eggs (serving)?!?!?")
                qm.getUser(function (user){
                    qm.assert.equals(user.id, variables[0].userId,
                        "The logged in user doesn't have eggs because the study belonged to someone else")
                })
            }, function(error){
                throw Error(error)
            })
        }, function(error){
            throw Error(error)
        })
    })
})
describe("Test Helper", function () {
    it('can save to fixtures', function() {
        var method = "GET"
        var url = "https://test-url.com/some-path?param=hi"
        var data = {"code": 200, "data": {"param": "hi"}}
        var path = qm.tests.urlToFixturePath(method, url)
        return qm.tests.deleteFixture(method, url)
            .then(function (){
                fileHelper.assertDoesNotExist(path)
                qm.tests.addToFixture(method, url, data)
                var gotten = qm.tests.getFixtureData(method, url)
                expect(gotten).to.deep.eq(data)
            })
    })
})
describe("Units", function () {
    it('can get units', function(done) {
        var units = qm.unitHelper.getAllUnits()
        qmLog.debug("units:", units)
        qm.assert.greaterThan(5, units.length)
        done()
    })
})
describe("URL Helper", function () {
    it('can get query params before hash', function(done) {
        var url = 'https://dev-web.quantimo.do/?clientId=preve-wellness-tracker#/app/onboarding'
        var params = qm.urlHelper.getQueryParams(url)
        qm.assert.equals('preve-wellness-tracker', params.clientId)
        done()
    })
})
describe("Users", function () {
    it('can get users', function(done) {
        this.timeout(10000)
        //expect(qm.api.getApiUrl()).to.eq("https://app.quantimo.do")
        qmTests.setTestAccessToken()
        qm.userHelper.getUsersFromApi(function(users){
            qmLog.debug("users:", users)
            qm.assert.greaterThan(0, users.length)
            done()
        }, function(error){
            throw error
        })
    })
})
describe("Variables", function () {
    it("can search for common variables containing partial string", function (done) {
        this.timeout(30000) // Default 2000 is too fast for Github API
        //qm.qmLog.setLogLevelName("debug");
        var alreadyCalledBack = false
        qmTests.setTestAccessToken()
        qm.userHelper.getUserFromLocalStorageOrApi().then(function (user) {
            qmLog.debug("User: ", user)
            if(!qm.getUser()){ throw "No user!" }
            var params = {
                excludeLocal: null,
                includePublic: true,
                minimumNumberOfResultsRequiredToAvoidAPIRequest: 20,
                searchPhrase: "car",
            }
            qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                info('=== Got ' + variables.length + ' variables matching ' + params.searchPhrase)
                // Why? qm.assert.doesNotHaveUserId(variables);
                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                qm.assert.greaterThan(5, variables.length)
                var variable5 = variables[4]
                var timestamp = qm.timeHelper.at()
                qm.variablesHelper.setLastSelectedAtAndSave(variable5)
                var userVariables = qm.globalHelper.getItem(qm.items.userVariables) || []
                info("There are " + userVariables.length + " user variables")
                //qm.assert.isNull(userVariables, qm.items.userVariables);
                qm.variablesHelper.getFromLocalStorageOrApi({id: variable5.id, includePublic: true})
                    .then(function(variables){
                    // Why? qm.assert.doesNotHaveProperty(variables, 'userId');
                    qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                    qm.assert.equals(timestamp, variables[0].lastSelectedAt, 'lastSelectedAt')
                    qm.assert.equals(variable5.name, variables[0].name, 'name')
                    qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                        qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                        var variable1 = variables[0]
                        info("Variable 1 is " + variable1.name)
                        //qm.assert.equals(variable1.lastSelectedAt, timestamp);
                        //qm.assert.equals(variable1.variableId, variable5.variableId);
                        //qm.assert.equals(1, qm.api.requestLog.length, "We should have made 1 request but have "+ JSON.stringify(qm.api.requestLog));
                        if(done && !alreadyCalledBack){
                            alreadyCalledBack = true
                            done()
                        }
                    })
                }, function(error){
                    throw Error(error)
                })
            })
        })
    })
    it('can search manual tracking variables', function(done) {
        qmTests.setTestAccessToken()
        qm.userHelper.getUserFromLocalStorageOrApi().then(function (user) {
            info("Got user " + user.loginName)
            if(!qm.getUser()){ throw "No user!" }
            var params = {
                limit: 100,
                includePublic: true,
                manualTracking: true,
            }
            qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                info('Got ' + variables.length + ' variables')
                qm.assert.count(params.limit, variables)
                var manual = variables.filter(function (v) {
                    return v.manualTracking
                })
                qm.assert.count(params.limit, manual)
                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                done()
            })
        })
    })
})
