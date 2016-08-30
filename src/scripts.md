# Setup

This is the server-side of processing it all. It creates a bunch of nodejs scripts and shell scripts that can then be distributed as needed. 


## Script Dispersal

Here we setup the scripts and where they go. This section produces a shell script that copies the files to various places in the system. Use it with `pushd /home/repos/jostylr/write-web/build; chmod +x disperse.sh; ./disperse.sh; popd`

    chmod +x githook.js
    cp githook.js ~/serving/githook.js
    pm2 restart githook
    chmod +x compile.sh
    cp compile.sh ~/serving/compile.sh
    chmod +x run
    cp run /usr/local/bin/run
    chmod +x upload
    cp upload /usr/local/bin/upload
    chmod +x download
    cp download /usr/local/bin/download
    
Less likely to change and more sensitive is the nginx file. It can be updated by `cp default /etc/nginx/sites-enabled` Need to learn more about nginx's workings.
    
    
---    
    
 * [disperse.sh](# "save:")
 * [githook.js](#githook-server "save: ")
 * [compile.sh](#compile-script "save:")
 * [run](#run "save: ")
 * [upload](#upload "save:")
 * [download](#download "save:")



## DO notes

This is some notes on setting up the server on Digital Ocean. This could become 

Follow the steps at https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04
Uses keys for ssh, sets up user, disables password login, sets up firewall

Up to date Git:  https://launchpad.net/~git-core/+archive/ubuntu/ppa

    sudo add-apt-repository ppa:git-core/ppa
    sudo apt-get update

Also added latex for litpro compiling tex (1GB vs 4GB for texlive-full)

    sudo apt-get texlive
    
Also pandoc (Small) and maybe even sage (large), depending. 

    sudo -E apt-add-repository -y ppa:aims/sagemath
    sudo -E apt-get update
    sudo -E apt-get install sagemath-upstream-binary

Node setup https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

Also very similar to these is https://code.lengstorf.com/deploy-nodejs-ssl-digitalocean/ which also goes into Let's Encrypt setup

Up to date Nodejs: 
    
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

Let's Encrypt:

    # Install tools that Let’s Encrypt requires
    sudo apt-get install bc

    # Clone the Let’s Encrypt repository to your server
    sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt

    # Move into the Let’s Encrypt directory
    cd /opt/letsencrypt

    # Create the SSL certificate
    ./letsencrypt-auto certonly --standalone

And do renewals: 

    sudo crontab -e

    00 1 * * 1 /opt/letsencrypt/letsencrypt-auto renew >> /var/log/letsencrypt-renewal.log
    30 1 * * 1 /bin/systemctl reload nginx

Install nginx, create sites, getting rid of default

To put back or understand:

    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default


Some security mumbo-jumbo

    sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
 
and then

    sudo nano /etc/nginx/snippets/ssl-params.conf
    
with 

    # See https://cipherli.st/ for details on this configuration
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_ecdh_curve secp384r1; # Requires nginx >= 1.1.0
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off; # Requires nginx >= 1.5.9
    ssl_stapling on; # Requires nginx >= 1.3.7
    ssl_stapling_verify on; # Requires nginx => 1.3.7
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Add our strong Diffie-Hellman group
    ssl_dhparam /etc/ssl/certs/dhparam.pem;


Default setup. The idea is that we will have a static webserver on port 8080

## Nginx 

This is the nginx file. 

    # HTTP — redirect all traffic to HTTPS
    server {
        listen 80;
        listen [::]:80 default_server ipv6only=on;
        return 301 https://$host$request_uri;
    }
    
    _":do"
    
    _":save"
    
    _":editor"
    
    _":test"
    
    
[default](# "save:")
    
[do]()

This is the main server for compiling automatically. The /webhook implements the compiling. The main index is how to access the logs. /run allows for the running of predefined commands, such as running a test server for one of the apps. 

    # HTTPS — proxy all requests to the Node app
    server {
        
        _":ssl | sub DOMAIN, do.jostylr.com"
        
        root /root/public
        
        _":location | sub URL, /webhook, PORT, 8081"
        
        _":location | sub URL, /debug, PORT, 8080"
    }


[save]()

This runs a server that allows file uploads. We need to set the body size allowed. 20M here; no video files. Based on http://cnedelcu.blogspot.com/2013/09/nginx-error-413-request-entity-too-large.html

    server {
		 
        client_max_body_size 20M;
        
        _":ssl | sub DOMAIN, save.jostylr.com"
        
        _":location | sub URL, /, PORT, 8082"
        
    }


[editor]()

This runs a server that allows editing of the github repos with possible compiling. 

    server {
		
        _":ssl | sub DOMAIN, editor.jostylr.com"
        
        _":location | sub URL, /, PORT, 8083"
        
    }

[test]()

This allows one to run a test server in one of those 

    server {
		
        _":ssl | sub DOMAIN, test.jostylr.com"
        
        _":location | sub URL, /, PORT, 8084"
        
    }

[ssl]()

The ssl skeleton portion

    # Enable HTTP/2
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name DOMAIN;

    # Use the Let’s Encrypt certificates
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;

    # Include the SSL configuration from cipherli.st
    include snippets/ssl-params.conf;


[location]()

The location skeleton

    location URL {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://localhost:PORT/;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }


[instructions]()

Load in pm2 and http-server usind `sudo npm install -g ...`

Run http-server for main static content. Seems the https is done by nginx, not node here so that's nice. 

Install githook server on 8081

### Githook server

This will execute every time the webhook is triggered. We act on push events (compile, send to test) and release (compile, send to production). 

    #!/usr/bin/env nodejs
    _":script | jshint"

[script]() 

    var http = require('http');
    var fs = require('fs');
    var cp = require('child_process');
    var path = "/root/public/";

    this.server = http.createServer( function( req, res ) {
    var data = "";
    if ( req.method === "POST" ) {
      req.on( "data", function( chunk ) {
        data += chunk;
      });
    } else {
      data = {};
    }


    req.on( "end", function() {
        var payload, type, repo, match;
        try {
          payload = JSON.parse( data);
          type = req.headers['x-github-event'];
          if ( (type !== "push") && (type !== "release") ) {
        fs.appendFile(path + "badrequest.txt", req.rawHeaders, function() {});
          } else {   
             _":flag type"
             repo = payload.repository.full_name.replace(/[^a-z\/-]/g, "-");
             cp.execFile("./compile.sh", ["/home/repos/" + repo, type], function (err, stdout, stderr) {
                 if (err) {
                    fs.appendFile(path + "errorlog.txt", err, function () {});
                  } else {
                    fs.appendFile(path + "log.txt", "compiled " + repo + 
                        " " + (new Date()).toUTCString()+"\n", function () {});
                     fs.writeFile(path + repo.replace("/", "-") + ".txt", "OUT:\n " + 
                        stdout + (stderr ? "\nErr:\n" + stderr : ''), 
                        function () {});
                  }
             });
          }
        } catch (e) {
          fs.appendFile(path + "autolog.txt", "\n" + e+ "\n\n" + data + "\n----\n", function () {});
        }
          res.writeHead( 200, {
              'Content-type': 'text/html'
          });

      res.end("<html><body><p>hook data received</p></body></html>", function () {});
    });

    }).listen( 8081 );
         
      
[flag type]()

If a commit has the syntax `:flagname` (code quotes included) then that gets added to the type. Multiple colons allowed for multiple flags. A flag should be letters, numbers, and dashes.

          if (type === "push") {
              if (payload.hasOwnProperty("head_commit") ) {
                match = payload.head_commit.message.match(/\`\:((?:[A-Za-z0-9][A-Za-z0-9-]*\:?)+)\`/);
                if (match) {
                    type += ":" + match[1];
                }
              }
          }

      
### Manual trigger

    curl -X POST -d '{ "repository" : { "full_name": "owner/repository"}}' https://do.jostylr.com/webhook --header "Content-Type:application/json" --header "X-GitHub-Event:push" --verbose
    
where the owner/repository should be replaced. 

    curl -X POST -d '{ "repository" : { "full_name": "jostylr/write-web"}}' https://do.jostylr.com/webhook --header "Content-Type:application/json" --header "X-GitHub-Event:push" --verbose

Or 

    curl -X POST -d '{ "repository" : { "full_name": "jostylr/write-web"}}' https://do.jostylr.com/webhook --header "Content-Type:application/json" --header "X-GitHub-Event:release" --verbose
      
      
### Compile script

This is what root calls. It basically changes into different users who then do some stuff. 

The repos user has network access. It pulls in the repository, installs npm modules, and downloads stuff. All of this is managed.

Then we switch to user litpro. This has no network access. It runs litpro typically unless there is the presence of scripts of the form run-i-pub/priv.sh  So a node process runs each of them and if pub is in place, them it becomes public. 

    echo "repo $1 type-flag $2"
    chown -RP repos $1
    echo "download phase"
    su -s /bin/bash -l repos -c "cd $1; git pull; download"
    echo "compile phase"
    chown -RP lpuser $1
    su -s /bin/bash -l lpuser -c "cd $1; run $2"
    echo "upload phase"
    chown -RP repos $1
    su -s /bin/bash -l repos -c "cd $1; upload $1 $2"
    echo "done"


Maybe put the run script in usr/local/bin; the other two can be in repos homedir. All should start with `#!/usr/bin/env nodejs` and be chmod +x  to become executables.


### Setting up the users

We want two users. The first is repos. This is a fairly normal user, ideally as secure as all of our users. This will handle network needs, such as git pull, downloading and uploading. What it can do is strictly controlled; no user code is run. 

The other user is lpuser. The only directory it can see should be the repo directory being compiled at the time. While some effort of restriction is made here, this is not robust against threat actors. Make sure git repos are secure. In particular, while there can be secret stuff that is not in the repo, it can be accessed by the litpro program that could be run. So some level of trust is needed. One should assume that secret stuff is just dark, not actually securely hidden.

    sudo adduser --disabled-password repos
    sudo adduser --disabled-password lpuser
    

Note lpuser not having network access could be a good idea, but that requires some iptables which means switching from ufw to iptables or something. ugh. Also, not sure how useful it is. Have to think about it. 

For lpuser to run npm install, it needs a home directory. Not sure why, but that is the way it seems to be. 
    
### download

This needs to parse various download files 

    #!/usr/bin/env nodejs
    _":script | jshint"

[script]() 

To meet the immediate need, we will create an s3 bucket with the files of interest. For now we will sync them, both to put them there and to get them out, but in the future, we will create a file uploader to the s3 bucket that will upload the files, backing up any ones that are redundant. The s3 bucket will be writeable by such a thing, but only readable by authorized user. So it is a drop-off, but not a pick-up.

    var cp = require('child_process');
    
    var fullPath = process.argv[2];
    repo = fullPath.split('/');
    repo = repo[repo.length - 1] || 'null';
    var com = 'cd ' + fullPath + '/downloads; aws s3 sync s3://' + repo + ' .';
    cp.exec(com, function (err, stdout, stderr) {
         if (err) {
            console.error('Error in processing ' + com, err);
         } else {
            console.log('Processed ' + com, stdout, (stderr ? ('error: ' + stderr) : '' ));
         }
    });
    
    
Still need to create page to save, maybe part of the editor functionality, `s3/repo-name` with a get giving the form and a post putting the object. No need for authorization as the storage is useless without access to server and/or repo.    


### upload

This is the upload script. It is very simple, relying on sync commands called in another file, namely in user-repo-push|release.sh in the directory repos/uploads  This is manually maintained and not in a repo as it has secure access and possibly secure information. 

    #!/usr/bin/env nodejs
    _":script | jshint"

[script]() 
    
This will separate the instruction file, in the instructions directory of the repos home. The format has the type name in one line, the next is public or private (logging issues, private means no logs recorded at the moment), and then a series of commands. The type will be based on a matching system, removing colons, one at a time.
    
    var fs = require('fs');
    var cp = require('child_process');
    
    var repo = process.argv[2];
    //should just be one slash after removing hardcoded front path
    var upfile = repo.replace('/home/repos/', '').replace("/", "-")+".txt"; 
    var type = process.argv[3];
    
    var inst = fs.readFileSync('/home/repos/instructions/' + upfile, {encoding:'utf8'});
    var parts = inst.split("\n---\n");
    var actions = {};
    parts.forEach(function (el) {
        var lines = el.split("\n");
        var name = lines.shift();
        actions[name] = lines;
    });
    
    var act = _":act";
    
    while (type) {
    	if (actions.hasOwnProperty(type) ) {
            act(actions[type].shift(), actions[type]);
            break;
        } else {
            //gets rid of end colon separated bit
            type = type.split(":");
            type.pop();
            type = type.join(":");
        }
    }
    if (type === '') {
        console.log("no instructions found for " + process.argv[3]);
    }

[act]()


     function (log, actor) {
            cp.exec(actor.join(";"), function (err, stdout, stderr) {
                if (log === "public") {
                    var label = repo + " type: " + type + "\n";
                    if (err) {
                    	console.error("Failure in " + label, err);
                    }
                    console.log("uploading for " + label, stdout);
                    if (stderr) {
                    	console.log("Error in " + label, stderr);
                    }
                } 
            });
     }

#### Setting up rsync

To set up rsync,  you need to create a key pair for repos:  `ssh-keygen -t rsa` in repos home directory. 

Then use `ssh-copy-id -i ~/.ssh/id_rsa.pub username@remote_host`

After that, you can use an rsync command like `rsync -rtv --exclude .git  --exclude .checkum . user@remote:dir`  

The upload will execute it in the build directory. Replace the . with a subdir if desired


#### Setting up amazon sync

Pretty similar. First install the tool

	sudo apt-get install python-pip
    sudo pip install awscli
   
You can then do sync using, for example,  `aws aws s3 sync /home/repos/jostylr/learnjs/build s3://learnjs.jostylr.com --exclude .checksum --acl public-read`
   

### run

Executes litpro if no run scripts are involved. just passes along stdout and stderr

The convention is `run-#-pub.sh` or `run-#-priv.sh` where the `#` gives the order in which it is to be run; it should be a non-negative integer and distinct. The `pub` or `priv` shows whether the log and errors should be reported or not; priv means no browser reporting done. 


    #!/usr/bin/env nodejs
    _":script | jshint"

[script]() 
    
    var fs = require('fs');
    var cp = require('child_process');
    var exec;
    var type = process.argv[2];
    
    // for doing the next run
    // do not stop for errors. this is questionable
    var next = _":next";
    
    fs.readdir(".", function (err, files) {
       _":check for custom run"
      if (exec.length) {
        next(exec, 0);   
      } else {
          _":default"
      } 
    });




[check for custom run]()

This is where we can run our custom commands. The default is 

    exec = [];
    files.forEach(function (file) {
      var m = file.match(/run\-(\d+)\-(pub|priv)\.sh/);
      if (m) {
        exec[m[1]] = [m[0], m[2]];
      }
    });
    exec = exec.filter(function (el) {return el;}); // no gaps

[next]()

This executes through the different run commands. 

    function (arr, i) {
        var file = arr[i][0];
        cp.execFile("./"+file, [type], function (err, stdout, stderr) {
            console.log("running " + file);
            if (err) {
                console.error("Failed to run", err);
            }
            if (arr[i][1] === "pub") {
                console.log(stdout);
                if(stderr) {
                    console.error(file, stderr);
                }
            }
            fs.writeFile(file.replace(".sh", ".log"), "LOG:\n" + stdout + "ERROR:\n" + stderr, 
                function () {});
           	if ( arr.length > (i+1) ) {
            	next(arr, i+1);
            }
        });
    
    }

[default]()

The default takes the approach that there is a setup.md file which installs the
basic running components (package.json for npm install, lprc.js for custom
running of litpro). So we run `litpro -s . -b . setup.md` to run the setup.md
literate programming and src it to this directory and the build as well. Then we
npm install and finish off with the litpro run. 

    _":flags"
    cp.exec("litpro -s . -b . setup.md; npm install; litpro" + flags, 
      function (err, stdout, stderr) {
        console.log(stdout);
        console.error(stderr);
        fs.writeFile("litpro.log", "LOG:\n" + stdout + "ERROR:\n" + stderr, 
            function () {});
    });

npm install does run scripts which could be dangerous. It is important to
inspect the scripts carefully but lpuser running these should limit their damage
to the repo under consideration.

[flags]()

This creates flags that get passed along to the litpro. The plain push flag has no flag associated with it, the release type gets passed in as a flag of release, and if a type has `push:flagname` then a flag of `flagname` is pushed in. There can be multiple colons. A release, if it is being used is just a single flag, no commit processing. There is no processing of the type for the custom run. That is on those files to do. 

    var flags;
    if (type === "release") {
        flags = " --flag release";
    } else {
        flags = type.split(":");
        flags.shift(); //shift gets rid of push
        if (flags.length) {
            flags = " --flag " + flags.join(" --flag ");
        } else {
            flags = "";
        }
    }


### NPM update

https://www.npmjs.com/package/npm-check-updates

This a simple tool for checking update status of packages.
