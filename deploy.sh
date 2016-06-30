#!/usr/bin/env bash

rsync -avz --delete --exclude node_modules ./ root@46.101.166.74:/root/apps/good-car-back
