# Setup

This is some notes on setting up the server on Digital Ocean. 

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

    var http = require('http');
    var fs = require('fs');
    var cp = require('child_process');
    var path = "/home/server/public/";

    this.server = http.createServer( function( req, res ) {
        var data = "";
        if ( req.method === "POST" ) {
          req.on( "data", function( chunk ) {
            data += chunk;
          });
        }

        req.on( "end", function() {
        	var payload, type, repo;
            try {
              payload = JSON.parse( data);
              type = req.headers['x-github-event'];
              if ( (type !== "push") && (type !== "release") ) {
              	fs.appendFile(path + "badrequest.txt", req.rawHeaders, function() {});
              } else {   
				repo = payload.full_name.replace(/[^a-z-]/g, "-");
              	cp.execFile("./compile.sh", function (err, stdout, stderr) {
                    if (err) {
                      fs.appendFile(path + "errorlog.txt", err, function () {});
                    } else {
                      fs.appendFile(path + "log.txt", "compiled " + repo + 
                          " " + (new Date()).toUTCstring(), function () {});
                      fs.writeFile(path + repo.replace("/", "-") + ".txt", "OUT:\n " + 
                      	stdout + (stderr ? "\nErr:\n" + stderr : ''), 
                        function () {});
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

      }).listen( 8081 );
     
     
Used curl to diagnose

	curl -X POST -d @payload https://do.jostylr.com/webhook --header "Content-Type:application/json" --header "X-GitHub-Event:push" --verbose
    
The payload file was just a payload example from github
      
      
### Compile script

This is what root calls. It basically changes into different users who then do some stuff. 

	
