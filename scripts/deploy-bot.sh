#! /usr/bin/bash

# this script is meant to be run from the bot's main directory

. ~/.profile
. ~/.bashrc

npm install
pm2 reload roll-it
