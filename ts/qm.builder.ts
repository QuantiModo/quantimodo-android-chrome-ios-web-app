// @ts-ignore
// tslint:disable-next-line:no-var-requires
import * as fs from "fs"
import copy from "recursive-copy"
import replace from "replace-in-file"
import rimraf from "rimraf"

const dir = "../www"

function replaceUrls() {
    const replaceOptions = {
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
    }
    try {
        const results = replace.sync(replaceOptions)
        console.log("Replacement results:", results)
    } catch (error) {
        console.error("Error occurred:", error)
    }
}

// delete directory recursively
rimraf(dir, function() {
    console.log(`${dir} is deleted!`)
    // wrench.rmdirSyncRecursive(dir)
    copyFolder()
})

function copyFolder() {
    const options = {
        dot: true,
        expand: true,
        filter: [
            "**/*",
            "!.htpasswd",
        ],
        junk: true,
        overwrite: true,
        // rename(filePath) {
        //     return filePath + ".orig"
        // },
        // transform(src, dest, stats) {
        //     if (path.extname(src) !== ".txt") { return null }
        //     return through(function(chunk, enc, done)  {
        //         const output = chunk.toString().toUpperCase()
        //         done(null, output)
        //     })
        // },
    }

    copy("../src", dir, options)
        .on(copy.events.COPY_FILE_START, function(copyOperation: { src: string }) {
            console.info("Copying file " + copyOperation.src + "...")
        })
        .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation: { dest: string }) {
            console.info("Copied to " + copyOperation.dest)
        })
        .on(copy.events.ERROR, function(error: any, copyOperation: { dest: string }) {
            console.error("Unable to copy " + copyOperation.dest)
        })
        .then(function(results: any) {
            console.info("All done! " + results.length + " files copied.")
            replaceUrls()
        })
        .catch(function(error: string) {
            return console.error("Copy failed: " + error)
        })
}
