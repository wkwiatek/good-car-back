#!/usr/bin/env bash

rsync -avz --delete --exclude node_modules ./ circleci@46.101.166.74:/var/www/pewnywoz.pl/good-car-back
