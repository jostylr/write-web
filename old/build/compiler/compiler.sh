#!/bin/bash
chown -RP $2 $1
su -s /bin/bash -c "cd $1; npm install --ignore-scripts" -
pkill -u $2
chown -RP $3 $1
su -s /bin/bash -c "cd $1; litpro" -
pkill -u $3
chown -RP writeweb:writeweb $1
