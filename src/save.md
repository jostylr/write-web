
# [save](# "version: 0.1.0; saving files to s3)

Uploading file server

This is what is behind save.jostylr.com  The idea is that we have a simple form served via gets, regardless of the url. The url tells us where to store the files. 

    var formidable = require('formidable');
    var http = require('http');
    
    var formstr = _"form | pug | js-stringify";
    
    http.createServer(function (req, res) {
        if (req.method.toLowerCase() === 'post') {
            _"parse form"
        } else {
            _"serve form"
        }
    }).listen(8082);
    
[s3/save.js](# "save: | jshint")
    
    
## Serve Form

This serves the form. It should go out for anything that is not a post request. 

    res.writeHead(200, {'content-type': 'text/html'});
    res.end( formstr );
    
## Form

    html
       head
          title File Upload
       body
          form(enctype="multipart/form-data", method="post")
              input(type="text", name="title")
              br
              input(type="file", name="upload", multiple="multiple")
              br
              input(type="submit", value="Upload")
    
## Parse form

This parses the form, eventually sending the files to s3 as well as storing in repo under the same name. 

    var form = new formidable.IncomingForm();
    
    //no funky stuff
    var url = url.replace(/^[a-zA-Z0-9\/-]/g, '-');
    var paths = url.split('/');
    var repo = path.shift() + '/' + path.shift();
    paths = paths.join('/');
    
    form.parse(req, function(err, fields, files) {
        
    });
    
[url]()

We wat to get from the url the repo which is of the form `user/repo` and then the rest is the directory relative to the s3 bucket and relative to the downloads. 


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
