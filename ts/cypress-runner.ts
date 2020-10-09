import * as qmTests from "./cypress-functions"
import {loadEnv} from "./env-helper"
loadEnv("local")
if(!process.env.ELECTRON_ENABLE_LOGGING) {
    console.log("set env ELECTRON_ENABLE_LOGGING=\"1\" if you want to log to CI.  Disabled by default to avoid leaking secrets on Travis")
}
const specName = process.env.SPEC_NAME
if (specName) {
    console.log("Only running process.env.SPEC_NAME "+specName)
    qmTests.runOneCypressSpec(specName, function() {
        console.info("Done with "+specName)
    })
} else {
    console.log("runLastFailedCypressTest and then run runCypressTests")
    qmTests.runLastFailedCypressTest(function(err: any): void {
        console.log("Done with runLastFailedCypressTest. Going to run all now...")
        if (err) { throw err }
        qmTests.runCypressTests()
    })
}
