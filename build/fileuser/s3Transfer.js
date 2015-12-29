/*global require, process, console*/

var s3 = require('s3');

var args = process.argv.slice(2);

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default 
  s3RetryCount: 3,    // this is the default 
  s3RetryDelay: 1000, // this is the default 
  multipartUploadThreshold: 20971520, // this is the default (20 MB) 
  multipartUploadSize: 15728640, // this is the default (15 MB) 
  s3Options: {
    accessKeyId: args[1],
    secretAccessKey: args[2]
  }
});

var params = {
  localDir: "/home/writeweb/" + args[0] + "/build",
  deleteRemoved: true, // default false, whether to remove s3 objects 
                       // that have no corresponding local file. 
  s3Params: {
    Bucket: args[3]
  }
};
var uploader = client.uploadDir(params);
uploader.on('error', function(err) {
  console.error("unable to sync:", err.stack);
});
uploader.on('fileUploadStart', function (localFilePath, s3Key) {
    console.log("File uploading: " + localFilePath + " into " + s3Key);
});
uploader.on('fileUploadEnd', function (localFilePath, s3Key) {
    console.log("File done: " + localFilePath + " with " + s3Key);
});
uploader.on('end', function() {
  console.log("done uploading: " + params.localDir);
});
