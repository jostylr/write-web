#!/bin/bash
resourceLoading $1 noLoad 
cd ~/repos/$1/build
git add .
git commit -m "auto transform"
git push
