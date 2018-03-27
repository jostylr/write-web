# Files

This is where we handle uploading files.

We use formidable on the server and on the browser we use basic vanilla xml
request. 



## Serving Files

Here we want to allow for serving files if someone has the right access.  




    _":get file name"

    if (access(user, file, 'r') ) {
        let fileStream = fs.createReadStream("./save/"+file);
        res.writeHead(200, {
            "Content-Type": mime.look(file) || 'application/octet-stream',
            "Content-Disposition": 'inline; filename="'+filename+'"' }); 
        fileStream.pipe(res);
    } else {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("Item not available");
    }
    
    
About [content disposition](https://stackoverflow.com/questions/20508788/do-i-need-content-type-application-octet-stream-for-file-download)

[get file name]()

Here we extract the desired file from the url. 


    


## Sample

Here is an independent example of the server to experiment with.

### node

A modified version of  [example](https://github.com/felixge/node-formidable)


    const formidable = require('formidable');
    const http = require('http');
    const util = require('util');
    const fs = require('fs');

    const index = fs.readFileSync('index.html');


    http.createServer(function(req, res) {
      if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.uploadDir = "./saves";
        form.keepExtensions = true;
        form.multiples = true;


        form.parse(req, function(err, fields, files) {
            console.log(fields, files);
          res.writeHead(200, {'content-type': 'application/json'});
          res.end(JSON.stringify({fields: fields, files: files}));
        });

        return;
      }

      // show a file upload form
      res.writeHead(200, {'content-type': 'text/html'});
      res.end(index);
    }).listen(8080);

[sample/form/server.js](# "save:")


### HTML

Here we have the index file that handles the js interaction. The key here is
sending it as multi-part, multiple file upload and getting a response. 


    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>title</title>
      </head>
      <body>
        _":form"
        <div id="res"></div>
        <script>
        _":script"
        </script>
      </body>
    </html>

[sample/form/index.html](# "save:")


[form]()

    <form name="sample" enctype="multipart/form-data" method="post">
    <input type="text" name="title"><br>
    <input type="file" name="upload" multiple="multiple"><br>
    <input type="submit" value="Upload">
    </form>

[script]()


    var form = document.forms.namedItem("sample");
    form.addEventListener('submit', function(ev) {

      var oOutput = document.getElementById("res"),
          oData = new FormData(form);

      oData.append("CustomField", "This is some extra data");

      var oReq = new XMLHttpRequest();
      oReq.open("POST", "/upload", true);
      oReq.addEventListener('load', function(oEvent) {
        if (oReq.status == 200) {
          oOutput.innerHTML = "Uploaded!" + oReq.response;
        } else {
          oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
        }
      });

      oReq.send(oData);
      ev.preventDefault();
    }, false);



