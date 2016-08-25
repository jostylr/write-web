
# [save](# "version: 0.1.0; saving assets")

Our requirements:  `save.jostylr.com/user/repo/...` points to an upload into the ... folders of s3 in the repo of interest. This will store the files locally in that repo and sync to s3 for backup; part of the setup process will also do a reverse sync. 

Security. One option is to put a password for the folders. This would require cookie and sessions and be a bit of a hassle. Instead, we will allow for uploads, but a file is quarantined until it appears on a manifest list. A file that already exists will have the new file versioned and quarantined until on the manifest. The versioning should be returned to the uploader along with another upload form. 

The form should also have a comment box. All of this needs to be logged. 

Maybe write a script that takes in the version name and replaces it in the generated output using a version control list in the repo. 

So in the repo, we have an assets folder which is externally saved files. We also have a quarantine folder. And we have a log file. We could also have a secrets folder; in here would be whatever, but probably a private repo that gets pulled when changed. 

## Uploading file server

This is what is behind save.jostylr.com  The idea is that we have a simple form served via gets if the url points to a valid repo; it denies access otehrwise. The url tells us where to store the files. 

    var formidable = require('formidable');
    var http = require('http');
    var util = require('util');
    var fs = require('fs');
    
    var formstr = _"form | pug | js-stringify";
    
    http.createServer(function (req, res) {
        _"parse url into repo"
        fs.access(repoPath, function (err) {
            _"reject"
            
            if (req.method.toLowerCase() === 'post') {
                _"parse form"
                return;
            }
            
            _"serve form"
            
        });
    }).listen(8082);
    
[s3/save.js](# "save: | jshint")
    
    
## Serve Form

This serves the form. It should go out for anything that is not a post request. 

    res.writeHead(200, {'content-type': 'text/html'});
    res.end( formstr );
    
### Form

    html
       head
          title File Upload
       body
          h1 Uploads welcome!
          form(enctype="multipart/form-data", method="post")
              input(type="text", name="comment")
              br
              input(type="file", name="upload", multiple="multiple")
              br
              input(type="submit", value="Upload")
              
For drag and drop:  https://robertnyman.com/2010/12/16/utilizing-the-html5-file-api-to-choose-upload-preview-and-see-progress-for-multiple-files/
    
## Parse form

This parses the form, eventually sending the files to s3 as well as storing in repo under the same name. 

    var form = new formidable.IncomingForm();
    
    form.parse(req, function(err, fields, files) {
        var comment = fields.comment;
        if (files.hasOwnProperty("upload")) {
            files = Array.isArray(files.upload) ? files.upload : [files.upload];
            files.forEach(function (file) {
                 console.log(file.name, file.path);
            });
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(formstr.replace("Uploads welcome!", "Successfully uploaded. Another?");
        } else {
            res.writeHead(404, {'content-type': 'text/plain'});
            res.end("file failed to upload.");
        }
    });
    

## Parse url into repo

We wat to get from the url the repo which is of the form `user/repo` and then the rest is the directory relative to the s3 bucket and relative to the downloads. We sanitize it so that it is just letters, numbers, dashes, and slashes. We strip the leading directories which should be the path

    //no funky stuff
    var url = req.url.slice(1).replace(/[^a-zA-Z0-9\/-]/g, '-');
    var paths = url.split('/');
    if ( (paths.length <= 1) || (paths[0].length === 0) ) { // need at least two paths
    	_"reject"
        return;
    }
    var repo = paths.shift() + '/' + paths.shift();
    var folder = paths.join('/');
    var repoPath = '/home/repos/' + repo;


## Reject

If the url does not correspond to a known repo, then we reject the page and send an access error.

    if (err) {
        res.writeHead(404, {'content-type' : 'text/html'});
        res.end( _":html | pug | js-stringify" ); 
        return;
    }

[html]() 

    html
      head 
          title Access Denied
      body
          h2 Your path is not recognized.
          
          h3 Do not give up hope. You will figure this out. 
          
          h4 Need help? Seek it. 


## NPM package

The requisite npm package file. 

    {
      "name": "_`g::docname`",
      "description": "_`g::tagline`",
      "version": "_`g::docversion`",
      "homepage": "https://github.com/_`g::gituser`/_`g::docname`",
      "author": {
        "name": "_`g::authorname`",
        "email": "_`g::authoremail`"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/_`g::gituser`/_`g::docname`.git"
      },
      "bugs": {
        "url": "https://github.com/_`g::gituser`/_`g::docname`/issues"
      },
      "license": "MIT",
      "main": "index.js",
      "engines": {
        "node": ">=6.4.0"
      },
      "dependencies":{
        _"g::npm dependencies"
      },
      "scripts" : { 
        "test" : "node ./test.js"
      },
      "keywords": ["s3 upload"],
      "private": true

    }


[s3/package.json](# "save:")


by [James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: formidable 1.0.17")
