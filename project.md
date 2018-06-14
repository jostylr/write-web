# Write-web layout

This is the main project layout file. This loads up the various literate
programs that make up this project, including compiling the examples and
tests. 

At its core, this is a server implementation. It is setup to have specific
flows in and out of it which allows the server to recede into the background
with a particular use of the server allowing the development to be mainly on
the front end, particularly with CSS doing most of the heavy lifting. This is
CSS Zen Garden taken to its logical extreme. And, after all, the appearance is
what most people will judge a site on with the behavior only being a factor if
that behavior is bad. 


## Server

The server is created in [server](server.md "load:") It creates a nodejs
module that should be required. It returns a function whose single argument to
it should be an options object that sets up whatever the function requires. 


### Database

A separate piece is the [data](data.md "load:"). We employ three pieces:

a) [AragonDB](https://www.arangodb.com/). This is a document and graph
database. This allows for flexible modeling of entities (document store) while
also maintaining relationships (graph part). Advantage over SQL (which can do
the same roughly) is querying 
[length relations between vertices](https://medium.com/@neunhoef/graphs-in-data-modeling-is-the-emperor-naked-2e65e2744413#.x0a5z66ji)

This is the model of long-lasting what is.

b) [Redis](https://redis.io/). This is a fast in-memory key-value. It
represents quick storage, such as session tokens and caches. It can do more,
but that's the best use case. 

c) Event logging. This records both transitory events as well as the longer
term storage into the lasting database. On a defined interval, this is a file
with the events since the last backup dump allowing us to step through the
events. 



### JSON

The main work of the server is to serve and receive [json](json.md "load:").
The file that is loaded has a browser component and a server component. These
work in tandem. On the browser side, this uses the Fetch methods to allow for
off-line work with an AJAX fallback. 


We also allow for programmatic access, such as with CURL or another server.
This is basically the same, but access control is a little different since it
is not done with cookies, but rather with the JSON itself. 


### Transformations

Often data coming in will need to be checked and or transformed. This is all
rolled into one thing. Some of this, such as converting markdown to html, uses
a package to do the work and then does something with the items, potentially
saving it as a file and noting the locations. 

Other times, this needs to be specified with the initialization. 

Instructions and setup can be found in 
[transformations](transformations.md "load:")


### Backup

Some default backup options

a) Setting the db dump backup and storing it somewhere, such as glacier. 
b) Storing the event logs, either in git or in cloud storage.
c) Creating the output versions of stuff (say rendered webpages) and storing
them in git. This allows for a quick overview of the implications of each
change. 




### Access Control

Access control is important for this. We have a baked in user setup and an
[access](access.md "load:") control setup.

This uses bcrypt for encryption of passwords. 

We use a http-only cookie to store the access token to avoid xss. If it is
programmatic access, then we don't use a cookie, but rather put it in the JSON
object. 


### File Upload

We also deal with [file](file.md "load:") uploads. This takes in files and
streams them immediately into a unique file name. This gets returned to the
user to be associated with other data.   

We also allow for processing files during the upload process. 

This is one of those spots that need to be watched for scaling issues. 

We also allow for backing up the files to somewhere else, such as Amazon s3. 

This also includes file sending as part of a JSON thing (encoded). ???? Maybe
just the scrambled ids? Maybe intercept that with a fetch to replace it with
the desired name. 


### Filter

We allow for [filter](filter.md "load:")ing of the information before being sent. It is the same
code as the filtering that happens in the browser. 

This can be both removing entire rows as well as filtering what about rows is
returned. Ideally, this is not needed for small scale, but for some data it
needs to be weeded out. 


### Events

We also do [event](event.md "load:") logging. This will record events that
match criteria in a log file, generally by day. One can have multiple event
logs for different criteria, but it is probably simpler to just have all
the events in one file. 

Events will get backed up at the end of the day if it is in a git repository,
but it is not backed up during the day. 

### Static Server

This server does not serve static assets, at least not by a typical process
(it can send stuff by JSON to a fetch that will translate it into an asset;
this is for private areas). Instead, the idea is that if the data is creating
static content, then that content gets pushed elsewhere, either by sftp or s3
or git pages hosting. 

This is handled by [static](static.md "load:")

### Email

This setup can also handle being a middle-person for [email](email.md "load:"), using mailgun. 

The idea is to both receive and send email as well as maintain lists.  

### Websockets

This enables push notifications. It should enable chats as well as
notifications and auto updating of data. This uses [websocket](websocket.md "load:") technology.  


### RSS

This covers not only RSS, but also custom hooks, both receiving and sending
them. 

Check out [rss](rss.md "load:")


### SMS

It would be cool to connect up into SMS and maybe other APIs. 

## Browser

For the browser, we have some default structures that get bundled into a
javascript. It is plain vanilla, for the most part.

It all is orchestrated from [browser](browser.md "load:")

### Fetch

This implements the sending and retrieval of the data, as described in
[fetch](fetch.md "load:")


### Structure

This is where the basic [structure](structure.md "load:") is defined with the
incoming data. The idea is that it should be easily stylable with CSS. 

### Edit

We want to be able to [edit](edit.md "load:") data in the browser. This
handles a bit of those mechanics. 

Related to this is data validation, which happens in both the browser and the
server. 

There are also hooks for custom form/text transformation. In particular, the
idea is to support text area writing of data in some custom dsl and then
transform it into records to be sent.  



## Conventions

This project uses some conventions. 

1. `$varname` is used for async/promise/generator functions. The dollar sign
   is because these are expensive functions. 
2. For nodes/nodelists or other jquery style objects, we can use
   `varname$`/`varname$$`. 
3. `$` and `$$` in the browser represent query selector stuff.  


---

Alternative way of viewing all this. 

1. First load is static assets delivered by nginx. This is frontend design.
   Not much help from this.
2. Depending on the page, a login may be required. This is a form element that
   gets converted to JSON and sent through nginx to node server. Node server
   parses the login, verifies, sends authentication token in https-only
   cookie. Authentication token is stored in Redis with an expiration date set
   in a config somewhere, maybe by user, whatever.
3. Inputs can be page requests for public assets (nginx), JSON requests (crud
   options, node), or file uploads (node). File uploads for appropriately
   credentialed people are automatically saved under a new name and that name
   is returned to the browser, to be included in a JSON request. Depending on
   the request and permissions, the file may be moved, renamed, made public,
   given access to others, etc. 
4. Inputs for c,u, can lead to the generation of rendered pages, to be served
   by nginx if public or by a request served from redis cache/filesystem,
   depending. 


