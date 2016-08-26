
# [save](# "version: 0.1.0; saving assets")

Our requirements:  `save.jostylr.com/user/repo/...` points to an upload into the ... folders of s3 in the repo of interest. This will store the files locally in that repo and sync to s3 for backup; part of the setup process will also do a reverse sync. 

Security. One option is to put a password for the folders. This would require cookie and sessions and be a bit of a hassle. ~~Instead, we will allow for uploads, but a file is quarantined until it appears on a manifest list. A file that already exists will have the new file versioned and quarantined until on the manifest. The versioning should be returned to the uploader along with another upload form. ~~

New idea. All files not already existing are saved in the assets folder, under the provided path. There needs to be an import list to port them into the build folder where they will get served. Files that would overwrite them use the random name. All files get put in a list with their actual filename, their uploaded filename, the file hash, and the upload date. 

When the files get transferred to build, a list should be maintained of what files and hashes have been sent. Each time the transfer is run, it checks to see what transfers need to be done. The what-has-been transferred should have filename and hash. This will be checked against which files should be done. 

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
    form.hash = true;
    var now = (new Date()).toUTCString();
    
    form.parse(req, function(err, fields, files) {
        var comment = fields.comment;
        var ready = [];
        var assetsExisting;
        var gcd = new EvW();
        if (files.hasOwnProperty("upload")) {
            gcd.on("directory data received", _"deal with files");
            gcd.on("files moved", _"report files loaded");
            gcd.when("files seen", "files moved");
            _"get directory data"

        } else {
            res.writeHead(400, {'content-type': 'text/plain'});
            res.end("file failed to upload. No file found");
        }
    });
    
### Get Directory Data
    
This needs to make sure the relevant asset directory exists and grab the asset file listings in that directory. For existing asset files that collide with name, the random upload name will be left in place.  

    var assetPath = repoPath + '/assets/' + folder;
    gcd.when('directory data called', 'directory data received');
    _":failure condition"
    _":check directory existence"
    _":read asset file listing"
    
    
[check directory existence]()

We need the asset directory to exist. We create it if it does not. Faillure happens if we cannot create it. 

    gcd.when('directory exists:'+ assetPath, 'directory data received');
    fs.access(assetPath, function (err) {
        if (err) {            
            cp.execFile('mkdir', ['-p', assetPath], function (err, stdout, stderr) {
                if (err) {
                    gcd.emit('failure in directory data: cannot make directory', err);
                    return;
                }
                gcd.emit('directory exists:' + assetPath, [stderr, stdout]);
            });
        } else {
           gcd.emit('directory exists:' + assetPath);
        }
    });
    

[read asset file listing]()

Assets existing should be an object with keys being the filenames and value being the hash. These are the first entries on a line in the assetsexisting file. 

    gcd.when('asset file read in', 'directory data received');
    fs.readFile(repoPath + '/assetsexisting.txt', {encoding: 'utf8'}, function (err, txt) {
        if (err) {
            gcd.emit('failure in directory data: cannot not read asset', [err]);
        }
        var lines = txt.split("\n");
        lines.forEach(function (el) {
           var data = el.split(" ");
           assetsExisting[data[0]] = data[1];
        }
        gcd.emit('asset file read in');
    });

[failure condition]()

If `failure in directory data` is issued, error is returned

    gcd.on('failure in directory data', function (data, event) {
        res.writeHead(500, {'content-type' : 'text/plain'});
        res.end("directory cannot be accessed." + event.ev + data);
    });


    
### Deal with files

We have our list of existing asset files and we have the directory to write them to. 

If the file already exists, we check to see if the hash is different. If it is, we log it as being different and save it under the random name. If it is not different, then we log it as having been already uploaded, seemingly the same, doing nothing. If it does not already exist, we move and save it. 


    function () {
        files = Array.isArray(files.upload) ? files.upload : [files.upload];
        files.forEach(function (file) {
            var fname = file.name.replace(/[^a-zA-Z0-9._-]/g, '\_');
            var tempname = file.path;
            var relFname = folder + fname;
            var fileEmit = 'file moved:' + tempname;
            gcd.when(fileEmit, 'files moved');
            if ( assetsExisting.hasOwnProperty(relFname) ) {
                if (assetsExisting[relFname] === file.hash ) {
                    _":report same"
                } else {
                    _":already exists different"
                    
                }
            } else {
                _":does not exist"
            }
        });
        gcd.emit("files seen");
    }
    
[report same]()

Very simple. Report the sameness, emit file done.

     ready.push("File " + relFname + " already exists and seems identical. Ignoring.");
     fs.unlink(tempname, function () {});
     gcd.emit(fileEmit, null);
     

[already exists different]()

The file exists. So we move it to the tempname in the folder location. We record that. 

    fs.rename(tempname, assetPath + tempname, function (err) {
        if (err) {
            ready.push("File " + relFname + " has led to an error:" + err);
            
        } else {
            ready.push("File " + relFname + " already exists and is different." + 
                " Uploaded file is now named " + folder + tempname);
            assetLines.push([folder + tempname, file.hash, now, relFname ].join(" "));
            gcd.emit(fileEmit);
        }
    });


[does not exist]()
    
 The file exists 
 
     fs.rename(tempname, assetPath + relFname, function (err) {
        if (err) {
            ready.push("File " + relFname + " has led to an error:" + err);
            
        } else {
            ready.push("File " + relFname + " has been saved.");
            assetLines.push([relFname, file.hash, now, relFname ].join(" "));
            gcd.emit(fileEmit);
        }
    });
  


### Report files loaded 

All the files have been moved. We now construct the return object. 

    function () {
         var report = '';
         report += '<h3>Reports on the following files</h3><ol>';
         ready.forEach(function (el) {
             report += '<li>el</li>';
         });
         report += '</ol>';
         
         
         
         res.writeHead(200, {'content-type': 'text/html'});
         res.end(formstr.
             replace("Uploads welcome!", "Successfully uploaded. Another?").
             replace("</body>", report + "</body>") );
         );

         

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
