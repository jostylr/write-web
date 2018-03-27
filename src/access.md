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
   There are two implicit roles: public and user which gets automatically
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



