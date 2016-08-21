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
    su repos -c "chmod +x upload; cp upload ~"
    su repos -c "chmod +x download; cp download ~"
    
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
    sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencry

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

    # HTTP — redirect all traffic to HTTPS
    server {
        listen 80;
        listen [::]:80 default_server ipv6only=on;
        return 301 https://$host$request_uri;
    }

    # HTTPS — proxy all requests to the Node app
    server {
        # Enable HTTP/2
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name do.jostylr.com;

        # Use the Let’s Encrypt certificates
        ssl_certificate /etc/letsencrypt/live/do.jostylr.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/do.jostylr.com/privkey.pem;

        # Include the SSL configuration from cipherli.st
        include snippets/ssl-params.conf;

        location / {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-NginX-Proxy true;
            proxy_pass http://localhost:8080/;
            proxy_ssl_session_reuse off;
            proxy_set_header Host $http_host;
            proxy_cache_bypass $http_upgrade;
            proxy_redirect off;
        }

        location /webhook {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-NginX-Proxy true;
            proxy_pass http://localhost:8081/;
            proxy_ssl_session_reuse off;
            proxy_set_header Host $http_host;
            proxy_cache_bypass $http_upgrade;
            proxy_redirect off;
        } 
    }

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
        var payload, type, repo;
        try {
          payload = JSON.parse( data);
          type = req.headers['x-github-event'];
          if ( (type !== "push") && (type !== "release") ) {
        fs.appendFile(path + "badrequest.txt", req.rawHeaders, function() {});
          } else {   
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
          fs.appendFile(path + "autolog.txt", e+data, function () {});
        }
          res.writeHead( 200, {
              'Content-type': 'text/html'
          });

      res.end("<html><body><p>hook data received</p></body></html>", function () {});
    });

    }).listen( 8081 );
         
      
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

    
    chown -RP repos $1
    echo "download phase"
    su -s /bin/bash -l repos -c "cd $1; git pull; ~/download"
    echo "compile phase"
    chown -RP lpuser $1
    su -s /bin/bash -l lpuser -c "cd $1; run"
    echo "upload phase"
    chown -RP repos $1
    su -s /bin/bash -l repos -c "cd $1; ~/upload $1 $2"
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

    console.log("downlodaed");
    console.error("couldn't find");
   


### upload

This is the upload script. It is very simple, relying on sync commands called in another file, namely in user-repo-push|release.sh in the directory repos/uploads  This is manually maintained and not in a repo as it has secure access and possibly secure information. 

    #!/usr/bin/env nodejs
    _":script | jshint"

[script]() 
    
    console.log("uploaded ", process.argv[2]);
    console.error("failed to upload");

#### Setting up rsync

To set up rsync,  you need to create a key pair for repos:  `ssh-keygen -t rsa` in repos home directory. 

Then use `ssh-copy-id -i ~/.ssh/id_rsa.pub username@remote_host`

After that, you can use an rsync command like `rsync -rtv --exclude .git  --exclude .checkum . user@remote`  

The upload will execute it in the build directory. Replace the . with a subdir if desired


#### Setting up amazon sync

Pretty similar. First install the tool

	sudo apt-get install python-pip
    sudo pip install awscli
   
You can then do sync using  
   


### run

Executes litpro if no run scripts are involved. just passes along stdout and stderr

The convention is `run-#-pub.sh` or `run-#-priv.sh` where the `#` gives the order in which it is to be run; it should be a non-negative integer and distinct. The `pub` or `priv` shows whether the log and errors should be reported or not; priv means no browser reporting done. 


    #!/usr/bin/env nodejs
    _":script | jshint"

[script]() 
    
    var fs = require('fs');
    var cp = require('child_process');
    var exec;
    
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
        cp.execFile("./"+file, function (err, stdout, stderr) {
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


    cp.exec("litpro -s . -b . setup.md; npm install; litpro", function (err, stdout, stderr) {
        console.log(stdout);
        console.error(stderr);
        fs.writeFile("litpro.log", "LOG:\n" + stdout + "ERROR:\n" + stderr, 
            function () {});
    });

npm install does run scripts which could be dangerous. It is important to
inspect the scripts carefully but lpuser running these should limit their damage
to the repo under consideration.


### NPM update

https://www.npmjs.com/package/npm-check-updates

This a simple tool for checking update status of packages. 
