#! /bin/bash 
cd $1
git pull
cd output
git pull 
cd ..
npm install
node ./node_modules/.bin/litpro
cd output
git add .
git commit -m "auto transform"
git push
cd ..
cd ..
