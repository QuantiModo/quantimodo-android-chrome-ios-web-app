"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var qmTests = __importStar(require("./cypress-functions"));
var env_helper_1 = require("./env-helper");
env_helper_1.loadEnv("local");
if (!process.env.ELECTRON_ENABLE_LOGGING) {
    console.log("set env ELECTRON_ENABLE_LOGGING=\"1\" if you want to log to CI.  Disabled by default to avoid leaking secrets on Travis");
}
var specName = process.env.SPEC_NAME;
if (specName) {
    console.log("Only running process.env.SPEC_NAME " + specName);
    qmTests.runOneCypressSpec(specName, function () {
        console.info("Done with " + specName);
    });
}
else {
    console.log("runLastFailedCypressTest and then run runCypressTests");
    qmTests.runLastFailedCypressTest(function (err) {
        console.log("Done with runLastFailedCypressTest. Going to run all now...");
        if (err) {
            throw err;
        }
        qmTests.runCypressTests();
    });
}
//# sourceMappingURL=cypress-runner.js.map