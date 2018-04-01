# CSV

This experiments with csv. 

    const stringify = require('csv-stringify/lib/sync');
    const parse = require('csv-parse/lib/sync')

    const records = [["a", "b", "a|rr", "o'bj"], [1, 5, [7,8], {d:3, c:[1,2]}],
    ["dude\nw|o'w", true, false, 72.34e56 ]];
    let str1 = stringify(records, {
        delimiter : ',',
    });
    let str2 = stringify(records, {
        delimiter : '|',
        quote : "'",
        escape : "'"
    });

    const fs = require('fs');

    fs.writeFileSync('simple.csv', str1);
    fs.writeFileSync('custom.csv', str2);

    const loaded = fs.readFileSync('custom.csv', {encoding:'utf8'});
   
    let parsed = parse(loaded, {
        delimiter: '|',
        quote : "'",
        escape : "'"
        });

    console.log(parsed);
    


[csv.js](# "save:")

## Load csv

The file name is relative to the data folder. We load it, parse, save it in
memory, and then return it for use. We expect a double array to be returned.

    async function (file) {
        const text = await readFile(dir + file, 'utf8');
        try {
            return csv.parse(text);
        } catch (e) {
            console.error("could not parse " + file, e);
            return [[]];
        }
    }


## Load JSON

We expect a generic object to be returned.

    async function (file) {
        const text = await readFile( dir + file, 'utf8');
        try {
            return obj = JSON.parse(text);
        } catch (e) {
            console.error("could not parse " + file, e);
            return {};
        }
    }


## Save File

This is a common bit of writing here. 

    p = writeFile(dir + name, str).
        then( () => git(name, msg) ).
        then( () => {
            // last promise of saving for now
            if (p === saving.get(name) ) {
                saving.delete(name);
            }
            return true;
        });



## Stringify

    try {
        if (ext === '.csv') {
           str = csv.stringify(memory.get(name)); 
        } else {
           str = JSON.stringify(memory.get(name));
        }
        console.log(str, memory.get(name), name);
    } catch (e) {
        console.error("failed to stringify " + name, e);
        throw e;
    }


