# Personal compiling server

The more grand visions of this project may or may not work out, but a smaller
version is to simply host one's own server, say on DO, and have it do githook
monitoring and running. This first version will be very simple and not worry
about the code being run at the moment. The idea is that trusted people are
using this. 

## Plan of attack

One section will cover how to setup the server, at least, how to set it up
given what I currently have running. Maybe later I will try to flush it
entirely out. 

Another section will cover running the githook server. It should be pretty
simple; get hook call, then change to the user with that repo. Maybe that's
how to do it; each repo is its own user which limits some of the risk vectors.

Another section is the script to be executed for each account. This should

1. Pull the changes 
2. Download items 
3. npm install
4. Apply litpro
5. Upload items

All of the outputs are sent to logs.txt which gets dealt with via logs.sh

We also have a release event response which triggers release.sh in the repo.
Presumably, this takes whatever was compiled and ready and pushes it to
whatever the destination is. 

## Githook

Using node-github-hook because it came up first.  

https://github.com/nlf/node-github-hook
>
    var githubhook = require('githubhook');
    var github = githubhook({/* options */});

    github.listen();

    github.on('push', function (repo, ref, data) {
    });

    github.on('release', function(repo, ref, data) {

    });


## Downloader

This uses the file manifest.txt to download files. The format is
`url dir/file.ext`

The idea is we have a `url` that gets downloaded to a `dir/file.ext` Space is
significant. 

For multiples that are of a similar nature (different sizes), the manifest.txt
file could be generated.

The downloaded files get placed in a downloads directory. It is recorded that
they are saved. To generate a new one, use #i after the url which will get
stripped, but allows one to keep track of the versions and will rename the
previous one and put in an old directory. 

There is also a possible cloudinary.txt file that will have the format





## Litpro 

Execute litpro. This relies on lprc.js  

## Uploader

This uploads the files in the upload directory using the credentials. 

    

### Rsync

Not much to do here. Just use the rsync command

Need to setup the private keys. 


### AWS S3

https://github.com/andrewrk/node-s3-client


### Git Push

This

