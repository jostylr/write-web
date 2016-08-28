
# [save](# "version: 0.1.0; saving assets")

Our requirements:  `save.jostylr.com/user/repo/...` points to an upload into the ... folders of the assets folder in the local repo.  This will store the files locally in that repo and sync according to the instructions in the instruction file under "asset".

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
    var cp = require('child_process');
    var EvW = require('event-when');
    
    var formstr = _"form | js-stringify";
    
    http.createServer(function (req, res) {
        _"parse url into repo"
        fs.access(repoPath, function (err) {
            if (err) {
                _"reject"
            }
            
            if (req.method.toLowerCase() === 'post') {
                _"parse form"
                return;
            }
            
            _"serve form"
            
        });
    }).listen(8082);
    
[save/save.js](# "save: | jshint")
    
    
## Serve Form

This serves the form. It should go out for anything that is not a post request. 

    res.writeHead(200, {'content-type': 'text/html'});
    res.end( formstr );
    
### Form

We will use a variation from https://www.raymondcamden.com/2013/09/10/Adding-a-file-display-list-to-a-multifile-upload-HTML-control/

Added some styling to the input files item so that it is a large drag and drop area.

Having more programmatic file uploading to a form rather than xhr is not possible due to security issues. So we make the file upload input very large with css. 


	<!doctype html>
	<html>
	<head>
    <meta name = "viewport" content = "user-scalable=yes, initial-scale=1.0, maximum-scale=1.0, width=device-width">
	<title>File Upload</title>
	<style>
	    #selectedFiles .img {
		width: 10vw;
        height: 10vh;
		margin-bottom:10px;
        display:inline-block;
	    }
        #selectedFiles .fname {
           width: 10vh;
           margin:10px;
           display:inline-block;
        }
        #selectedFiles .newname {
           width: 20vh;
           display:inline-block;
        }
        #selectedFiles img {
           max-height:100%;
           max-width: 100%;
        }
        #files {
          height: 10vh;
          border: medium solid;
          width: 100%;
          background-color: lightblue;
        }
        #submit {
            height: 6vh;
            width: 100%;
        }
	</style>
	</head>
	    
	<body>
	    
	    <form id="myForm" method="post" enctype="multipart/form-data">

		Files: <input type="file" id="files" name="upload" multiple><br/>

		<div id="selectedFiles"></div>

		<input id="submit" type="submit" value="Click to save the assets">
	    </form>

	    <script>
    var selDiv = "";
        
    document.addEventListener("DOMContentLoaded", init, false);
    
    function init() {
        document.querySelector('#files').addEventListener('change', handleFileSelect, false);
        selDiv = document.querySelector("#selectedFiles");
    }
        
    function handleFileSelect(e) {
        
        selDiv.innerHTML = '';
        
        if (!e.target.files) {
            return;
        }
        
        var files = e.target.files;
        var filesArr = Array.prototype.slice.call(files);                   

        var str = '<ol>\n';

        filesArr.forEach(function(f, i) {
           
            str += '<li><span class="img"></span><span class="fname">' + 
               f.name + '</span><span class="newname"><input type="text" name="' +
               i + '" placeholder="New name (optional)"></li>\n';
        
            if ( f.type.match("image.*")  && window.FileReader ) {
               var reader = new FileReader();
               reader.onload = function (e) {
                    var html = '<img src="' + e.target.result + '">';
                    var item = selDiv.querySelector('ol :nth-child(' + (i+1) + ') .img');
                    item.innerHTML = html;
               };
               reader.readAsDataURL(f); 
            }
        });
        str += "</ol>";
        selDiv.innerHTML = str;
     }
	    </script>

	</body>
	</html>



[junk]() 

Works, but is limited in the drag and drop file upload department. 

    html
       head
          title File Upload
       body
          h1 Uploads welcome!
          form.dropzone(enctype="multipart/form-data", method="post")
              input.fallback(type="file", name="upload", multiple="multiple")
              br
              input(type="submit", value="Upload")
          



## Parse form

This parses the form, storing in repo under the same name. 

    var form = new formidable.IncomingForm();
    
    form.uploadDir = 'temp';
    form.multiples = true;
    form.keepExtensions = true;
    form.hash = 'sha1';
    var now = (new Date()).toUTCString();
    
    form.parse(req, function(err, fields, files) {
     console.log(fields);
        var ready = [];
        var assetsExisting = {};
        var assetLines = [];
        var gcd = new EvW();
        _"console logging | echo "
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
    gcd.emit('directory data called');
    
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
            return;
        }
        var lines = txt.split("\n");
        lines.forEach(function (el) {
           if (el) {
              var data = el.split(" | ");
              assetsExisting[data[0]] = data[1];
           }
        });
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
        files.forEach(function (file, ind) {
            console.log(file.name, fields[ind]);
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

    var backname = tempname.slice(5);
    fs.rename(tempname, assetPath + backname, function (err) {
        if (err) {
            ready.push("File " + relFname + " has led to an error: " + err);
        } else {
            ready.push("File " + relFname + " already exists and is different." + 
                " Uploaded file is now named " + backname );
            assetLines.push([backname, file.hash, now, relFname ].join(" | "));
        }
        gcd.emit(fileEmit);        
    });


[does not exist]()
    
 The file exists 
 
     fs.rename(tempname, assetPath + fname, function (err) {
        if (err) {
            ready.push("File " + relFname + " has led to an error: " + err);
        } else {
            ready.push("File " + relFname + " has been saved.");
            assetLines.push([relFname, file.hash, now, relFname ].join(" | "));
        }
        gcd.emit(fileEmit);
    });
  


### Report files loaded 

All the files have been moved. We now construct the return object. We also write the assetLines to the asset folder. 

    function () {
        var report = '';
        report += '<h3>Reports on the following files</h3><ol>';
        ready.forEach(function (el) {
            report += '<li>' + el + '</li>';
        });
        report += '</ol>';
         
        if (assetLines.length > 0) {
            fs.appendFile(repoPath + '/assetsexisting.txt', "\n" + assetLines.join("\n"), 
              function () {
               cp.execFile("upload", [repo, "assets"], 
                 function (err, stdout, stderr) {
                     console.log(err, stdout, stderr);
               });  
           });
        }
        

         
        res.writeHead(200, {'content-type': 'text/html'});
        res.end(formstr.
            replace("Uploads welcome!", "Successfully uploaded. Another?").
            replace("</body>", report + "</body>")
        );
    }



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
    if (folder) { 
        folder += '/';
    }
    var repoPath = '/home/repos/' + repo;


## Reject

If the url does not correspond to a known repo, then we reject the page and send an access error.

    res.writeHead(404, {'content-type' : 'text/html'});
    res.end( _":html | pug | js-stringify" ); 

[html]() 

    html
      head 
          title Access Denied
      body
          h2 Your path is not recognized.
          
          h3 Do not give up hope. You will figure this out. 
          
          h4 Need help? Seek it. 


## Console logging

Here are some quick event data

    gcd.log = function () {
        var a = arguments[0];
        var b = arguments[1];
        var c = arguments[2];
        var str = function (a) {
           return (typeof a === "string") ? a : '';
        }
        if ( (a === "on") || (a === "when") || (a === "emit") ) {
           console.log(str(a), " !! ", str(b),  " !!! " , str(c));
        }
    };
    

## Transfer shell script

This is a script that reads in asset-transfer.txt (and possibly quiet/asset-transfer.txt), asset-existing.txt, and asset-built.txt, trying to figure out which files need to be transferred to build and/or a script that acts on it? 

transfer.txt would be of the following form: 

first lines are simply transfer. Each file has a line and if it should just go where it is named (typical), then that's it. If it gets named to something else, then write that, relative to the latest directory a directory allows one to write the directory prefix easily leave a slash at the end. A second one on directory line sends them all to that directory. 

We can also have scripts that take in a single file and a destination (and maybe other options) and again we can use the same directory format and conventions. The first portion can be thought of as the mv command. We denote a new command as a line starting with >



    

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
