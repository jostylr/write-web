# [editor](# "version: 0.1.0; editing files")

I like prose.io, but it has a tab issue and it is not vim setup. I want my own browser editor. Fortunately, I have a server. 

The idea is to set up a separate user for each github user that you want on the machine. Set it up for push/pull access using the private key stuff. 

This file creates an editor backend which can be routed by nginx via do.jostylr.com/username  and sub heading for writing. A modal login can popup and save a cookie if desired (private local machine). The editor instance has a codemirror in vim mode with tab set to do spaces.

It should have automated saving to the server every minute in a distinct directory of some kind. When actually saved, it asks for change log and whether to commit. It saves it to disk and possibly pushes. Hopefully it all works out. 

Going to be sketchy initially.

Need also to deal with text editing (code mirror -- submit form, need password stuff).

## App

We will use express. It will serve the static files, manage the sessions, and manage the text files. 

    var http = require('http');
    var url = require('url');
    var fs = require('fs');
    var cp = require('child_process');
    var crypto = require('crypto');
    
    var express = require('express');
    var logger = require('morgan');
    var cookieSession = require('cookie-session');
    var bodyParser = require('body-parser');
    
    var app = express();
    

    
    app.use(function (request, response) {
    
    }
    
    app.use();
    
    http.createServer(app).listen(8083);
    
   
    

[editor/app.js](# "save:")


## Editor Page


## Login Authentication

Here we handle the login and authentcation aspect of all of this. This is a single user editing system.

The plan is to use cookie session to maintain the session nature. 

    var secret = crypto.randomBytes(32).toString('hex');
    var authToken = crypto.randomBytes(32).toString('hex');

    var pwd = fs.readFileSynce('pwd.txt', {encoding:'utf8'});
    
    app.use(cookieSession({
        secure:true,
        secureProxy: true,
        secret: secret
    });
    
    app.use(bodyParser.urlencoded({extended:false});
    
    app.use(_"check for login");
    
    app.use(_"check for session send login if needed");
    

### Check for login

The login form sends a post to the same address. So we look for a post with fields username and password. If there, we confirm authenticity and set session data. Also, if possible, set the method to GET. If not there, we move on to the next step. The login is the only form encoded submission so if body is present at this point, it should mean this is a login form. I will probably hate myself later for doing this. 

    function (req, res, next) {
        if (req.body) {
        
        } else {
           next() 
        }
    
    }


### Check for session send login if needed

Look at session data. If present and correct, we move on. 


### Login page

The login page is fairly simple

    html
       head
          title Login
       body
          h1 Login, Please
          form(method="post", name=")
             label(for="username") Username
             input(type="text", name="username")
             br
             label(for="pwd") Password
             input(type="password", name="pwd")
             br
             input(type="submit", value="Submit")
             
 

## Some xhr stuff

Our needs are simple. Here is a reference: http://stackoverflow.com/questions/24468459/sending-a-json-to-server-and-retrieving-a-json-in-return-without-jquery

// Sending and receiving data in JSON format using POST mothod
//
xhr = new XMLHttpRequest();
var url = "url";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onreadystatechange = function () { 
    if (xhr.readyState == 4 && xhr.status == 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.password)
    }
}
var data = JSON.stringify({"email":"hey@mail.com","password":"101010"});
xhr.send(data);

Sending a receiving data in JSON format using GET method

// Sending a receiving data in JSON format using GET method
//
xhr = new XMLHttpRequest();
var url = "url?data=" + encodeURIComponent(JSON.stringify({"email":"hey@mail.com","password":"101010"}));
xhr.open("GET", url, true);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onreadystatechange = function () { 
    if (xhr.readyState == 4 && xhr.status == 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.password)
    }
}
xhr.send();


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
      "keywords": ["express"],
      "private": true

    }


[editor/package.json](# "save:")


by [James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: express 4.14.0, event-when 1.5.0")
