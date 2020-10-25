"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var fs = __importStar(require("fs"));
var https = __importStar(require("https"));
var mime = __importStar(require("mime"));
var path = __importStar(require("path"));
var Q = __importStar(require("q"));
var rimraf_1 = __importDefault(require("rimraf"));
var qmLog = __importStar(require("./qm.log"));
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
function createFile(filePath, contents, cb) {
    writeToFile(filePath, contents, cb);
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
function downloadFromS3(filePath, key, cb, bucketName) {
    if (bucketName === void 0) { bucketName = "quantimodo"; }
    var s3 = new aws_sdk_1.default.S3();
    s3.getObject({
        Bucket: bucketName,
        Key: key,
    }, function (err, data) {
        if (err) {
            if (err.name === "NoSuchKey") {
                console.warn(key + " not found in bucket: " + bucketName);
                cb(null);
                return;
            }
            throw err;
        }
        if (data && data.Body) {
            fs.writeFileSync(filePath, data.Body.toString());
            console.log(filePath + " has been created!");
            if (cb) {
                cb(filePath);
            }
        }
        else {
            throw Error(key + " not found in bucket: " + bucketName);
        }
    });
}
exports.downloadFromS3 = downloadFromS3;
function uploadToS3InSubFolderWithCurrentDateTime(filePath, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = "quantimodo"; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var at = new Date();
    var dateTime = at.toISOString();
    return uploadToS3(filePath, s3BasePath + "/" + dateTime, s3Bucket, accessControlLevel, ContentType);
}
exports.uploadToS3InSubFolderWithCurrentDateTime = uploadToS3InSubFolderWithCurrentDateTime;
function uploadToS3(relative, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = "quantimodo"; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var deferred = Q.defer();
    var s3 = getS3Client();
    var abs = getAbsolutePath(relative);
    assertExists(abs);
    var fileContent = fs.readFileSync(abs);
    var fileName = path.basename(relative);
    var s3Key = s3BasePath + "/" + fileName;
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
function writeToFile(filePath, contents, cb) {
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
            throw err;
        }
        // tslint:disable-next-line:no-console
        console.log(absolutePath + "\n\tsaved!");
        if (cb) {
            cb(absolutePath);
        }
    });
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
function download(url, relative, cb) {
    var absolutePath = getAbsolutePath(relative);
    var file = fs.createWriteStream(absolutePath);
    qmLog.info("Downloading " + url + " to " + absolutePath + "...");
    https.get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
            file.on("close", cb);
            file.close();
        });
    });
}
exports.download = download;
function uploadFolderToS3(dir, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = "quantimodo"; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    return listFilesRecursively(dir)
        .then(function (files) {
        var promises = [];
        // @ts-ignore
        files.forEach(function (file) {
            promises.push(uploadToS3(file, s3BasePath, s3Bucket, ContentType));
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
//# sourceMappingURL=qm.file-helper.js.map