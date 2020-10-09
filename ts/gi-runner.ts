// Usage:
// npm install typescript ts-node
// npx ts-node ts/gi-run.ts
import * as gi from "./gi-functions"
// process.env.RELEASE_STAGE = "ionic"
if(process.env.RELEASE_STAGE === "ionic") {
    console.log("Only running ionic tests because RELEASE_STAGE is ionic")
    gi.runIonicFailedAll(function() {
        process.exit(0)
    })
} else {
    gi.runEverything(function() {
        process.exit(0)
    })
}
