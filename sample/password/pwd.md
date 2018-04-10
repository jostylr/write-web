# Password

This creates a simple script to benchmark the password function. This is
required for figuring out the salt rounds. 


    const bcrypt = require('bcrypt');

    const main = async function () {
        let pwd = 'asjdfpij2o3r4re08us[fvouhjkbln4grevf';
        let start = [];
        let end = [];
        let round = [0];
        let pwds = [pwd];
        for (let i = 10; i < 15; i +=1) {
            start.unshift(process.hrtime());
            pwds.unshift(await bcrypt.hash(pwd, i));
            console.log(pwds);
            end.unshift(process.hrtime(start[0]));
            round.unshift(i);
        }
        console.log(pwds, end.map( (t) => t[0] + t[1]/1e9), round);
    }

    try {
        main();
    } catch (e) {
        console.log(e)
    }


[../hash.js](# "save:")


## Notes

To install bcrypt, it needs to be made. For ubuntu, the package `sudo apt-get install build-essential` is the one to get as it enables both make and gcc, etc. 

On DO as of 4/2018 on the cheapest package, salt rounds 13 leads to ~0.8
seconds while 12 is about 0.4  (naturally enough, the time roughly doubles for
each extra round as it is doubling the number of actual rounds). 




