#!/bin/bash
node ~/scripts/resourceLoading $1
rsync -rtv  -e "sshpass -p $4 ssh -l $2 -o StrictHostkeyChecking=no" ~/repos/$1 $3 
