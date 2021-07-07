import * as qmLog from "../ts/qm.log"
import * as qmTests from "./cypress-functions"
import {loadEnv} from "../ts/env-helper"
// loadEnv("local")
if(!process.env.ELECTRON_ENABLE_LOGGING) {
    console.log("set env ELECTRON_ENABLE_LOGGING=\"1\" if you want to log to CI.  Disabled by default to avoid leaking secrets on Travis")
}
const specName = process.env.SPEC_NAME
const PARALLEL = false // Doesn't work for some reason
if (specName) {
    console.log("Only running process.env.SPEC_NAME "+specName)
    qmTests.runOneCypressSpec(specName, function() {
        qmLog.logEndOfProcess(specName)
    })
} else if (PARALLEL) {
    console.log("runCypressTestsInParallel")
    qmTests.runCypressTestsInParallel()
} else {
    console.log("runLastFailedCypressTest and then run runCypressTests")
    qmTests.runLastFailedCypressTest(function(err: any): void {
        qmLog.logEndOfProcess("runLastFailedCypressTest")
        if (err) { throw err }
        console.log("Done with runLastFailedCypressTest. Going to run all now...")
        qmTests.runCypressTests()
    })
}
