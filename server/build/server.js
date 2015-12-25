var http = require('http');
var fs = require('fs');
var cp = require('child_process');
var sane = /[^a-z1-9-]/g;

http.createServer( function( req, res ) {
    var piees, loc;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if ('OPTIONS' == req.method) {
        return res.end('', 200);
    } else if ( req.method === "GET" ) {
        res.setHeader("Content-type", "text/plain"); 
        pieces = req.url.split("/").reverse();
        loc = pieces[1].replace(sane, '') + "/" + 
              pieces[0].replace(sane, '');
        fs.access(loc, function (err) {
            if (err) {
               res.end("Error: Unable to open " + loc, 200);              
            } else {
                cp.execFile("./compile.sh", [loc], function (err, output) {
                    if (err) {
                        res.end("Error:" + err, 200);
                    } else {
                        res.end("Success:" + outputi, 200);
                    }
                });
            }
        });
    }
}).listen( 8080 );
