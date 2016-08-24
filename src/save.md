
# Uploading file server

This is what is behind save.jostylr.com  The idea is that we have a simple form served via gets, regardless of the url. The url tells us where to store the files. 

    var formidable = require('formidable');
    var http = require('http');
    
    var formstr = _":form | pug | js-stringify";
    
    http.createServer(function (req, res) {
        if (req.method.toLowerCase() === 'post') {
            _":parse form"
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

