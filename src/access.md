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


## CSV headers

    user.csv  user, pwd=hash(), email
    role.csv role, [@user] 
    access.csv resource, action, [@user], [@role]
    notification.csv @user, resource, action, type

A resource is a description that locates what is allowed. It can be a csv file
or a whole directory or a row in a file or a condition that needs to be met on
one of those things (for example `thread#::(@user==user)` indicating that any
row of any table matching `thread#`,  

## Token

Here we need to generate a token, save a token, deal with expiring tokens, and
validate a token, maybe refreshing a token. 

    const tokens = ( 

    const makeToken = _":make";
    const dateToken = _":date";
    const validToken = _":valid";

    const checkAllTokens = _":check all";

    const saveTokens = _":save";

[valid]() 

We need to look up the token. The function receives an array of user id and
token. If the token is valid for the user, then it returns the user id (which
is never 0 as that is the public one and default).
Otherwise, it returns false to indicate further defaulting. 


    async function ( [uid, token], res) {
        if !(uid && token) {
            return false;
        }
        uid = parseInt(uid, 10);
        let ind;
        if ( (tokens[uid]) && 
            ( (ind = tokens[uid][0].indexOf(token))  !== -1) &&
            ( await dateToken(uid, ind, res) ) {
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
        let age = init.age;
        let tokenDate = tokens[uid][1][ind];
        let currentDate = Date.now();
        if (currentDate > tokenDate) {
            deleteToken(uid, ind); 
            return false;
        } else {
            if ( (currentDate + age*800) > tokenDate) {
                let toke = await makeToken();
                let future = currentDate + age*1000;
                addToken(uid, ind, toke, future);
                setCookie(res, uid, toke, age );
            }
            return true;
        }
    }

[make]()

Using [uid-generator](https://www.npmjs.com/package/uid-generator)

[check all]()

[save]() 


[add token]()


    function (
        tokens[uid][0][ind] = toke;
        tokens[uid][1][ind] = future 
        log(["token update", uid, ind, toke, future].join(","));


[delete token]()





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



