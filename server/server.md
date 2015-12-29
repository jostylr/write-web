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
    npm install --ignore-scripts
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

## Instructions

To use this system, we follow the following conventions:

1. litpro compiles the project
2. lprc.js should have all the needed info for proper compiling
3. the build directory should be the default of litpro
4. for git pulling, we need a branch and that will be what is checkedout for
   the build directory
5. for sftp or s3 transfer, we need the access credentials. The credentials
   are not saved.    


## DO Writeweb

Decided to run the webserver as root. Ouch, I know. But it might be more
secure as I need root to do a bunch of stuff anyway. 

So it runs the server. When a request comes in, it runs different scripts
depending on the need. These scripts run as different users. The main script
will go from writeweb to npm# to lit# and back to writeweb. This pulls in
recent changes, runs npm install, runs litpro, and then pushes or sftps the
changes. 

Other scripts and tasks involve first cloning the repository, maybe saving
hidden data. Get .checksum to start and then compare to end to know what to
push in the case of sftp. This also tells what to delete. Good to .gitignore
.checksum




Use for cleaning before pulling? `git checkout -- .`






This is my setup for running the automation of the compilation of literate
programs from repositories. I run it on a ubuntu instance from digital ocean. 

The idea is that we use multiple users. writeweb is the main user that runs
the webserver and masquerades as other users. The writeweb user runs the webserver and does the git pulling. One
generic will do the npm installing; it should be safe with ignore-scripts, but
just to be double safe. Then another generic user, perhaps multiple ones for
scaling, will do the literate programming compiling. To facilitate this, we
chown the relevant directory to the generic user that needs it, run the
command as that user, and 




sudo iptables -A OUTPUT -p all -m owner --uid-owner username -j DROP



### DO Instructions

There are a number of things to do when setting up a droplet.

    1. Create droplet with ssh-key for easy root access; remove the password
       login to secure it. 
    2. Install node: https://github.com/nodesource/distributions 
        Add their ppa, do apt-get install node
    3. Install git:  apt-get install git
    4. Create users: writeweb, npm1-5, lit1-5
        `useradd -options username` 
        with -M saying no to home directory creation, -N
        says no to being a part of a group, 
        --quiet,  --disabled-password
    5. Set up iptables: 
        this prevents network access to the lit group (put them all in the lit
        group) The npm group needs net access.
       sudo iptables -A OUTPUT -p all -m owner --gid-owner lit -j DROP
       http://askubuntu.com/questions/102005/disable-networking-for-specific-users
        You also want to use iptables to reroute port 80


As an option use iptables-save to save your current rules and restore them on boot.

Save the current iptables rules

sudo iptables-save > /etc/iptables_rules
Open /etc/rc.local with your favorite text editor and at the end of the file add

/sbin/iptables-restore < /etc/iptables_rules
That will restore the saved rules on each boot.


ssl: 

openssl genrsa -out server-key.pem 1024
openssl req -new -key server-key.pem -out server-csr.pem
openssl x509 -req -in server-csr.pem -signkey server-key.pem -out server-cert.pem
Then use them in node.js

var https = require('https');
https.createServer({
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem')
},
function (req,res) {
      ... 
})

also https://github.com/digitalbazaar/forge#x509


### Root Shell Script

This is the shell script that is called by the server run by root, listening
for commands from the webserver. 

Arg1 is repo, arg2 is npm, arg3 is lit

    
    chown -RP $2 $1
    su -s /bin/bash -c "cd $1; npm install --ignore-scripts"
    chown -RP $3 $1
    su -s /bin/bash -c "cd $1; litpro"
    chown -RP writeweb:writeweb $1


http://apple.stackexchange.com/questions/82438/allow-sudo-to-another-user-without-password

user1    ALL=(user2) NOPASSWD: /bin/bash

http://superuser.com/questions/514922/how-to-make-a-non-root-user-to-use-chown-for-any-user-group-files

nfigured /etc/sudoers file.

If you want bob to be able to change the permissions and owners on the files of users fred, joe and sara, put this in your sudoers file. With this line, bob will need to use e.g. sudo -u fred chmod ... to change the permissions on fred's files.

Runas_Alias  USERS = fred, joe, sara
bob          ALL = (USERS): /bin/chmod, /bin/chown


SSL stuff

http://stackoverflow.com/questions/16533341/https-redirect-from-root-domain-i-e-apex-or-naked-to-www-subdomain-withou


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


