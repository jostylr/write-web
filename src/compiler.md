# [compiler](# "version: 0.1.0; compiling litpro programs remotely")

This is the literate programming that creates all the server parts on the side
doing the compiling and possibly uploading. There are other litpro for the
template on the user side and for the php setup up on the user side if that
option is being used. 

Files stored in the compiler directory go under root. 

* [compiler/server.js](#server "save:|jshint") This is the main server
* [compiler/package.json](#npm-package "save:|jshint") This is the json package for installing the server's dependencies
* [compiler/compiler.sh](#compile-shell-script "save:") This is the shell script for doing the compiling. It is common to all pathways.


These are scripts that are run as the fileuser. 

* [fileuser/resourceLoading.js](#resource-loading "save:|jshint") This loads
  the images and so forth that should not be in a repo.
* [fileuser/gitpush.sh](#post-compile:git-push "save:") This is the script that
  does the git pushing. 
* [fileuser/rsync-ssh.sh](#post-compile:rsync-ssh "save:") This is the script
  to sync using ssh access. Requires the public key from fileuser to be on
  target system.
* [fileuser/rsync-pwd.sh](#post-compile:rsync-pwd "save:") syncing using a
  password access.
* [fileuser/amazone-s3.sh](#post-compile:amazon-s3 "save:") syncing using
  amazon s3 credentials to s3 bucket 
* [fileuser/s3Transfer.js](#s3-transfer "save:|jshint") This transfers the
  data to amazon s3. 


Some values to reference:

* [fileuser](# "store: writeweb") This is the user that "owns" the directories and
  does the git pushing and pulling.
* [usergroup](# "store: writeweb") This is that user's group.


## Server

This is the main server code

    /*global require, __dirname*/ 

    var express = require('express');
    var forceSSL = require('express-force-ssl');
    var fs = require('fs');
    var http = require('http');
    var https = require('https');
    var bodyParser = require('body-parser');

    _":about ssl"

    var app = express();
    var server = http.createServer(app);
    var secureServer = https.createServer(ssl_options, app);
    
    _":redirect"

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(forceSSL);

    _":params"
    
    _":routes"

    //static hosting
    app.use(express.static(__dirname + "/public"));
     
    secureServer.listen(443);
    server.listen(80);

[params]()

We act on a variety of parameters from the url. 

    app.param("gituser", _"check gituser");
    app.param("repo", 
        _"check initialize repo directory",
        _"check authroization needed");
    app.param("from", _"set the branch in the repo");
    app.parm("dest", _"get destination");
    app.param("s3user", _"get s3 user");


need a system for being authorized for passwordless rsync -- something like a
file to be read from the destination that gives the repo, from, and allowed
destinations and what writeweb users are authorized (if present, they need to
login). Related would be ww users needing to be logged in to compile, etc.
package.json on the ma

[routes]()

These are the routes that actually lead to action. 

    app.get("g/:user/:repo/:from/:to", _"git push compile");
    app.get("r/:user/:repo/:from/:dest", _"rsync compile");
    app.post("r/:user/:repo/:from", 
        _"rsync credentials", 
        _"rsync compile");
    app.get("s3/:user/:repo/:from/:s3user/:bucket", _"s3 compile");
    app.post("s3/:user/:repo/:from", 
        _"s3 credentials",
        _"s3 compile");
    app.get("edit/:user/:repo/:from", _"load directory");
    app.post("edit/:user/:repo/:from", _"save files");
    app.post("login", _"login");



[junk]()

Routers do mount points

    var gitR = express.Router();
    
    _"git push compile"

    var rsyncR =express.Router();

    _"rsync compile"

    var s3R = express.Router();

    _"s3 compile"

    var editR = express.Router();

    _"edit compile"

    app.use("/g", gitR);
    app.use("/r", rsyncR);
    app.use("/s3", s3R);
    app.use("/edit", editR);

    app.post("/login", _"login"); //this is a login as a user



[about ssl]()

To create SSL, for future reference, did

1. `openssl genrsa -out www-key.pem 2048`
2. `openssl req -new -sha256 -key www-key.pem -out writeweb-csr.pem`
3. The CSR asks for info. You can ignore the extra options. The FQDN is the
   full host name, here www.writeweb.net
4. Went to namecheap and got a $9/yr cert. Pretty painless. Used the email
   validation since my server was not setup yet (cause I wanted the cert ...)
5. They gave the .crt and .ca-bundle files while the private key was generated
   in the first step. 


    var ssl_options = {
      key: fs.readFileSync('../keys/www-key.pem'),
      cert: fs.readFileSync('../keys/www_writeweb_net.crt'),
      ca: fs.readFileSync('../keys/www_writeweb_net.ca-bundle')
    };
     
[redirect]()

Simple redirecting, from https://groups.google.com/forum/#!topic/nodejs/z3kJjdPtGlE 

    app.use(function(req, res, next) { 
        if (req.hostname === 'writeweb.net') { 
            return res.redirect(301, "https://www.writeweb.net"+req.url);
        }
        next();
    }); 



### Params

Common 


### git push compile

A get for compiling is of the form /g/user/repo/frombranch/tobranch

init makes sure the repo is in place. It sets the frombranch and pulls it, but
it does not set 

In the package.json file in writeweb field, under build, you can have
"from:to": and specify build options. this will read that. 

    app.get("/:user/:repo/:from/:to", function (req, res, next) {
        
    });

### rsync compile

### s3 compile

### edit compile

### login

This takes in the login form and processes it. It could be creating a login as
well. 


## old git

This does a litpro after pulling in the frombranch and setting up the tobranch
in build, which it then pushes. 

So `https://www.writeweb.net/g/jostylr/mwia/master/gh-pages` would transform the
master branch into the gh-pages branch.

    


[init]()

This needs to figure if the repository is already loaded and, if not, load it.
We'll keep a list of known repositories and allowed users in memory, appending
the record files as needed. 

    function (user, repo) {
        _":check repo existence"
        _":check folder existence"

        if (!folderExist) {
            exec("root", "initialize.sh", [user, repo], );
        } else {
            
        }



### post for other

Other uses for posting:

1. Login. So we could have a password with verification word in package.json
   along with user and email associated with it. 
2. This would then permit one to edit secrets and the repo directly. 
3. Potentially we could also directly edit the files in the repo, using code
   mirror. Tricky bit is the commit would be from writeweb.  But see: 
   http://stackoverflow.com/questions/19840921/override-configured-user-for-a-single-git-commit  and particularly `git -c user.email=email@domain.fr -c user.name='Your Name'`  Point out https://help.github.com/articles/keeping-your-email-address-private/



### Syncing

Want to support usual file syncing.

    rsync -rtv src user@target:dir 
  
Also use https://www.npmjs.com/package/s3  for s3 directory syncing 

For resources, need to check download: http://stackoverflow.com/questions/25080121/node-js-and-request-limiting-the-file-size-of-downloaded-file

password free for rsync:  `https://www.debian-administration.org/article/530/SSH_with_authentication_key_instead_of_password`

https://kb.iu.edu/d/aews

      mkdir -p ~/.ssh 
      touch ~/.ssh/authorized_keys
      cat ~/id_rsa.pub >> ~/.ssh/authorized_keys

http://bencane.com/2013/07/22/ssh-disable-host-checking-for-scripts-automation/

For dreamhost, the following is needed:

```
local maching
scp ~/.ssh/id_rsa.pub user@example.com:~/

Remote
mkdir -p ~/.ssh
touch ~/.ssh/authorized_keys
cat id_rsa.pub >> ~/.ssh/authorized_keys
rm ~/id_rsa.pub
chmod go-w ~
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Need to think about secure authentication for a host. 


### Compile Shell Script

This is the shell script that the server calls to compile a known repository.
It expects on the command line the full pwd, the npm user, and the litpro
user. That is to say, the users that will run the npm install command and the
litpro command. The npm install needs network access. The litpro command is
specifically denied network access. Both have restricted access to only the
directory at the time they need it. 

The chown command changes the ownership of the directory. The su command has
the process become the reduced privilege user. pkill will kill all processes.
The trailing `-` should hopefully give a default environment and protect any
of root's possible environment from leaking. 

    #!/bin/bash
    chown -RP $2 $1
    su -s /bin/bash -c "cd $1; npm install --ignore-scripts" -
    pkill -u $2
    chown -RP $3 $1
    su -s /bin/bash -c "cd $1; litpro" -
    pkill -u $3
    chown -RP _"fileuser":_"usergroup" $1


### post compile

At this stage, we will have three different pathways: git push, rsync, s3. 

These are scripts to be installed in a known path, unwriteable by users, that
are to be run by writeweb. 

These can be in writeweb's user directory and made unwriteable by writeweb and
ownership can be by root. 



[git push]()

We just push using git so all we need is the directory as the first argument.

    #!/bin/bash
    resourceLoading $1 noLoad 
    cd ~/repos/$1/build
    git add .
    git commit -m "auto transform"
    git push

[rsync ssh]()

This uses the rsync method with a public key. We just require the directory
again.

The resources loading script is a node script that sets up the resources that
may be required. Convention is that the build directory should contain the
resource.txt file. This will be compared with one saved in the secrets
directory which is the old one.

The first argument is the user/repo directory, remote user, and
destination `target:dir `

    #!/bin/bash
    node ~/scripts/resourceLoading $1
    rsync -rtv  -e "ssh -l $2 -o StrictHostkeyChecking=no" ~/repos/$1 $3 


[rsync pwd]()

Here the arguments are user/repo, remote username, host `target:dir`, password

    #!/bin/bash
    node ~/scripts/resourceLoading $1
    rsync -rtv  -e "sshpass -p $4 ssh -l $2 -o StrictHostkeyChecking=no" ~/repos/$1 $3 

[amazon s3]()

This loads the stuff into amazon s3. Someday may look into getting this to
work with dreamobjects too. Maybe it is easy. 

Arguments are git user/repo, access key, secret key, bucket   

    #!/bin/bash
    node ~/scripts/resourceLoading.js $1
    node ~/scripts/s3Transfer.js $1 $2 $3 $4
   

### Resource Loading 

This script checks for resource.txt in the new build and also for its
existence in the secrets directory. We read in both files, parsing them into
objects, organized by resulting file name. We compare the two and decide
whether to add, delete, change, or do nothing for each file name in each structure. If there is no such file, we use an empty object in its place and act
accordingly. 

In particular, the first time, it will load all resources. If resource.txt is
not present in the build, then all the resources are removed. 

If the option of noload is present, then a modresource.txt file is saved in
the build direction; no saving if there are no changes.  

    /*global require, process, console*/

    var fs = require('fs');
    var child_process = require('child_process');
    var userRepo = process.argv[2];

    var noLoad;
    if (process.argv[2] === "noLoad") {
        noLoad = true;
    }
    
    var keys, i, n, str;
    var txt, arr;

    var newres  = {};
    var oldres = {};
    var oldloc = {};
    var del = {};
    var add = {};
    var replace = {};

    var cp = _":copy";
    var fetch = _":fetch";
    var rm = _":rm";

    _":get and parse resource.txt files"

    _":compare structures"

    if (noLoad) {
        _":store modresource"
    } else {
        _":get files"
    }

[get and parse resource.txt files]()

This reads in from the system the resource.txt files. We can do this sync
since this is a small standalone process. Errors mean no such files and so the
objects remain empty. 

Once the text, we split on lines and whitespace to create the object. 

    _":common get code|sub TYPE, newres, 
        PATH1, repos, PATH2, /build/,
        OLDLOC, //"

 The oldloc is a hash that has the locations which we can lookup later before
 making a request. This allows copying. We delete last.

    _":common get code|sub TYPE, oldres, 
        PATH1, secrets, PATH2, /, 
        OLDLOC, oldloc[a[1]] = a[0];"

[common get code]()

    try {
        txt = fs.readFileSync("/home/_'fileuser'/PATH1/" +
            userRepo + "PATH2resource.txt", 'utf8');
        arr = txt.split("\n");
        arr.forEach(function (el) {
            var a = el.split(/s+/);
            TYPE[a[0]] = a[1];
            OLDLOC
        });
    } catch (e) {
        // no error catching needed; file did not exist
    }



[compare structures]()

Now we compare the two objects. We do this by going through the keys of each
object and comparing the results. This is inefficient, I suppose, but it
should work. 

So if the newres has it, but not the old one, then we add it. If they differ,
then the newres should be the choice


    _":common comp|sub OBJ1, newres, OBJ2, oldres, DIFF, add,
        WHICH, replace[keys[i]] = newres[keys[i]];"

For oldres being present, we delete. We ignore if they differ.

    _":common comp|sub OBJ1, oldres, OBJ2, newres, DIFF, del, 
        WHICH, //"


[common comp]()

    keys = Object.keys(OBJ1);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        if (OBJ2.hasOwnProperty(keys[i]) ) {
            WHICH
        } else {
            DIFF[keys[i]] = OBJ1[keys[i]];
        }
    }



[store modresource]()

This iterates over the del, add, and replace and creates a text file with the
symbol `(-, + ~)` in front, then the name and the location. 

    str = "";
    _":common store|sub OBJ, del, SYM, -"
    _":common store|sub OBJ, add, SYM, +"
    _":common store|sub OBJ, replace, SYM, ~"
    
    fs.writeFileSync("/home/_'fileuser'/repos/" + userRepo +
        "/build/modresource.txt", str, "utf8");
    console.log("modresource.txt written\n"+str+"\n---\n");

[common store]()

    arr = [];
    keys = Object.keys(OBJ);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        arr.push("SYM" + keys[i] + " " + OBJ[keys[i]]);
    }
    str += arr.join("\n");

    

[get files]()

Similar to above, but actually doing the changes in operations. It checks for
sizes.

    var pth = "/home/_'fileuser'/repos/"+ userRepo +"/build";
    var source, dest, k;

    _":add"

    _":replace"

    _":delete"

[add]()

This goes through and sees if the location already exists. If it does, we copy
the file. If not, we send it to our 

    keys = Object.keys(add);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        k = keys[i];
        if (oldloc.hasOwnProperty(add[k])) {
            source = path + oldloc[add[k]];
            dest = pth + k;
            cp(source, dest);
        } else {
            fetch(add[k], k);
        }
    }

[replace]()

Here we need to allow for temporary reassignment. We will append `.bak` to the
file. When we come across a file, we reassign. We also check the old location.
If it exists, then we check for the .bak file. If that's not there, then the
original should still be around. 

    keys = Object.keys(replace);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        k = keys[i];
        dest = pth + k;
        cp(dest, dest+'.bak');
        if (oldloc.hasOwnProperty(add[k])) {
            source = pth + oldloc[add[k]];
            try {
                fs.accessSync(source+'.bak'); 
                cp(source+'.bak', dest);
            }  catch (e) {
                cp(source, dest);
            }
        } else {
            fetch(add[k], k);
        }
    }

After this point, we can rerun through it and delete all the .bak files
because if they were needed, then they would have been used already.

    for (i = 0; i < n; i +=1 ) {
        k = keys[i];
        dest = pth + k;
        rm(dest);
    }


[delete]()

This deletes the files. This happens after all the needed files have already
been copied. Have at it.  

    keys = Object.keys(del);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        rm(pth + keys[i]);
    }

[copy]()

    function (source, target) {
        try {
            child_process.execFileSync('/bin/cp', 
                ['--no-target-directory', source, target]);
        } catch (e) {
            console.log("failuer to copy", source, target, e.stack);
        }
    }

[rm]()

    function (file) {
        try {
            child_process.execFileSync('/bin/rm', [file]); 
        } catch (e) {
            console.log("failuer to remove", file, e.stack);
        }
    }


[fetch]()

Here we are given a url and a file name to save it in. We need to ensure that
the total disk space is kept small so we will monitor the size of the streams.
We also will kept the number of requests small, 

    function () {}

### s3 transfer

This is basically taken from the npm module s3 examples. 

The arguments to it are the git user/repo, s3 access key ID, s3 accessKey,
bucket name

    /*global require, process, console*/
    
    var s3 = require('s3');
    
    var args = process.argv.slice(2);

    var client = s3.createClient({
      maxAsyncS3: 20,     // this is the default 
      s3RetryCount: 3,    // this is the default 
      s3RetryDelay: 1000, // this is the default 
      multipartUploadThreshold: 20971520, // this is the default (20 MB) 
      multipartUploadSize: 15728640, // this is the default (15 MB) 
      s3Options: {
        accessKeyId: args[1],
        secretAccessKey: args[2]
      }
    });

    var params = {
      localDir: "/home/_'fileuser'/" + args[0] + "/build",
      deleteRemoved: true, // default false, whether to remove s3 objects 
                           // that have no corresponding local file. 
      s3Params: {
        Bucket: args[3]
      }
    };
    var uploader = client.uploadDir(params);
    uploader.on('error', function(err) {
      console.error("unable to sync:", err.stack);
    });
    uploader.on('fileUploadStart', function (localFilePath, s3Key) {
        console.log("File uploading: " + localFilePath + " into " + s3Key);
    });
    uploader.on('fileUploadEnd', function (localFilePath, s3Key) {
        console.log("File done: " + localFilePath + " with " + s3Key);
    });
    uploader.on('end', function() {
      console.log("done uploading: " + params.localDir);
    });


### Encrypting data

openssl enc -e -des3 -salt -pass file:pwd.txt -in crap.txt -out crypt.bin

openssl enc -d -des3 -pass file:pwd.txt -in crypt.bin -out crap2.txt
    
salt prevents rainbow tables and being able to gather the password. this is
why it is okay to see it in the encrypted file.

Note sshpass http://www.cyberciti.biz/faq/noninteractive-shell-script-ssh-password-provider/  info

Hide the process info:

    # mount -o remount,rw,hidepid=2 /proc`

Make that permanent: 

Edit /etc/fstab, enter:
    
    # vi /etc/fstab

Update/append/modify proc entry as follows so that protection get enabled automatically at server boot-time:

 
    proc    /proc    proc    defaults,hidepid=2     0     0

From http://www.cyberciti.biz/faq/linux-hide-processes-from-other-users/ 
  
But apparently it doesn't work in ubuntu. Suggestion is to do `mount -o remount,hidepid=2 /proc` in /etc/rc.local.  Works




### pm2

Using pm2 for process management. 

Start with `pm2 start server.js`

Used `pm2 startup ubunut` and got 

    [PM2] Dumping processes
    root@ubuntu-512mb-nyc3-01:~/server# pm2 startup ubuntu
    [PM2] Generating system init script in /etc/init.d/pm2-init.sh
    [PM2] Making script booting at startup...
    [PM2] -ubuntu- Using the command:
          su -c "chmod +x /etc/init.d/pm2-init.sh && update-rc.d pm2-init.sh defaults"
     Adding system startup for /etc/init.d/pm2-init.sh ...
       /etc/rc0.d/K20pm2-init.sh -> ../init.d/pm2-init.sh
       /etc/rc1.d/K20pm2-init.sh -> ../init.d/pm2-init.sh
       /etc/rc6.d/K20pm2-init.sh -> ../init.d/pm2-init.sh
       /etc/rc2.d/S20pm2-init.sh -> ../init.d/pm2-init.sh
       /etc/rc3.d/S20pm2-init.sh -> ../init.d/pm2-init.sh
       /etc/rc4.d/S20pm2-init.sh -> ../init.d/pm2-init.sh
       /etc/rc5.d/S20pm2-init.sh -> ../init.d/pm2-init.sh
    [PM2] Done.

Then did `pm2 save`

Worked like a charm.

To remove it from starter, use `pm2 delete ...` and then `pm2 save`. Simple as
can be. 


## Webpages

These are the static webpages, located in public, that advertise the site,
give instructions, and are the forms for doing some stuff. 

* [compiler/public/index.html](#ww-index "save:")

### ww index

This is the index page for writeweb.net

    <html>
    <head><title>writeweb</title></head>
    <body><p>Welcome to writeweb where you can use literate programming to
    create websites easily and quickly. They look better than this (it's just a
    trial)!</p>
    </body
    </html>


## User editing files

If a user is authenticated and allowed to use a repo, then they can read the
files in the repo as well as the secrets. Different color schemes for repo vs
secrets. If they modify the repo, then they can, and should, commit/push (done
in one step, as with prose.io). We use `git -c "user.name=..." -c "user.email=..." commit ...` to identify the right contributor.

Need writeweb as collaborator to do this. 

Can setup codemirror for the editing and switch to an iframe for viewing the
test and/or live site as well as diagnostic. Think tabs at top for the view,
maybe jsbin like as well with split views though that can be disorienting. Use
a save command with commit message dialog. Probably also want to save locally
the changes until a save is done. 

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



by [James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: express 4.13.3, express-force-ssl 0.3.0, body-parser 1.14.2; 
    dev: ")
