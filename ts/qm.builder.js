"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var recursive_copy_1 = __importDefault(require("recursive-copy"));
var replace_in_file_1 = __importDefault(require("replace-in-file"));
var rimraf_1 = __importDefault(require("rimraf"));
var dir = "../www";
function replaceUrls() {
    var replaceOptions = {
        files: dir + "/index.html",
        from: [
            /href="img/g,
            /src="js/g,
            /href="css/g,
            /src="data/g,
            /"manifest.json"/g,
        ],
        to: [
            "href=\"https://quantimodo.github.io/quantimodo-android-chrome-ios-web-app/src/img",
            "src=\"https://quantimodo.github.io/quantimodo-android-chrome-ios-web-app/src/js",
            "href=\"https://quantimodo.github.io/quantimodo-android-chrome-ios-web-app/src/css",
            "data=\"https://quantimodo.github.io/quantimodo-android-chrome-ios-web-app/src/js",
            "\"https://quantimodo.github.io/quantimodo-android-chrome-ios-web-app/src/manifest.json\"",
        ],
    };
    try {
        var results = replace_in_file_1.default.sync(replaceOptions);
        console.log("Replacement results:", results);
    }
    catch (error) {
        console.error("Error occurred:", error);
    }
}
// delete directory recursively
rimraf_1.default(dir, function () {
    console.log(dir + " is deleted!");
    // wrench.rmdirSyncRecursive(dir)
    copyFolder();
});
function copyFolder() {
    var options = {
        dot: true,
        expand: true,
        filter: [
            "**/*",
            "!.htpasswd",
        ],
        junk: true,
        overwrite: true,
    };
    recursive_copy_1.default("../src", dir, options)
        .on(recursive_copy_1.default.events.COPY_FILE_START, function (copyOperation) {
        console.info("Copying file " + copyOperation.src + "...");
    })
        .on(recursive_copy_1.default.events.COPY_FILE_COMPLETE, function (copyOperation) {
        console.info("Copied to " + copyOperation.dest);
    })
        .on(recursive_copy_1.default.events.ERROR, function (error, copyOperation) {
        console.error("Unable to copy " + copyOperation.dest);
    })
        .then(function (results) {
        console.info("All done! " + results.length + " files copied.");
        replaceUrls();
    })
        .catch(function (error) {
        return console.error("Copy failed: " + error);
    });
}
//# sourceMappingURL=qm.builder.js.map