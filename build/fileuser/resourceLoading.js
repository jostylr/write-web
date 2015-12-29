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

var cp = function (source, target) {
    try {
        child_process.execFileSync('/bin/cp', 
            ['--no-target-directory', source, target]);
    } catch (e) {
        console.log("failuer to copy", source, target, e.stack);
    }
};
var fetch = ;

try {
    txt = fs.readFileSync("/home/writeweb/repos/" +
        userRepo + "/build/resource.txt", 'utf8');
    arr = txt.split("\n");
    arr.forEach(function (el) {
        var a = el.split(/s+/);
        newres[a[0]] = a[1];
        //
    });
} catch (e) {
    // no error catching needed; file did not exist
}
try {
    txt = fs.readFileSync("/home/writeweb/secrets/" +
        userRepo + "/resource.txt", 'utf8');
    arr = txt.split("\n");
    arr.forEach(function (el) {
        var a = el.split(/s+/);
        oldres[a[0]] = a[1];
        oldloc[a[1]] = a[0];
    });
} catch (e) {
    // no error catching needed; file did not exist
}

keys = Object.keys(newres);
n = keys.length;
for (i = 0; i < n; i +=1 ) {
    if (oldres.hasOwnProperty(keys[i]) ) {
        replace[keys[i]] = newres[keys[i]];
    } else {
        add[keys[i]] = newres[keys[i]];
    }
}
keys = Object.keys(oldres);
n = keys.length;
for (i = 0; i < n; i +=1 ) {
    if (newres.hasOwnProperty(keys[i]) ) {
        //
    } else {
        del[keys[i]] = oldres[keys[i]];
    }
}

if (noLoad) {
    str = "";
    arr = [];
    keys = Object.keys(del);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        arr.push("-" + keys[i] + " " + del[keys[i]]);
    }
    str += arr.join("\n");
    arr = [];
    keys = Object.keys(add);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        arr.push("+" + keys[i] + " " + add[keys[i]]);
    }
    str += arr.join("\n");
    arr = [];
    keys = Object.keys(replace);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        arr.push("~" + keys[i] + " " + replace[keys[i]]);
    }
    str += arr.join("\n");
    
    fs.writeFileSync("/home/writeweb/repos/" + userRepo +
        "/build/modresource.txt", str, "utf8");
    console.log("modresource.txt written\n"+str+"\n---\n");
} else {
    var pth = "/home/writeweb/repos/"+ userRepo +"/build";
    var source, dest, k;
    
    keys = Object.keys(add);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        k = keys[i];
        if oldloc.hasOwnProperty(add[k]) {
            source = path + oldloc[add[k]];
            dest = pth + k;
            cp(source, dest);
        } else {
            fetch(add[k], k);
        }
    }
    
    keys = Object.keys(replace);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        k = keys[i];
        dest = pth + k;
        cp(dest, dest+'.bak');
        if oldloc.hasOwnProperty(add[k]) {
            source = path + oldloc[add[k]];
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
    for (i = 0; i < n; i +=1 ) {
        k = keys[i];
        dest = pth + k;
        rm(dest);
    }
    
    keys = Object.keys(del);
    n = keys.length;
    for (i = 0; i < n; i +=1 ) {
        rm(pth + keys[i]);
    }
}
