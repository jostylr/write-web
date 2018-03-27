/*global require, __dirname*/ 

var express = require('express');
var forceSSL = require('express-force-ssl');
var fs = require('fs');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');

var ssl_options = {
  key: fs.readFileSync('../keys/www-key.pem'),
  cert: fs.readFileSync('../keys/www_writeweb_net.crt'),
  ca: fs.readFileSync('../keys/www_writeweb_net.ca-bundle')
};

var app = express();
var server = http.createServer(app);
var secureServer = https.createServer(ssl_options, app);

app.use(function(req, res, next) { 
    if (req.hostname === 'writeweb.net') { 
        return res.redirect(301, "https://www.writeweb.net"+req.url);
    }
    next();
}); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(forceSSL);

app.use("/g", function (req, res) {
    var pieces = req.url.slice(1).split("/");
    if (pieces.length !== 4) {
        res.send("error!");
    } else {
        
        
        res.send("success yeah!"); 
    }
});





//static hosting
app.use(express.static(__dirname + "/public"));
 
secureServer.listen(443);
server.listen(80);
