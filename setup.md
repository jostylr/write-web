# [writeweb](# "version: 0.1.0; writeweb.net and its uses")


## lprc.js

    /*global module, require*/ 
    module.exports = function(Folder, args) {

        require('litpro-jshint')(Folder, args);
        
        _":pug"
        
        _":js-stringify"
        
    };
        
[lprc.js](# "save:")
        
[pug]()    

Pug converts the pug syntax into html. It is mainly used for structures as
opposed to content. `pug text...|pug`  Formerly jade. 

    var pug = require('pug');

    Folder.sync("pug" , function (code, args) {
        options = args.join(",").trim();
        if (options) {
            options = JSON.parse(options);
        } else {
            options = {'pretty':true};
        }
        return pug.render(code, options); 
    });

    
[js-stringify]() 

This takes a body of text and converts into a single string. We use JSON.stringify to quote the item correctly and then strip it out to get the quote. 

    Folder.sync("js-stringify", function (input) {
        return JSON.stringify({a:input}).slice(5,-1);
    });
    
    

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
        "node": ">=0.12"
      },
      "dependencies":{
        _"g::npm dependencies"
      },
      "devDependencies" : {
        _"g::npm dev dependencies"
      },
      "scripts" : { 
        "test" : "node ./test.js"
      },
      "keywords": ["literate programming"],
      "private": true

    }


[package.json](# "save:")

# .gitignore

    node_modules

[.gitignore](# "save:")


by [James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: ;
    dev: litpro-jshint 0.2.1, pug 2.0.0-beta5 ")
