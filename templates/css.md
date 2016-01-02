# CSS

This is all of the css. 


We require values from the project value. 

[main](project.md "load:")

Should run the final through a minimizer, say cssnano http://cssnano.co/usage/ 

## Size

We define some size scopes:

[size:big](# "store: @media (min-width:751px) {")
[size:moderate](# "store:@media (min-wdith:751px), (max-width:850px) { ")
[size:small](# "store: @media (max-width:750px)  {")

## CSS Organization

Dealing with CSS is problematic. Always. Here we define a basic skeleton,
using some values from project.md that hopefully helps minimize the need to go
delving into all of this. 

    _"baseline"

    _"main::base override"

    _"figure"

    _"table"

    _"header"

    _"menu"

    _"main"

    _"footer"

    _"size:big"
        _"big"
    }

    _"size:moderate"
        _"moderate"
    }

    _"size:small"
       _"small" 
    }



[custom.css](# "save:")  should add post css stuff. 

### h5

We want to let the relevant bits to be grouped together logically, but we need
some in the media queries. So we start up the h5 block to go into there.


[big](# "h5:| join")
[moderate](# "h5:| join")
[small](# "h5:| join")

### Baseline

This contains the minimal writ css that is nice to read. 

    _"writ"

    * {
        box-sizing : border-box;
    }

    body {
        background-color: white; /*#F1F1EF;*/
        color: #424040;
        margin:0;
    }
    
    h1, h2, h3 {
        line-height:2rem;
    }

    h2, h3 {
        clear:both;
    }

##### Moderate

Start scaling down the headlines

    h1 {font-size: 2.2em;}
    h2 {font-size: 1.7em;}
    h3 {font-size: 1.5em;}

##### Small

    h1, h2, h3 {
        text-align:center;
    }

    h1 { font-size: 1.5em;}
    h2 { font-size: 1.25em;}
    h3 { font-size: 1.15em;}
 


### Figure

Here we implement the figure styling. We give a constrained width of 300px and
float it, alternating sides as default. We also center the caption.

We also have a border class and a level class (we shift the margin a little in
general for better placement).

    figure {
      display:block;
      width:300px;
      float:left;
      margin-top:5px;
    }
    
    figure:nth-of-type(2n+1) {
        float:left;
    }

    figure:nth-of-type(2n) {
        float:right;
    }

    figcaption {
       text-align:center; 
    }

    figure.border img {
        border: 2px solid #aaaadd;
    }

    figure.level {
        margin-top:0px;
    }

    figure.left:nth-of-type(n) {
        float:left;
    }
    
    figure.right:nth-of-type(n) {
        float:right;
    }

##### Small

    figure {
        width:initial;
        max-width:300px;
    }
    
    figure:nth-of-type(n) {
        display:block;
        position:relative;
        float:none;
        max-width:450px;
        margin-left:auto;
        margin-right:auto;
    }
    



### Table

    table {
        max-width: 500px;
        margin:0 auto 0;
    }

### Header

Much of the work is in getting the header and its nav working right. 

We want the logo on the left, about 30% width and the menu on the right. 

The header will be fixed. The left and right margins and the width are set to
make sure the background covers. 

    header {
        /*margin: -10px 10px 30px 10px; */
        position:fixed;
        top: 0px;
        max-height: 100px;
        width:100%;
        background-color: _"color:headerbg";
        z-index:10;
        padding-bottom:10px;
        padding-left:10px;
        padding-right:10px;
    }

    header img {
        float:left;
        max-width: 350px ;
    }

    header:after {
        content:"";
        display:table;
        clear:both;
    }

##### Moderate
   
    header img {
        position: absolute;
        top:9px;
        left:0px;
    }

    header .dummy {
        position:relative;
        max-width:950px;
        height:120px;
        display:block;
        margin-left:auto;
        margin-right:auto;
    }


   
##### Small

    header > a {
        width: 300px;
        margin-left: auto;
        margin-right: auto;
        display: block;
    }
    
    header img {
        width:300px;
        float:none;
    }
    
    header .dummy {
        max-width: 550px;
        margin-left:auto;
        margin-right:auto;
    }

    header {
        width:100%;
        padding-left:0;
        padding-right:0;
        max-height:120px;
    }


### Menu 
    
    header nav {
        position:relative;
        bottom:10px;
        right:0;
    }
    
    header nav li {
        float:left;
        width: initial;
        border: 1px solid #CED8C4;
        text-transform: uppercase;
        padding-left: 2px;
        padding-right: 2px;
        margin-left: 4px;
    }

    header nav a:hover {
        background-color : #CED8C4;
    }


##### Moderate

    nav li {
        font-size: 0.8em;
    }
    
    header nav ul li {
        padding-left:0px;
    }

    header nav {
        position:absolute;
        bottom: 36px;
        right:0px;
    }
    
    nav a {
        display: inline-block;
        width:100%;
    }

##### Small
    
    nav a {
        font-size: 0.4 em;
    }

    header nav {
        position: static;
        display:block;
        float:none;
        width: 322px;
        margin-left:auto;
        margin-right:auto;
    }

    header ul {
        float:none;
        margin-top:0;
        margin-bottom:0;
        margin-left:3px;
    }
   
    nav:last-child {
        margin-bottom:10px;
    }

    nav:last-child:after {
    content:"";
    display:table;
    clear:both;
    }
   

    header nav li {
        border-left: 0px;
        border-bottom: 0px;
        background-color:#C3D2C9;
        width:initial;
        margin-left: 1px;
        font-size: small; 
        padding-left:2px;
        padding-right:2px;
    }

    header nav li a {
        text-align:center;
    }


### Main

    main {
        display:block;
        margin-left:auto;
        margin-right:auto;
        max-width:950px;
        margin-top: 125px;
        margin-bottom:50px;
    }

##### Moderate 

    main  {
        margin-left: 15px;
        margin-right: 15px;
    }

##### Small


    main {
        margin-top: 125px;
        margin-bottom: 20px;
        margin-left:2ch;
        margin-right:2ch;
    }

    
### Footer


    footer {
        display:block;
        width:100%;
    }


## Writ

This is a modified version of a base css for good looking content. Removed the
main styling. 

    /*!
     * Writ v0.2.1
     *
     * Copyright © 2015, Curtis McEnroe <curtis@cmcenroe.me>
     *
     * https://cmcenroe.me/writ/LICENSE (ISC)
     */

    /* Fonts, sizes & vertical rhythm */

    body {
      font-family: Palatino, Georgia, Lucida Bright, Book Antiqua, serif;
      font-size: 16px;
      line-height: 1.5rem;
    }

    code, pre, samp, kbd {
      font-family: Consolas, Liberation Mono, Menlo, Courier, monospace;
      font-size: 0.833rem;
    }

    kbd { font-weight: bold; }
    h1, h2, h3, h4, h5, h6, th { font-weight: normal; }

    /* Minor third */
    h1 { font-size: 2.488em; }
    h2 { font-size: 2.074em; }
    h3 { font-size: 1.728em; }
    h4 { font-size: 1.44em; }
    h5 { font-size: 1.2em; }
    h6 { font-size: 1em; }
    small { font-size: 0.833em; }

    h1, h2, h3 { line-height: 3rem; }

    p, ul, ol, dl, table, blockquote, pre, h1, h2, h3, h4, h5, h6 {
      margin: 1.5rem 0 0;
    }
    ul ul, ol ol, ul ol, ol ul { margin: 0; }

    hr {
      margin: 0;
      border: none;
      padding: 1.5rem 0 0;
    }

    /* FIXME: Kind of hacky vertical rhythm for tables */
    table {
      line-height: 1.438em;
      margin-bottom: -1px;
    }

    /* Colors */

    body { color: #222; }
    code, pre, samp, kbd { color: #111; }
    a, nav a:visited { color: #00e; }
    a:visited { color: #60b; }
    mark { color: inherit; }

    code, pre, samp, thead, tfoot { background-color: #eee; }
    mark { background-color: #fe0; }

    main aside, blockquote, ins { border: solid #eee; }
    pre, code, samp, th, td { border: solid #ddd; }

    /* Layout */

    body { margin: 1.5rem 1ch; }

    body > header { text-align: center; }

    /* Copy blocks */

    blockquote {
      margin-right: 3ch;
      margin-left: 1.5ch;
      border-width: 0 0 0 0.5ch;
      padding: 0 0 0 1ch;
    }

    pre {
      margin-bottom: -2px;
      border-width: 1px;
      border-radius: 2px;
      padding: 0 0.5ch;
      overflow-x: auto;
    }
    pre code {
      border: none;
      padding: 0;
      background-color: transparent;
      white-space: inherit;
    }

    img { max-width: 100%; }

    /* Lists */

    ul, ol, dd { padding: 0 0 0 3ch; }
    dd { margin: 0; }

    ul > li { list-style-type: disc; }
    li ul > li { list-style-type: circle; }
    li li ul > li { list-style-type: square; }

    ol > li { list-style-type: decimal; }
    li ol > li { list-style-type: lower-roman; }
    li li ol > li { list-style-type: lower-alpha; }

    nav ul {
      padding: 0;
      list-style-type: none;
    }
    nav ul li {
      display: inline;
      padding-left: 1ch;
    }

    /* Tables */

    table {
      width: 100%;
      border-collapse: collapse;
      overflow-x: auto;
    }

    th, td {
      border-width: 1px;
      padding: 0 0.5ch;
    }

    /* Copy inline */

    a { text-decoration: none; }

    sup, sub {
      font-size: 0.75em;
      line-height: 1em;
    }

    ins {
      border-width: 1px;
      padding: 1px;
      text-decoration: none;
    }

    mark {
      padding: 1px;
    }

    code, samp {
      border-width: 1px;
      border-radius: 2px;
      padding: 0.1em 0.2em;
      white-space: nowrap;
    }

