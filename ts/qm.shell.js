"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSynchronously = void 0;
var qmLog = require("./qm.log");
function executeSynchronously(cmd, catchExceptions) {
    var execSync = require("child_process").execSync;
    console.info(cmd);
    try {
        var res = execSync(cmd);
        qmLog.info(res);
    }
    catch (error) {
        if (catchExceptions) {
            console.error(error);
        }
        else {
            throw error;
        }
    }
}
exports.executeSynchronously = executeSynchronously;
