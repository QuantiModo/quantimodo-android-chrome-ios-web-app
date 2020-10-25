// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
import AWS from "aws-sdk"
import * as fs from "fs"
import * as https from "https"
import * as mime from "mime"
import * as path from "path"
import * as Q from "q"
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

export function deleteFile(filename: string) {
    const deferred = Q.defer()
    const filepath = getAbsolutePath(filename)
    rimraf(filepath, function() {
        qmLog.info(filepath + "\n\tdeleted!")
        deferred.resolve()
    })
    return deferred.promise
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

export function downloadFromS3(filePath: string, key: string, cb: (filePath: string | null) => void,
                               bucketName = "quantimodo") {
    const s3 = new AWS.S3()
    s3.getObject({
        Bucket: bucketName,
        Key: key,
    }, (err, data) => {
        if (err) {
            if (err.name === "NoSuchKey") {
                console.warn(key + " not found in bucket: " + bucketName)
                cb(null)
                return
            }
            throw err
        }
        if (data && data.Body) {
            fs.writeFileSync(filePath, data.Body.toString())
            console.log(`${filePath} has been created!`)
            if(cb) {
                cb(filePath)
            }
        } else {
            throw Error(key + " not found in bucket: " + bucketName)
        }
    })
}

export function uploadToS3InSubFolderWithCurrentDateTime(filePath: string,
                                                         s3BasePath: string,
                                                         s3Bucket = "quantimodo",
                                                         accessControlLevel = "public-read",
                                                         ContentType?: string | undefined) {
    const at = new Date()
    const dateTime = at.toISOString()
    return uploadToS3(filePath, s3BasePath + "/" + dateTime, s3Bucket, accessControlLevel, ContentType)
}

export function uploadToS3(
    relative: string,
    s3BasePath: string,
    s3Bucket = "quantimodo",
    accessControlLevel = "public-read",
    ContentType?: string | undefined | null,
) {
    const deferred = Q.defer()
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
    if(!ContentType) {
        try {
            ContentType = mime.getType(s3Key)
        } catch (e) {
            qmLog.error(e)
        }
    }
    if (ContentType) {
        // @ts-ignore
        params.ContentType = ContentType
    }
    s3.upload(params, (err: any, SendData: any) => {
        if (err) {
            qmLog.error(s3Key + "\n\t FAILED to uploaded")
            deferred.reject(err)
        } else {
            qmLog.info(s3Key + "\n\tuploaded to\t\n"+ SendData.Location)
            deferred.resolve(SendData.Location)
        }
    })
    return deferred.promise
}

export function writeToFile(filePath: string, contents: any, cb?: (filePath: string) => void) {
    function ensureDirectoryExistence(filePathToCheck: string) {
        const dirname = path.dirname(filePathToCheck)
        if (fs.existsSync(dirname)) {
            return true
        }
        ensureDirectoryExistence(dirname)
        fs.mkdirSync(dirname)
    }

    const absolutePath = getAbsolutePath(filePath)
    ensureDirectoryExistence(absolutePath)
    console.log("Writing to " + absolutePath)
    fs.writeFile(absolutePath, contents, (err) => {
        if (err) {
            throw err
        }
        // tslint:disable-next-line:no-console
        console.log(absolutePath + "\n\tsaved!")
        if (cb) {
            cb(absolutePath)
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

export function uploadFolderToS3(
    dir: string,
    s3BasePath: string,
    s3Bucket = "quantimodo",
    accessControlLevel = "public-read",
    ContentType?: string | undefined,
) {
    return listFilesRecursively(dir)
        .then(function(files) {
            const promises: Q.IWhenable<any[]> = []
            // @ts-ignore
            files.forEach(function(file) {
                promises.push(uploadToS3(file, s3BasePath, s3Bucket, ContentType))
            })
            return Q.all(promises)
        })
}

export function listFilesRecursively(dir: string) {
    let results: any[] = []
    const deferred = Q.defer()
    fs.readdir(dir, function(err, list) {
        if (err) {
           deferred.reject(err)
           return
        }
        let i = 0;
        (function next() {
            let file = list[i++]
            if (!file) {
                deferred.resolve(results)
                return
            }
            file = path.resolve(dir, file)
            fs.stat(file, function(statErr, stat) {
                if (stat && stat.isDirectory()) {
                    listFilesRecursively(file).then(function(res) {
                        results = results.concat(res)
                        next()
                    })
                } else {
                    results.push(file)
                    next()
                }
            })
        })()
    })
    return deferred.promise
}
