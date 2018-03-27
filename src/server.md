# Server

This is the core server file. 

We start by loading up require dependencies, including the initialization
logic which is customized per project. 

The idea is that the initialization defines what data to load by default


    _"modules"
    
    _"initialize data"
    
    

    const http = require('http');

    http.createServer((req, res) => {
        if (req.method === 'OPTIONS' && dev) {
           response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
        }
        _"cookie:read"
        if (req.method === 'GET') {

        }
        if (req.method === 'POST')
            switch (request.url) {
            case '/aj' : _"json"
            break;
            case '/upload' : _"files::server"
            break;
            default : 
            error(req, res);
        } else {
            error(req, res);
        }
    }).listen(config.port || 3000);


## JSON

Anything sent to `/aj` should be a JSON fragment. This is where most of the
work happens. 



        let body = [];
        request.on('data', (chunk) => {
        body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          response.end(body);
        });


## Cookie

Here we handle the cookie bits.

The cookie



## Initialize Data

This is where we handle all the initialization, from reading in the
instructions to loading any initial csv data. 

We begin with just having a local toggle if we are running this locally. 

    const local = true;

## Modules

This is where we load up modules we rely on. 

We use 

* [Formidable](https://github.com/felixge/node-formidable)  This is the
  standard in file uploads. Not going to get into it on my own. 

---

   const formidable = require('formidable'); 
    


