
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
    var EvW = require('event-when');
    
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
    
    form.uploadDir = 'temp';
    form.multiples = true;
    form.keepExtensions = true;
    
    form.parse(req, function(err, fields, files) {
        var comment = fields.comment;
        var quarantine = [], ready = [];
        var assetsAllowed = [], assetsExisting = [];
        var gcd = new EvW();
        if (files.hasOwnProperty("upload")) {
            gcd.on("directory data received, _"deal with files");
            gcd.on("files moved", _"report files loaded");
            gcd.when("files seen", "files moved");
            _"get directory data

        } else {
            res.writeHead(404, {'content-type': 'text/plain'});
            res.end("file failed to upload.");
        }
    });
    
### Get Directory Data
    
This needs to make sure the relevant asset and quarantine directories exist, grab the asset file listings, and grab the permitted assets files. For existing asset files that collide with name, there is a backup associated with it, and that needs to get checked, etc. Anything that is not in the assets permission file, gets sent to quarantine. Files can get overwritten in quarantine (if you are overwriting a quarantine file, it is not yet in production and it might as well replace it -- silent overwritng too! Is this hostile UI to myself, probably). 

Each line of the asset file will start with a dir/filename followed by space. These are allowed files. Stuff after the space is ignored in this setup.
    
    
    
    
### Deal with files

Here we need to mv the file from the temp directory to either the quarantine directory or assets directory

First, we need to obtain the file name. 

Then we need to check our lists and see if  

Need to rethink backups. Maybe none. Maybe just a separate directory that can be dealth with. An overwrite toggle or something? 

    function () {
            files = Array.isArray(files.upload) ? files.upload : [files.upload];
            files.forEach(function (file) {
                 var fname = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                 var tempname = file.path;
                 var relFname = folder + fname;
                 if ( assetsAllowed.indexOf(relFname) !== -1 ) {
                     if (assetsExisting.indexOf(relFname) === -1) {
                         gcd.when("file moved:tempname", "files moved");
                         fs.rename(tempname, relFname, function (err) {
                             if (err) {
                                 log("Error", tempname, relFname, err);
                             } else {
                                 log("File Saved", relFname);
                             }
                             gcd.emit("file moved:tempname");
                         });
                     } else {
                         var i, n= assetsExisting.length; //must end before this
                         relFname = 
                         do {
                             
                         
                         } until (i < n)
                     }
                 } else {
                    
                 }
                 console.log(file.name, file.path, util.inspect(file));
                 fs.access(file.path, function (err) {
                     console.log(err);
                 });
            });
            gcd.emit("files seen");
            
    }


### Report files loaded 

All the files have been moved. We now construct the return object. 

    function () {
         var report = '';
         report += '<h3>The following files have been quarantined:</h3><ol>';
         quarantine_":forEach";
         report += '</ol><h3>The following files are ready</h3><ol>';
         ready_":forEach";
         report += '</ol';
         
         res.writeHead(200, {'content-type': 'text/html'});
         res.end(formstr.
             replace("Uploads welcome!", "Successfully uploaded. Another?").
             replace("</body>", report + "</body>";
         );

[forEach]() 

         .forEach(function (el) {
             report += '<li>el</li>';
         })

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
    var folder = paths.join('/')+'/';
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
    deps: formidable 1.0.17, event-when 1.5.0")
