# [basic website](# "version: 0.1.0; plain website")

This is the main entry way to compiling the markdown pages into html and
doing whatever else is necessary.

## Files


* [custom.css](#css "save: | postcss autoprefixer ")
* [index.html](# "save:| go index.md ")

* [thumbs.js](#pdf-thumbnailing "save:")
* This is a script that reduces the images to 450 px. [../img.js](#img-reduce "save:")  The images should be in original and it will lead to build/img.   


This reads in the file, splits on `---` lines, then sticks them in a doc for
keys title, body, gal where gal is short for gallery and it gets translated
into html and css galleries under imgf if present.  We also compile the body
into markdown. The final step is to compile the doc into the template. After
that, we can compile that again with a separate command if the body had stuff
to compile. 

[go](# "compose: readfile $0 
    | .split \n---\n 
    | defaults :css, :hero, :footer, _'footer', :nav, _'nav', :bottom
    | minidoc :title, :body 
    | .mapc .trim 
    | .apply :body, md  
    | .compile html::template 
    | syntax ")


 May want to look into cleanup the html page (remove the hooks for subbing
 (CSS, JS) and any empty style or script tags. 
 
[file reading]()
    
This takes in a file and outputs a command that will read in the file, process
it, and then save it. It assumes the file is of the form `name.ext` and the
arguments are of the form `final extension, initial extension, cmd1, cmd2,
...`

A generated string ought to look like `_"|go name.md | savefile name.html"`

    function (input, args) {
        var path = require('path');
        bits = path.parse(input);
        if (bits.ext !== args[1]) {
            return '';
        }
        return '\_"|' + args[2] + ' ' + input + 
            ' | savefile ' + name + args[0] + '"';
    }
            

[source reading]()

    _"|echo pages | readdir | .mapc fileCompile .html, .md, go | 
        .mapc compile"


## Getting the source files

    

## Custom Properties

[website name](# "store: WriteWeb")

[website url](# "store: https://www.writeweb.net")




[menu]() 

    * [About](about.html)
    * [Join](join.html)
    * [Grants](grants.html)
    * [Newsletters](newsletters.html)
    * [Places](places.html)
    * [Calendar](calendar.html)



## Common CSS variables

A pale yellow color for the background

[background color](# "store: rgba(189, 238, 198, 1) ")

rgba(253, 250, 219, 1) 
rgba(225, 229, 192, 1); 
rgba(252, 239, 160, 1);
rgba(250, 194, 111, 0.34);

## Colors

This is a list of colors. The transform directive will split on lines and
colons to generate key-values that get stored under color:key.

    headerbg: grey
    nav links: white
    bodybg: white

[colors|](# ":| .split \n | augment arr | .splitsep : 
    | minidoc | .store color: ") 


### Base Override

This is a place to put rules that override default styles, such as fonts.


## lprc.js

This also creates the lprc file

    /*global module, require*/ 
    module.exports = function(Folder, args) {
        require('litpro-jshint')(Folder, args);
    };


## Readme

Every repository should have a README
      
    This is the source of [_"website name"](_"website url"). It is generated
    using literate programming and the tools of
    [writeweb](https://writeweb.net)


[../README.md](# "save:")    
 
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


[../package.json](# "save:")


by [James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: ;
    dev: litpro 0.11.1, cheerio 0.19.0, markdown-it 4.4.0, 
        markdown-it-anchor 2.3.0, 
        jade 1.11.0, postcss 5.0.4, autoprefixer 6.0.0,
        gm 1.18.1, pdf-image 1.0.1, mailhide 0.1.1, tiny-csv 2.0.0   ")
  
