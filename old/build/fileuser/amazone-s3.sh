#!/bin/bash
node ~/scripts/resourceLoading.js $1
node ~/scripts/s3Transfer.js $1 $2 $3 $4
