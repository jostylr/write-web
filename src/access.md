# Access

This is a common part to pretty much all web apps, but probably the most
difficult to get right. Who can access what? 

This is a very opinionated way of doing this. We have some files that need to
be defined: 

1. user.csv  This file is [user, pwd=hash(), email]. That's it. The email
   is the recovery email. Typically, other emails can exist and other info,
   but this is the bare minimum. Users get access either from a password or
   from an email login. Any logged in user can create a new password. Still
   thinking on safest way to change an email address. Passwords get encrypted 
2. role.csv This file lists possible roles and lists of users with those
   roles. [role, [@user] ]
3. access.csv This file controls the access. This is where stuff gets real.
   There are two implicit roles: public (0) and user (1) which gets automatically
   defined as to who is in it (everybody, all logged in users, respectively),
   but this file lists what, if anything, they can do.  Another role,
   superuser, has full rights, but there needs to be a list of any users with
   that role in role.csv. Everything else is defined here. 
4. notification.csv This is a notification control panel for users. Very
   important to get right. 
5. tokens.csv a transitory file not to be saved in version control(?). It
   contains user ids tied to two arrays: one for access tokens and one for the
   expiration date. Their locations 


## CSV headers

    user.csv  user, pwd=hash(), email
    role.csv role, [@user] 
    access.csv resource, action, [@user], [@role]
    notification.csv @user, resource, action, type
    tokens.csv @user, [token], [date]


A resource is a description that locates what is allowed. It can be a csv file
or a whole directory or a row in a file or a condition that needs to be met on
one of those things (for example `thread#::(@user==user)` indicating that any
row of any table matching `thread#`,  

## Token

Here we need to generate a token, save a token, deal with expiring tokens, and
validate a token, maybe refreshing a token. 

The data structure is `uid, [tokens], [dates]` where each entry in tokens
corresponds to a date entry. Saving and loading should be handled just fine by
standard CSV operations. 


    tokens.$valid = _":valid"; 
    tokens.date = _":date";
    tokens.$make = _":make"; 
    tokens.check = _":check";


[valid]() 

We need to look up the token. The function receives an array of user id and
token. If the token is valid for the user, then it returns the user id (which
is never 0 as that is the public one and default).
Otherwise, it returns false to indicate further defaulting. 


    async function ( [uid, token], res) {
        let tokens = this;
        if !(uid && token) {
            return false;
        }
        let ind;
        if ( (tokens[uid]) && 
            ( (ind = tokens[uid][0].indexOf(token))  !== -1) &&
            ( await tokens.$date(uid, ind, res) ) {
            return uid;
        } else {
            return false;
        }
            
    }


[date]()

Here we know that the user id and token exists and we have the index of the
token. In tokens, we have an array of tokens for each uid and a corresponding
place for the date. If the date is past, we return false; otherwise we return
true. If  `current time + .8*age` is greater than the expiration, we issue a
new token and set that as a cookie header.  Note age is in seconds, date gives
ms. Here we update the tokens. 

We log the change. 

    async function (uid, ind, res) {
        let tokens = this;
        let tokenDate = parseInt(tokens[uid][1][ind], 10);
        let currentDate = Date.now();
        if (currentDate > tokenDate) {
            tokens.delete(uid, ind); 
            return false;
        } else {
            if ( (currentDate + age*800) > tokenDate) {
                let {token, future} = await makeToken();
                tokensreplaceToken(uid, ind, token, future);
                setCookie(res, uid, token, age );
            }
            return true;
        }
    }



[make]()
 
Making a token is as easy as calling the UID generator, calculating the age,
and returning it all. If a different age then the initial one is desired, it
can be passed in. 

    function (age = init.age) {
        let tokens = this;
        let token = await uidgen.generate(); // -> 'B1q2hUEKmeVp9zWepx9cnp'
        let future = currentDate + age*1000;
        return {token, future};
    }



[check all]()

Here we go through the tokens and invalidate any tokens that are too old. This
should be run before saving the tokens. 

We look through each uid and look for bad dates. We the splice remove them. We
count down in the inner loop so that splicing doesn't mess up the next item we
look at. 

    function () {
        let tokens = this;
        let i, n = tokens.length;
        let currentDate = Date.now();
        for (i = 1; i < n; i += 1) {
            let tokes = tokens[i][0];
            let dates = tokens[i][1];
            let j, m = dates.length;
            for (j = m-1; m > -1; m -= 1) {
                if ( parseInt(dates[m], 10) > currentDate) {
                    tokens.delete(uid, 
                }
        }


[replace token]()

This is simply adding on a token and a date in the corresponding places. 

    function (uid, ind, token, future) {
        let tokens = this;
        tokens[uid][0][ind] = token;
        tokens[uid][1][ind] = future;
        log.state(["tokens", "update", uid, ind, token, future].join(","));
    }


[delete token]()

This is deleting a token without replacing it. 


        let tokens = this;



## Cookie

Here we handle the cookie bits.

The cookie stuff we use is very minimal, simply authorization tokens. 

We call the cookie 'access' and have it be of the form `user id number:token`. 

    const setCookie = function (res, uid, token, age) {
        res.setHeader("Set-Cookie:", ['access=' uid + ':' + token +
            '; max-age='+age + ';HttpOnly']);  
    };


    const getCookie = function (req) {
        const m = (req.headers.cookie || '').match(/access\=(\d+)\:([^;]*);/);
        return (m ? [m[1], m[2]] : [null,null]);
    };



## Password

Here we handle the password material. This uses the bcrypt module with a salt
round of 12. This should take about half a second. 

    const $passHash = async function (user, secret) {
        await bcrypt.hash(secret, 12);
    }

    const $passComp = asynch function(

    
