# Server 

This is a literate program that creates a variety of little scripts that are
used to automate the setup. 

We have two different servers. There is one that hosts the test and final
version of the website. This website will host a test/update page that when
the button is pressed, it contacts another server (could be the same one),
that then pulls in the repo, runs litpro, and pushed the ghpage. 

Once that process is done, then the destination server pulls in the ghpage.
The next step is to then pull in any other resources. And then we're done.

## Compiler Server

This takes in a request with a username/repo as the text. It then executes a
script that does the compiling. 

* [compile.sh](#shell-script "save:")
* [server.js](#simple-server "save:")

### Shell Script

This is a simple script that expects to change into a directory from the first
argument and then does some git pulling, compiling, and pushing. This is the
workhorse of the compile phase. 

    #! /bin/bash 
    cd $1
    git pull
    cd output
    git pull 
    cd ..
    npm install
    node ./node_modules/.bin/litpro
    cd output
    git add .
    git commit -m "auto transform"
    git push
    cd ..
    cd ..

### Simple Server

This is the simple server that gets called to do the compiling. 

The sane reg removes any unsafe characters. We also have the CORS thing to
allow cross origin stuff. We are using fs.access to test for directory
existence/access before calling the shell script. 

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
                            res.end("Success:" + output, 200);
                        }
                    });
                }
            });
        }
    }).listen( 8070 );

### Githook server

If you want this to be used for every commit, you can start with the following
script. Not currently being used. 

    var http = require('http');
    var fs = require('fs');
    var cp = require('child_process');

    this.server = http.createServer( function( req, res ) {
        var data = "";
        if ( req.method === "POST" ) {
          req.on( "data", function( chunk ) {
            data += chunk;
          });
        }

        req.on( "end", function() {
            try {
              var payload = JSON.parse( data);
              if (payload.ref === "refs/heads/master") {
                cp.execFile("./hook.sh", function (err, output) {
                    if (err) {
                      fs.appendFile("autolog.txt", err, function () {});
                    } else {
                    }

                });
              } 
            } catch (e) {
              fs.appendFile("../autolog.txt", e+data, function () {});
            }
              res.writeHead( 200, {
                'Content-type': 'text/html'
              });

          res.end();
        });

      }).listen( 8080 );



## Destination Server

On the destination server, we need an html page that is our command and
control script for testing and for pushing live. 

The test one will first do ajax to the destination server to get
compiling working. This happens upon immediate loading. When done, a message
on the page says so. 

The live script does not do this; it will assume this step has been done for
the version we care about (test first!). 

So both then use ajax to do a php call to git pull the appropriate branch
(gh-pages).

Upon success, it reports back and gets another call to fetch the resources.
The resources are fetched by wget after the resources.txt page is read in by
php. 

When all is done, an iframe is loaded of the test along with a direct link. 

You should put .php in the .gitignore file for your output repository to have
these files and not in your repository.


* [test.php](#test-page "save:")
* [live.php](#live-page "save:")
* [pull.php](#git-pull:server "save:")
* [load.php](#load-resources:server "save:")

### Calling compiler

This calls the server that does the compiling. 

Put the github username/project/ in userproj.txt  


    <?php
    echo "var url = 'auto.jostylr.com/$userproj'";
    ?>

    var call = function () {
        ajax(url, function (text) {
            $("#compile").innerHTML = 
                "<p>Compiling is done</p><pre>" + text + "</pre>";
            pull();
        });
    };
    


### git pull

[page]()

    var pull = function () {
        ajax("pull.php", function (text) {
            $("#pull").innerHTML = 
                "<p>Pull is done.</p><pre>" + text + "</pre>";
            load();
        }); 
    };

[server]()

    <?php
    echo exec("git pull"); 
    ?>

### Load resources

This loads any links whose files are not known downloaded yet. It returns
diagnostic information and loads an iframe that has the index page on it. 

[page]()

    var load = function () {
        ajax("load.php", function (text) {
            $("#load").innerHTML = 
                "<p>Resource loading is done.</p>" + text;
         });
    };


[server]()

    <?php
    $res = file_get_contents('resources.txt');
    $lines = explode(PHP_EOL, $res);
    $n = count($lines);
    $loaded = '<ul class="loaded">';
    $untouched = '<ul class="untouched">';
    for ($i = 0; $i < $n; $i += 2) {
        $href = escapeshellarg($lines[$i]);
        $file = escapeshellarg($lines[$i + 1]);
        if (file_exists($file) ) {
            $untouched .= '<li>$file</li>';
            array_push($untouched, $file);
        } else {
            unset($output);
            exec("wget $href -O $file", $output);
            $out = implode(PHP_EOL, $output);
            $loaded .= "<li>$file loaded from $href: $out </li>";
            array_push($loaded, $file, $output);
        }
    } 
    echo "$loaded </ul> $untouched </ul>";
    echo '<iframe src="index.html"></iframe>';
    ?>


### Test page

The php test page

    <html>
        <head>
            <?php
                $userproj = file_get_contents("userproj.txt");
            ?>
            <script>
                _"common script"
                _"calling compiler"
                _"git pull:page"
                _"load resources:page"
            </script>
        </head>
        <body>
            <p> This page is compiling and updating the test page for 
            <?php echo $userproj ?> </p>
            <div id="compile"></div>
            <div id="pull"></div>
            <div id="load"></div>


        </body>
    </html>


### Live page 

    <html>
        <head>
            <?php
                $userproj = file_get_contents("userproj.txt");
            ?>
            <script>
                _"common script"
                _"git pull:page"
                _"load resources:page"
            </script>
        </head>
        <body>
            <p> This page is updating the page for 
            <?php echo $userproj ?> </p>
           
            <div id="pull"></div>
            <div id="load"></div>


        </body>
    </html>


### Common script

Here we alias to get the $ for qs, and we define an ajax function. 

    var $ = document.querySelector;

    var ajax = function (url, cb) {
        var req = new XMLHttpRequest();
        req.onreadystatechange =  function () {
            if req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    cb(req.responseText);
                } else {
                   cb("ERROR in Status" + req.responseText);  
                }
            }
        };
        req.open('GET', url);
        req.send();
    };


