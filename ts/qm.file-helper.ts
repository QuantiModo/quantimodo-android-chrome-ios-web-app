// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
import AWS from "aws-sdk"
import {ManagedUpload} from "aws-sdk/clients/s3"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import rimraf from "rimraf"
import * as qmLog from "./qm.log"

export function assertDoesNotExist(relative: string) {
    const abs = getAbsolutePath(relative)
    if (fs.existsSync(abs)) {
        throw Error(abs + " exists!")
    }
}

export function assertExists(relative: string) {
    const abs = getAbsolutePath(relative)
    if (!fs.existsSync(abs)) {
        throw Error(abs + " does not exist!")
    }
}

// require untyped library file
// tslint:disable-next-line:no-var-requires
const qm = require("../src/js/qmHelpers.js")

export function exists(filename: string) {
    const filepath = getAbsolutePath(filename)
    return fs.existsSync(filepath)
}

export function createFile(filePath: string, contents: any, cb?: () => void) {
    writeToFile(filePath, contents, cb)
}

export function deleteFile(filename: string, cb?: () => void) {
    const filepath = getAbsolutePath(filename)
    rimraf(filepath, function () {
        qmLog.info("Deleted " + filepath + " in deleteFile")
        if (cb) {
            cb()
        }
    })
}

export function getS3Client() {
    const AWS_ACCESS_KEY_ID =
        process.env.QM_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID // Netlify has their own
    if (!AWS_ACCESS_KEY_ID) {
        throw new Error("Please set AWS_ACCESS_KEY_ID env")
    }
    const AWS_SECRET_ACCESS_KEY =
        process.env.QM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY // Netlify has their own
    if (!AWS_SECRET_ACCESS_KEY) {
        throw new Error("Please set AWS_ACCESS_KEY_ID env")
    }
    const s3Options = {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    }
    return new AWS.S3(s3Options)
}

export function downloadFromS3(filePath: string, bucketName: string, key: string, cb: (arg0: any) => void) {
    const s3 = new AWS.S3()
    s3.getObject({
        Bucket: bucketName,
        Key: key,
    }, (err, data) => {
        if (err) {
            throw err
        }
        if (data && data.Body) {
            fs.writeFileSync(filePath, data.Body.toString())
            console.log(`${filePath} has been created!`)
        } else {
            throw Error("File not found")
        }
    })
}

export function uploadToS3InSubFolderWithCurrentDateTime(filePath: string,
                                                         s3BasePath: string,
                                                         cb: (err: Error, url: string) => void,
                                                         s3Bucket = "quantimodo",
                                                         accessControlLevel = "public-read",
                                                         ContentType?: string | undefined) {
    const at = new Date()
    const dateTime = at.toISOString()
    uploadToS3(filePath, s3BasePath + "/" + dateTime, cb, s3Bucket, accessControlLevel, ContentType)
}

export function uploadToS3(
    relative: string,
    s3BasePath: string,
    cb: (err: Error, url: string) => void,
    s3Bucket = "quantimodo",
    accessControlLevel = "public-read",
    ContentType?: string | undefined,
) {
    const s3 = getS3Client()
    const abs = getAbsolutePath(relative)
    assertExists(abs)
    const fileContent = fs.readFileSync(abs)
    const fileName = path.basename(relative)
    const s3Key = s3BasePath + "/" + fileName
    const params = {
        ACL: accessControlLevel,
        Body: fileContent,
        Bucket: s3Bucket,
        Key: s3Key,
    }
    if (ContentType) {
        // @ts-ignore
        params.ContentType = ContentType
    }
    s3.upload(params, (err: any, SendData: any) => {
        if (err) {
            throw err
        }
        qmLog.info(s3Key + ` uploaded to ${SendData.Location}`)
        if (cb) {
            cb(err, SendData.Location)
        }
    })
}

export function writeToFile(filePath: string, contents: any, cb?: () => void) {
    function ensureDirectoryExistence(filePathToCheck: string) {
        const dirname = path.dirname(filePathToCheck)
        if (fs.existsSync(dirname)) {
            return true
        }
        ensureDirectoryExistence(dirname)
        fs.mkdirSync(dirname)
    }

    filePath = getAbsolutePath(filePath)
    ensureDirectoryExistence(filePath)
    console.log("Writing to " + filePath)
    fs.writeFile(filePath, contents, (err) => {
        if (err) {
            throw err
        }
        // tslint:disable-next-line:no-console
        console.log(filePath + " saved in writeToFile!")
        if (cb) {
            cb()
        }
    })
}

export function getAbsolutePath(relativePath: string) {
    if (path.isAbsolute(relativePath)) {
        return relativePath
    } else {
        return path.resolve(".", relativePath)
    }
}

export function download(url: string, relative: string, cb: any) {
    const absolutePath = getAbsolutePath(relative)
    const file = fs.createWriteStream(absolutePath)
    qmLog.info("Downloading " + url + " to " + absolutePath + "...")
    https.get(url, function(response) {
        response.pipe(file)
        file.on("finish", function() {
            file.on("close", cb)
            file.close()
        })
    })
}
