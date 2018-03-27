#!/bin/bash
rsync -rtv build/compiler/* root@writeweb.net:server
ssh root@writeweb.net 'pm2 restart server' 
