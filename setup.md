# [writeweb](# "version: 0.1.0; writeweb.net and its uses")


## lprc.js

    /*global module, require*/ 
    module.exports = function(Folder, args) {

        require('litpro-jshint')(Folder, args);

    };

[lprc.js](# "save:")

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
    dev: litpro-jshint 0.2.1 ")
