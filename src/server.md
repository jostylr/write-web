# Server

This is the core server file. 

We start by loading up require dependencies, including the initialization
logic which is customized per project. 

The idea is that the initialization defines what data to load by default


    _"modules"
    
    _"access::cookie"

    const init = (_"initialize data")();
    
    const tokens = init.tokens; 
    _"access::token"

    const http = require('http');

    const $handler = async function (req, res)  {
        if (req.method === 'OPTIONS' && init.dev) {
           response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
        }
        const user = (await validToken(getCookie(req)) ) || init.user(req) || 0;        
        if (req.method === 'GET') {
            _"get"
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
    };

    http.createServer($handler).listen(init.port || 3000);


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


## Initialize Data

This is where we handle all the initialization, from reading in the
instructions to loading any initial csv data. 

We begin with just having a local toggle if we are running this locally. 




    function () {

        return {
            public : 'public',
            access : {
                'dl/' : ['saves/', ['u',1] ]
            },
            user : () => {return 0;},
            dev : true,
            tokens : {},
            port : 8080,
            age : 36000; // 100 hours
        };

    }
        
    

## GET

This handles the get requests. In general, these are file requests. Data
requests are handled with JSON objects under a POST with the command to read
the data. 

As par of the initialization data, we state the public web root; all files are
accessible here. In production, nginx will handle those files, but we also put
it here for dev convenience. 

We also have paths that are private by default. These are defined with where
the internal directory maps to and who has access to these.  

We start by eliminating the possibility of paths going beyond the desired
directory; the normalize command shifts all `..` to the front. Once we have
that, we call matchPath with the access 

    let pname = path.
        normalize(url.parse(req.url).pathname).
        replace(/^(\.\.[\/\\])+/, '');

    let [rep, rest] = matchPath(pname);
    let valid = access(rep, 'r', user);
    if (internal) {
        path = path.join(__dirname, rep, rest);
    } else {
        path = path.join(__dirname, init.public, pname); 
    }
   
    




## Modules

This is where we load up modules we rely on. 

We use 

* [Formidable](https://github.com/felixge/node-formidable)  This is the
  standard in file uploads. Not going to get into it on my own. 
* [uid-generator](https://www.npmjs.com/package/uid-generator). Generates
  UIDs for tokens. See access token. 
  

---

    const url = require('url');
    const path = require('path');

    const formidable = require('formidable'); 

    //accesss::token
    const UIDGenerator = require('uid-generator');
    const uidgen = new UIDGenerator(); // Default is a 128-bit UID encoded in base58


