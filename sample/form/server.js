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
