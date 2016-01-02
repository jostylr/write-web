# Scripts

This host the scripts, both the internal literate programming commands, as
well as the external command line scripts. If there is browser scripting
needed, we recommend using a different litpro program.


* [css](css.md "load:") This loads the css file into scope so that the media
  big, moderate, and small are loaded for the syntax function. 

## Internal scripts

These add commands to the processing. 

### Equals

This is actually for testing and should be the start of its own testing
library. 

It tests whether the input and the argument are the same, with the second
argument being the test name to report.

    function (input, args) {
        if (input === args[0]) {
            doc.log("OK:" + args[1]);
        } else {
            doc.log("FAIL:" + args[1] + "\n" + 
                "GOAL:\n" + args[0] + "\n" +
                "INPUT\n" + input + "\n");
        }
        return input;
    }
    
[equals](# "define:")

### Wrap

This wraps the input between the first and second argument.

    function (input, args) {
        return args[0] + input + args[1];
    }

[wrap](# "define:")

[example]()

This works as so:

    _":sample text | wrap <style>, </style> | equals _":test", wrap "

[sample text]()

    Just some stuff.
    
    You know?

[test]()

    <style>Just some stuff.

    You know?</style>


### Table

This expects an array of row-arrays. It simply puts the html together. Its
arguments give some html attributes: id, class, raw...

    function (input, args) {
        var html = '<table ' +
            (args[0] ? '"id"=' + args[0] + ' '   : '' ) + 
            (args[1] ? '"class"=' + args[1] + ' ' : '' ) + 
            args.slice(2).join(' ') + 
            '>' + 
            input.reduce(function(prev, row) {
                var out = prev + '<tr><td>' + 
                    row.join("</td><td>") +
                    "</td></tr>";
                return out; 
            }, '') + "</table>";
        return html;
    }


[table](# "define:")

[example]()

    _"|echo arr( arr(1, 2), arr(3, 4) ) | table me, us, 'width'=50px |
        equals _":test text", table "

[test text]()

    <table "id"=me "class"=us 'width'=50px><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>

### Defaults

This takes in an array and converts the arguments into arrays of keys with
defaults. It returns a new array. 

    function (input, args) {
        var arr, keys = {}, key, i, n, el;
        if (Array.isArray(input) ) {
            arr = [];
            n = args.length;
            _":create the arg keys"
            input.forEach(_":grab keyed sections");
            for (key in keys) {
                arr.push([key, keys[key]]);
            }
            return arr;
        } else {
            return input;
        }

    }

[defaults](# "define:")

[create the arg keys]()

    for (i = 0; i < n; i += 1) {
        el = args[i];
        if (el[0] === ":") {
            next = args[i+1];
            if ( ( next ) && (next[0] !== ":") ) {
                keys[el] = next;
            } else {
                keys[el] = '';
            }
        }
    }

[grab keyed sections]()

Look for keys that start with `!:`. If present, key it up. If not, push it on
the return array arr.

    function (el) {
        var name; 
        if (el.slice(0,2) === "!:") {
            ind = el.indexOf("\n");
            if (ind !== -1) {
                keys[el.slice(1,ind)] = el.slice(ind+1);
            } else {
                keys[el.slice(1)] = '';
            }
        } else {
            arr.push(el);
        }
    }


[sample text]()

    Title
    ---
    !:hero
    <some html stuff>
    ---
    !:css
    ---
    Now the body.

[sample nav]()

    button1
    button2

[template]()

    \_":title"
    \_":css"
    \_":nav"
    \_":blank"
    \_":hero"
    \_":body"

[test]()

We have added a composition command to demonstrate how to inject a default
text into it as I don't see how to grab the external blocks within a
composition. 

    _":sample text |  testgo _"defaults:sample nav"
        | equals _":target", defaults "

[testgo](# "compose:|  .split \n---\n
        | defaults :css, $0, :nav, 
            $0, :hero, :blank
        | minidoc :title, :body
        | .mapc .trim
        | .compile defaults:template 
        ")


[target]()

    Title

    button1
    button2

    <some html stuff>
    Now the body.


---


## Syntax Scripts

These are scripts that act on the syntax in the markdown documents being read
in. Just a bit of convenience. 

Each command is recognized by being of the form `CAPS(`. We look for a closing
parentheses, allowing for matched parentheses in the argument. The command,
once found, is called with the interior of the parenthetical and a function
that parses comma separated strings into an array (splits them). It is very
simple and some commands, such as table, may need more complicated parsers. In
the event that the `CAPS(` does not match a name, it is left as is, no warning
issued.
Just closing parentheses for syntax matching `))` We use u0028 for open
parenthesis and u0029 for closing, again because of parenthesis matching. 

[scripting](# ":| eval _':create syntax array' ")

    function (input, args) {
        var syntax = this.parent.syntax;
        var reg = /(?:$|\s)([A-Z]+)\u0028/g;
        var that = {
            parser : _":comma parser",
            replacer : _":slicer",
            props : {
                css: '',
                big : '',
                moderate : '', 
                small : '',
                js : ''
            }
        };
        var replacements = [];
            
        var match, com, command, replace, cargs, end, endofbeg, start = 0,
            parCount, char, strPos;
        var i, n = input.length;
        while ( (match = reg.exec(input) ) !== null) {
            com = match[1];
            start = match.index;
            endofbeg = reg.lastIndex;
            if (syntax.hasOwnProperty(com) ) {
                command = syntax[match[1]];
                _":get end"

We use .call to put the parser and replacer on that object and perhaps other
stuff and preserve the arguments for more argumentative stuff.

                strPos = command.call(that, input, start, endofbeg, end);
                input = strPos[0];
                reg.lastIndex = strPos[1];
            } 
        }
        _"prop use"
        return input;
    }

[syntax](#:scripting "define:")

[get end]()

We look for a closing parenthesis, ignoring any matched pairs of parentheses. 

    end = reg.lastIndex;
    parCount = 1;
    while (end < n) {
        char = input[end];
        if (char === "\u0029") {
            parCount -= 1;
            if (parCount <= 0) {
                break;
            }
        }
        if (char === "\u0028") {
            parCount += 1;
        }
        end += 1;
    }

[comma parser]() 

This takes in the arg string and spits out an array of arguments based on
comma parsing. This is a simple parser in that it does not understand commas
in quotes or groupings, etc. It should work for the most part. 

    function (args) {
        var ret = args.split(",");
        ret.forEach(function (el, ind) {
            ret[ind] = el.trim();
        });
        return ret;
    }

[slicer]()

This takes in a start, end, and a replacement text and slices it into the
text. It returns an array of the text and the new position.

    function (fulltext, start, end, newbit) {
        var str = fulltext.slice(0, start) + newbit + 
            fulltext.slice(end+1);
        var lastIndex = start + newbit.length;
        return [str, lastIndex];
    }


[create syntax array]()

    doc.parent.syntax = {
        FIG : _"figures",
        FADE : _"image fade",
        TABLE : _"syn table",
        CAROUSEL : _"carousel"
    };


#### Prop use

In the functions, their may be css or js that get added, along with css that
is only applicable for different sizes. This is where all of that stuff gets
computed and changed, replacing `/*CSS*/` and `/*JS/`. 

    var props = that.props;
    var css = ''
    var cur = props.css;
    if (cur.length) {
        css += cur.join("\n")+ "\n";
    }
    cur = props.big;
    if (cur.length) {
        css += '_"css::size:big"\n' +
            cur.join("\n") + "\n}\n";
    }
    cur = props.moderate;
    if (cur.length) {
        css += '_"css::size:moderate"\n' +
            cur.join("\n") + "\n}\n";
    }
    cur = props.small;
    if (cur.length) {
        css += '_"css::size:small"\n' +
            cur.join("\n") + "\n}\n";
    }
    if (css) {
        input.replace("/*CSS*/", css + "/*CSS*/");
    }
    cur = props.js;
    if (cur.length) {
        input.replace("/*JS*/", cur.join("\n") + "\n/*JS*/");
    }i
    

### Figures

We also enable the syntax of, on its own line, a figure placement. 

`FIG(filename, caption!alt, link, width, attributes...)`

    function() {}

[old]()

    function (input, start, middle, end) {
        var params, figure ; 
            ...
            _":compute figure html"
        }
        return input;
    }



[compute figure html]()

We need to parse the arguments; we assume the commas are separators. Then we
put together the figure stuff. 

The 1 parameter (2nd) was both caption and alt, but if no caption is needed,
we can use ! as the leading character to have it only for the alt. Also, if
alt is to be different than caption, then we put alt in the 7th place. yikes.
Maybe named positions are good!

    params = input.slice(start+4, end).split(",").map(function (el) {
        return el.trim(); });
    
    if (params[1][0] === "!") {
        params[6] = params[1].slice(1);
        params[1] = '';
    } else {
        params[6] = params[6] || params[1];
    }

    figure = "<figure" + 
         (params[4] ? ' class="'+params[4].replace(".", ' ')+'"' : '' )+  
        (params[3] ? ' style="width:'+ params[3] + ';"' : '') +
        ">\n" +
        ( (params[5] === "top") ? 
            '<figcaption>'+params[1] + '</figcaption>\n' : '') +
        (params[2] ?  '<a href="' + params[2] + '">\n' : '') +
        '<img src="' + params[0] + '" alt="'+params[6]+'"/>\n' + 
        (params[2] ? '</a>\n' : '') +
        ( (params[5] !== "top") ?
            '<figcaption>'+params[1] + '</figcaption>\n'  : '' )+
        '</figure>';
        


## Image Fade

This takes in a list of images or dom elements and creates a fader. Same
syntax as carousel ?  

    function (input, begin, middle, end) {

    }

[other]()

This takes multiple images (or ids, if it starts with #) and fades them from
one to the next.

FADE( time:2, fade-duration:0.3 , img1, img2, #id1, id=great )

So `:` leads to named parameters, here time and fade-duration are the only two
used. `=` will lead to attributes on the element. 

When encountered this will add a bunch of CSS to the css on the page by
replacing the `/*CSS*/` with 


From  http://css3.bradshawenterprises.com/cfimg/ 

For "n" images You must define:
a=presentation time for one image
b=duration for cross fading
Total animation-duration is of course `t=(a+b)*n`

    animation-delay = t/n or = a+b

    Percentage for keyframes:

    0%
    a/t*100%
    (a+b)/t*100% = 1/n*100%
    100%-(b/t*100%)
    100%


This takes that which is stored in gal and first transforms it into html and
css stuff that then gets processed by autoprefixer. We then wrap it up in a
style tag. We are localizing the gallery fading to simply the documents that
use them. 

[imgf](# "compose: imgfade :gal, :hgal, :cgal |  .apply :cgal, postcss,
    autoprefixer | .apply :cgal, wrap, <style>, </style>") 




[imgfad]()

This takes in an object that has a  string of lines whose format is `imgname
Alt text` and generates the html and css to style it as a cross fading image
The first line of the images is the class name of the container along with the
desired duration per image and length of duration of fading.  The args give
the property name of the string of lines and the names of the html and css
keys.

`imgfad gal, hgal, cgal`  for lines

`imgfader 2 0.3` would be first line (equivalent to defaults, leave blank line if
they are fine). could add detection about `.` to differentiate this line. 


    function (input, args, name) {
        var propkey = args[0]; 
        var htmlkey = args[1];
        var csskey = args[2];
        var temp;

        var prop = input[args[0]];
        if (typeof prop !== "string") {
            prop = '';
        }


        prop = prop.split("\n");
        // if empty
        if ( ( prop.length === 1) && (prop[0].trim() === '') ) {
            input[htmlkey] = '';
            input[csskey] = '';
            return input;
        } else if (prop.length === 1) { // just one image
            input[csskey] = '';
            prop = prop[0];
            temp = prop.indexOf(" "); 
            input[htmlkey] = '<figure><img src="' + 
                prop.slice(0, temp) + '" alt="' +
                prop.slice(temp+1) + '"/></figure>';
            return input;
        }
        // not empty!
        var lead = prop.shift().split(" ")
        var cls = lead[0] || "imgfade";
        var aniname =  cls + "";
        //html
        var html = '<div class="' +cls+'"><div class="dummy"></div><ul>\n' +  
            prop.map(function (el) {
                var space = el.indexOf(" ");
                return '    <li><img src="/img/' + 
                    el.slice(0, space) + '" alt="' +
                    el.slice(space + 1) + '"/></li>';
             }).join("\n") + 
             "\n</ul></div>\n";
        input[htmlkey] = html;
        //css
        cls = "." + cls;
        var n = prop.length;
        var a = parseFloat(lead[1] || "2");
        var b = parseFloat(lead[2] || "0.3");
        var t = (a+b)*n;
        var p1 = Math.round(a*100/t);
        var p2 = Math.round( (a+b)*100/t);
        var p3 = Math.round( 100 - (b*100/t) ); 
        var css = "@keyframes " + aniname + " {" +
            "0% { opacity:1; }" +
            p1+ "% {opacity:1;}" +
            p2 + "% {opacity:0;}" +
            p3 + "% {opacity:0;}" +
            "100% { opacity:1;}" +
            "}\n";

        css += cls + " li {\n" +
            "animation-name: " + aniname + ";\n" +
            "animation-timing-function: ease-in-out;\n" +
            "animation-iteration-count: 1;\n" +
            "animation-duration: " + t + "s;\n" +
            "}\n"; 

        var i;
        for (i = 0; i < n; i +=1 ) {
            css += cls + " :nth-child("+ (i+1) + ") {\n" +
                "animation-delay: " +  (t - (i+1)*(a+b) ) + "s;\n" +
                "}\n";
        }
        //css = "<style>\n" + css + "</style>\n";
        input[csskey] = css;


        return input;
    }


[imgfade](# "define:")

#### img fade css

[imgf]() 

    .imgfade {
        margin: 0px auto 10px;
        height:281px;
        width:450px;
        position:relative;
        top:27px;
        box-shadow: 5px 5px 5px #aaa;
        overflow:hidden;
        float:right;
    }

    .imgfade li {
        position: absolute;
        top:-50px;
        left:7px;
        list-style:none;
    }

[small]()

    .imgfade {
        float:none;
        max-width:450px;
    }

A hack from http://ansciath.tumblr.com/post/7347495869/css-aspect-ratio
Basically the dummy element gives the height of the inline-block. There still
seems to be a little border at small sizes. But this seems stable. 


    .imgfade {
        float:none;
        /*display:inline-block;*/
        position: relative;
        max-width:450px;
        height:auto;
        width:100%;
    }

    .dummy {
        margin-top:66.666%
    }

    .imgfade ul {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .imgfade li {
        left:0;
        top:-43px;
    }




### Carousel

This creates a carousel for the pictures. The basic construct is to have a big
picture at top and a strip of smaller elements below it.  

First line is of the form #id of carousel, properties, #id of strip,
properties. Next rows are the content, either a doc to load followed by syntax
for FIG or a piece of DOM that can be pulled in or cloned. Finally, a row that
is just CSS starts the custom CSS to be applied for this. 

Any rule that starts with BIG, MOD, SMALL will get put into a media query of
that type. 

!!! Need to implement

    function(input, start, middle, end) {
        return input;
    }

[example]()
    CAROUSEL( #big, #strip,
    img/jack.jpg, Great to talk with you
    img/jill.jpg, See ya
    #some content:pull/clone
    CSS

    )


#### Carousel JS

This is the carousel code from https://github.com/wecodeio/minimal-carousel

This is very minimal and should suffice. 

    function Carousel(settings){
      'use strict';
      settings = settings || {};
      this.carousel = document.querySelector(settings.carousel || '.carousel');
      this.slides = this.carousel.querySelectorAll('ul li');
      this.delay = settings.delay || 2.5;
      this.autoplay = settings.autoplay === undefined ? true : settings.autoplay;

      this.slides_total = this.slides.length;
      this.current_slide = -1;

      if (this.autoplay) {
        this.play();
      }
    }

    Carousel.prototype.next = function (is_interval_call) {
      'use strict';
      for (var s = 0; s < this.slides.length; s += 1) {
        this.slides[s].style.display = 'none';
      }
      this.current_slide = (this.current_slide + 1) % this.slides.length;
      this.slides[this.current_slide].style.display = 'block';
      if (this.autoplay && this.interval && !is_interval_call) {
        var that = this;
        clearInterval(this.interval);
        this.interval = setTimeout(function () {
          that.play();
        }, this.delay * 1000);
      }
    };

    Carousel.prototype.prev = function () {
      'use strict';
      for (var s = 0; s < this.slides.length; s += 1) {
        this.slides[s].style.display = 'none';
      }
      this.current_slide = Math.abs(this.current_slide - 1 + this.slides.length) % this.slides.length;
      this.slides[this.current_slide].style.display = 'block';
      if (this.autoplay && this.interval) {
        var that = this;
        clearInterval(this.interval);
        this.interval = setTimeout(function () {
          that.play();
        }, this.delay * 1000);
      }
    };

    Carousel.prototype.play = function () {
      'use strict';
      this.next(true);
      var that = this;
      this.autoplay = true;
      this.interval = setTimeout(function () {
        that.play();
      }, this.delay * 1000);
    };

    Carousel.prototype.stop = function () {
      'use strict';
      if (this.interval) {
        this.autoplay = false;
        clearInterval(this.interval);
      }
    };


[js/carousel.js](# "save:")

### Syn Table

This creates an html table from the data. It is of limited use in that
newlines and commas will mess this up. Otherwise, great.

`TABLE( opt1, opt2, ... \n row1col1, row1col2, ... \n row2col1, ...)`

    function (input, start, mid, end) {
        var ret = [];
        var rows = input.slice(mid, end).trim().split("\n");
        rows.forEach( function(el, ind) {
            var arr = el.split(",");
            arr.forEach(function (sel, sind) {
                arr[sind] = sel.trim();   
            });
            rows[ind] = arr;
        });
        options = rows[0];
        rows = rows.slice(1);
        var html = '<table ';
        _":options"
        html += '>' + 
            rows.reduce(function(prev, row) {
                var out = prev + '<tr><td>' + 
                    row.join("</td><td>") +
                    "</td></tr>";
                return out; 
            }, '') + "</table>";
        return this.replacer(input, start, end, html);
    }
      
[options]()

The options setup attributes on the table element.

    var str = '', clss = [];
    options.forEach(function (el, ind) {
        if (el[0] === "#") {
            str += '"id"='+el.slice(1) + ' ';
            return;
        }
        if (el[0] === ".") {
            clss.push(el.slice(1));
            return;
        }
        str += el + ' ';
    });
    str += '"class"=' + clss.join(" ");
    html += str;

[test text](# ":|syntax | equals _':target', syntax table" )

    Great

    TABLE( .borderless, #tabby, .jack, "width"=300px
    Rank, Name, Job
    1, James, web
    8, Ollie, potatoes
    )

    Some stuff

[target]()


    Great
    <table "id"=tabby "width"=300px "class"=borderless jack><tr><td>Rank</td><td>Name</td><td>Job</td></tr><tr><td>1</td><td>James</td><td>web</td></tr><tr><td>8</td><td>Ollie</td><td>potatoes</td></tr></table>

    Some stuff




## Command Line

## Img Reduce

This generates a js file that can be run as `node img.js` It takes files in
the originals directory and puts them in the img direcory with width reduced
to 450px. The arguments can change the in and out directories, respectively.

This only does jpg and the one size. Can be modified, if one likes. 

    var gm = require('gm');
    var fs = require('fs');

    var in = process.argv[2] || "originals";
    var out = process.argv[3] || "build/img";

    var arr = fs.readdirSync(in);
    var done = fs.readdirSync(out);

    arr.forEach(function (file) {
        if (done.indexOf(file) !== -1) {
            console.log("SKIPPING (already done) " + file);
            return;
        }
        if (file.indexOf(".jpg") !== -1) {
            gm(in + '/' + file).
            resize(450).
            noProfile().
            write(out + '/' + file, function (err) {
                if (!err) {
                    console.log('DONE with' + file);
                } else {
                    console.log(err);
                }
            });
        }
    });


## File Copying

To do uni-directional sync of two directories, run `rsync -rtv SRC/ DEST`  It
will create DEST if it does not exist. If you omit the r, it will ignore the
directories. If you omit the / after SRC, then it will copy SRC itself into
DEST rather than the contents of SRC. 

## PDF Thumbnailing

This generates pngs of the first page in the pdfs

Note that it automatically skips nonpdfs since the replacement will do
nothing. Ha. 

    var PDFImage = require("pdf-image").PDFImage;
    var fs = require('fs');

    var in = process.argv[2] || "build/docs";
    var out = process.argv[3] || in;

    var arr = fs.readdirSync(in);

    arr.forEach(function (file) {
        if (arr.indexOf( file.replace(".pdf", "-0.png") ) !== -1) {
            console.log("SKIPPING (already done): " + file);
            return;
        }
        var pdfImage = new PDFImage(out+file);
        pdfImage.convertPage(0);
        console.log("SAVED thumb:" + file);
    });





