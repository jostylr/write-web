# Write-web

Write-web is a set of scripts and other resources that allow for simple
dynamic web hosting. This is deployed by the author on Digital Ocean, but any
platform that allows the use of nodejs and arrangodb on it should be fine. 

The concept of this project is to abstract away the commonalities of most
dynamic websites into a few simple conventions. Specifically: 

1. Data is stored in tabular fashion. We are using arangodb for the database.
2. Version control is implemented 
3. Baked in users and access control lists. While the passwords are encrypted,
   every effort should be made to ensure users are not reusing the password
   anywhere. 
4. File uploading with optional backing up using sftp or s3.
5. Simple JSON transmission between browser and server.
6. Browser JavaScript that makes it easy to reform data into usable HTML as
   well as edit it using standard forms. 
7. Generated CSS based on tabular data that allows for easy templating and
   overriding.
8. Structure for making this an installable web app for mobile devices, in
   particular, data retention for offline use and syncing.


In addition to the generic structuring of this, specific examples have been
coded up that can be easily used as templates: 

1. Discussion boards (flags, voting)
2. Blogs with optional comments, tag clouds, rss feeds (https://github.com/jaredreich/pell/#readme for simple editor, also code mirror and prose mirror)  
3. Task assignments and to-do lists. 
4. Inventory management
5. Email newsletters, transactional emails, notification emails
6. Packing/shipping lists
7. Membership management
8. Computer aided support for tabletop role-playing
9. File sharing
10. Photo galleries
11. Wikis (TOC, talk history)
12. Issue Tracking
13. Reviews
14. Rankings including one-on-one contests
15. A learning flow (online book)
16. SRS (spaced repetition system)
17. Catalog
18. Sign in/out
19. Reports
20. Agendas, minutes, rules
21. Live coding, like JSBin. Also includes a literate programming example. 
22. Charts, small data presentations (http://ui.toast.com/tui-chart/)


These examples can be read about on how to use in docs/ while the actual code
being used is in code/  The literate programming that demonstrates how I
created the code can be found in src/examples

## Installation

This a muli-step process.

1. Hosting. This sets up the hosting. It will help you setup the domain name, 
   nginx (serves static files, provides
   https security), ssl certificates from Let's Encrypt, and installs git, nodejs
   and pm2. It mentions other accounts you may want to get (GitHub/BitBucket,
   mailgun, Amazon s3). This is all fairly generic. See docs/hosting.md 
2. Configuration. There is a bit of configuration in terms of directory
   choices and relevant files. This can be a config file or  
   it can be done in the next step. See docs/config.md
3. Server coding. As you get into more custom behavior, some coding is
   required. This guide will help set that up. See docs/server.md
4. CSV. This is a short guide on the setup of the CVS files, mainly the
   heading row which defines a variety of possible behaviors and hooks.
   docs/csv.md
5. Structure. This is a guide to dealing with the HTML structure on the
   browser side in addition to making it installable as a web app.
   docs/html.md
6. Style. This is a primer on styling the resulting HTML and other aspects of
   the browser view. Some defaults are included, but styling would be the
   largest amount of custom behavior. docs/css.md
7. Behavior. Hopefully the default behavior is fairly sufficient, but some
   pointers on what to modify can be found here. docs/js.md

## Project structure

As with all of my projects, I use literate programming to generate all code.
You can get an overview of the project layout at project.md and the sources
that it compiles are all in src/

