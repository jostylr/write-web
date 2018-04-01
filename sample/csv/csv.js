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
