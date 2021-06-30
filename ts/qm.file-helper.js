"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFilesRecursively = exports.uploadFolderToS3 = exports.download = exports.getAbsolutePath = exports.writeToFile = exports.uploadToS3 = exports.uploadToS3InSubFolderWithCurrentDateTime = exports.downloadFromS3 = exports.getS3Client = exports.deleteFile = exports.createFile = exports.exists = exports.assertExists = exports.assertDoesNotExist = void 0;
// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
var aws_sdk_1 = require("aws-sdk");
var fs = require("fs");
var https = require("https");
var mime = require("mime");
var path = require("path");
var Q = require("q");
var rimraf_1 = require("rimraf");
var qmLog = require("./qm.log");
var defaultS3Bucket = "qmimages";
function assertDoesNotExist(relative) {
    var abs = getAbsolutePath(relative);
    if (fs.existsSync(abs)) {
        throw Error(abs + " exists!");
    }
}
exports.assertDoesNotExist = assertDoesNotExist;
function assertExists(relative) {
    var abs = getAbsolutePath(relative);
    if (!fs.existsSync(abs)) {
        throw Error(abs + " does not exist!");
    }
}
exports.assertExists = assertExists;
// require untyped library file
// tslint:disable-next-line:no-var-requires
var qm = require("../src/js/qmHelpers.js");
function exists(filename) {
    var filepath = getAbsolutePath(filename);
    return fs.existsSync(filepath);
}
exports.exists = exists;
function createFile(filePath, contents) {
    return writeToFile(filePath, contents);
}
exports.createFile = createFile;
function deleteFile(filename) {
    var deferred = Q.defer();
    var filepath = getAbsolutePath(filename);
    rimraf_1.default(filepath, function () {
        qmLog.info(filepath + "\n\tdeleted!");
        deferred.resolve();
    });
    return deferred.promise;
}
exports.deleteFile = deleteFile;
function getS3Client() {
    var AWS_ACCESS_KEY_ID = process.env.QM_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID; // Netlify has their own
    if (!AWS_ACCESS_KEY_ID) {
        throw new Error("Please set AWS_ACCESS_KEY_ID env");
    }
    var AWS_SECRET_ACCESS_KEY = process.env.QM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY; // Netlify has their own
    if (!AWS_SECRET_ACCESS_KEY) {
        throw new Error("Please set AWS_ACCESS_KEY_ID env");
    }
    var s3Options = {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
    return new aws_sdk_1.default.S3(s3Options);
}
exports.getS3Client = getS3Client;
function downloadFromS3(filePath, key, bucketName) {
    if (bucketName === void 0) { bucketName = defaultS3Bucket; }
    var s3 = new aws_sdk_1.default.S3();
    var deferred = Q.defer();
    s3.getObject({
        Bucket: bucketName,
        Key: key,
    }, function (err, data) {
        if (err) {
            if (err.name === "NoSuchKey") {
                console.warn(key + " not found in bucket: " + bucketName);
                deferred.resolve(null);
                return;
            }
            throw err;
        }
        if (data && data.Body) {
            fs.writeFileSync(filePath, data.Body.toString());
            console.log(filePath + " has been created!");
            deferred.resolve(filePath);
        }
        else {
            throw Error(key + " not found in bucket: " + bucketName);
        }
    });
    return deferred.promise;
}
exports.downloadFromS3 = downloadFromS3;
function uploadToS3InSubFolderWithCurrentDateTime(relative, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = defaultS3Bucket; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var at = new Date();
    var dateTime = at.toISOString();
    return uploadToS3(relative, s3BasePath + "/" + dateTime + "/" + relative, s3Bucket, accessControlLevel, ContentType);
}
exports.uploadToS3InSubFolderWithCurrentDateTime = uploadToS3InSubFolderWithCurrentDateTime;
function uploadToS3(filePath, s3Key, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = defaultS3Bucket; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var deferred = Q.defer();
    var s3 = getS3Client();
    var abs = getAbsolutePath(filePath);
    assertExists(abs);
    var fileContent = fs.readFileSync(abs);
    var params = {
        ACL: accessControlLevel,
        Body: fileContent,
        Bucket: s3Bucket,
        Key: s3Key,
    };
    if (!ContentType) {
        try {
            ContentType = mime.getType(s3Key);
        }
        catch (e) {
            qmLog.error(e);
        }
    }
    if (ContentType) {
        // @ts-ignore
        params.ContentType = ContentType;
    }
    s3.upload(params, function (err, SendData) {
        if (err) {
            qmLog.error(s3Key + "\n\t FAILED to uploaded");
            deferred.reject(err);
        }
        else {
            qmLog.info(s3Key + "\n\tuploaded to\t\n" + SendData.Location);
            deferred.resolve(SendData.Location);
        }
    });
    return deferred.promise;
}
exports.uploadToS3 = uploadToS3;
function writeToFile(filePath, contents) {
    var deferred = Q.defer();
    function ensureDirectoryExistence(filePathToCheck) {
        var dirname = path.dirname(filePathToCheck);
        if (fs.existsSync(dirname)) {
            return true;
        }
        ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
    var absolutePath = getAbsolutePath(filePath);
    ensureDirectoryExistence(absolutePath);
    console.log("Writing to " + absolutePath);
    fs.writeFile(absolutePath, contents, function (err) {
        if (err) {
            deferred.reject(err);
        }
        // tslint:disable-next-line:no-console
        console.log(absolutePath + "\n\tsaved!");
        deferred.resolve(absolutePath);
    });
    return deferred.promise;
}
exports.writeToFile = writeToFile;
function getAbsolutePath(relativePath) {
    if (path.isAbsolute(relativePath)) {
        return relativePath;
    }
    else {
        return path.resolve(".", relativePath);
    }
}
exports.getAbsolutePath = getAbsolutePath;
function download(url, relative) {
    var deferred = Q.defer();
    var absolutePath = getAbsolutePath(relative);
    var file = fs.createWriteStream(absolutePath);
    qmLog.info("Downloading " + url + " to " + absolutePath + "...");
    https.get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
            file.on("close", function () {
                deferred.resolve(absolutePath);
            });
            file.close();
        });
    });
    return deferred.promise;
}
exports.download = download;
function uploadFolderToS3(dir, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = defaultS3Bucket; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    return listFilesRecursively(dir)
        .then(function (files) {
        var promises = [];
        // @ts-ignore
        files.forEach(function (file) {
            var dirWithForwardSlashes = qm.stringHelper.replaceBackSlashes(dir, "/");
            var fileWithForwardSlashes = qm.stringHelper.replaceBackSlashes(file, "/");
            var relativePath = fileWithForwardSlashes.replace(dirWithForwardSlashes, "");
            var s3Key = s3BasePath + relativePath;
            s3Key = s3Key.replace("\\", "/");
            promises.push(uploadToS3(file, s3Key, s3Bucket, ContentType));
        });
        return Q.all(promises);
    });
}
exports.uploadFolderToS3 = uploadFolderToS3;
function listFilesRecursively(dir) {
    var results = [];
    var deferred = Q.defer();
    fs.readdir(dir, function (err, list) {
        if (err) {
            deferred.reject(err);
            return;
        }
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) {
                deferred.resolve(results);
                return;
            }
            file = path.resolve(dir, file);
            fs.stat(file, function (statErr, stat) {
                if (stat && stat.isDirectory()) {
                    listFilesRecursively(file).then(function (res) {
                        results = results.concat(res);
                        next();
                    });
                }
                else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
    return deferred.promise;
}
exports.listFilesRecursively = listFilesRecursively;
