// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
import appRoot from "app-root-path"
import AWS from "aws-sdk"
import * as fs from "fs"
import * as path from "path"

export function getS3Client() {
  const AWS_ACCESS_KEY_ID =
    process.env.QM_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID // Netlify has their own
  if(!AWS_ACCESS_KEY_ID) {
    throw new Error("Please set AWS_ACCESS_KEY_ID env")
  }
  const AWS_SECRET_ACCESS_KEY =
    process.env.QM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY // Netlify has their own
  if(!AWS_SECRET_ACCESS_KEY) {
    throw new Error("Please set AWS_ACCESS_KEY_ID env")
  }
  const s3Options = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
  return new AWS.S3(s3Options)
}
export function uploadToS3(
  filePath: string,
  s3BasePath: string,
  cb: (arg0: any) => void,
  s3Bucket = "quantimodo",
  accessControlLevel = "public-read",
  ContentType?: string | undefined,
) {
  const s3 = getS3Client()
  const fileContent = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)
  const s3Key = s3BasePath + "/" + fileName
  const params = {
    ACL: accessControlLevel,
    Body: fileContent,
    Bucket: s3Bucket,
    Key: s3Key,
  }
  if(ContentType) {
    // @ts-ignore
    params.ContentType = ContentType
  }
  s3.upload(params, (err: any, data: { Location: any }) => {
    if (err) {
      throw err
    }
    console.log(`File uploaded successfully. ${data.Location}`)
    if (cb) {
      cb(data)
    }
  })
}

export  function writeToFile(filePath: string, contents: any, cb?: () => void) {
  function ensureDirectoryExistence(filePathToCheck: string) {
    const dirname = path.dirname(filePathToCheck)
    if (fs.existsSync(dirname)) {
      return true
    }
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
  }
  ensureDirectoryExistence(filePath)
  fs.writeFile(filePath, contents, (err) => {
    if (err) { throw err }
    // tslint:disable-next-line:no-console
    console.log(filePath + " saved!")
    if (cb) {
      cb()
    }
  })
}

export function getAbsolutePath(relativePath: string) {
  return path.resolve(appRoot.toString(), relativePath)
}
