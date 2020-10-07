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
var app_root_path_1 = __importDefault(require("app-root-path"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
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
function uploadToS3(filePath, s3BasePath, cb, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = "quantimodo"; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var s3 = getS3Client();
    var fileContent = fs.readFileSync(filePath);
    var fileName = path.basename(filePath);
    var s3Key = s3BasePath + "/" + fileName;
    var params = {
        ACL: accessControlLevel,
        Body: fileContent,
        Bucket: s3Bucket,
        Key: s3Key,
    };
    if (ContentType) {
        // @ts-ignore
        params.ContentType = ContentType;
    }
    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        console.log("File uploaded successfully. " + data.Location);
        if (cb) {
            cb(data);
        }
    });
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
    ensureDirectoryExistence(filePath);
    fs.writeFile(filePath, contents, function (err) {
        if (err) {
            throw err;
        }
        // tslint:disable-next-line:no-console
        console.log(filePath + " saved!");
        if (cb) {
            cb();
        }
    });
}
exports.writeToFile = writeToFile;
function getAbsolutePath(relativePath) {
    return path.resolve(app_root_path_1.default.toString(), relativePath);
}
exports.getAbsolutePath = getAbsolutePath;
//# sourceMappingURL=qm.file-helper.js.map