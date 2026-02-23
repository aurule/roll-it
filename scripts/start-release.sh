#! /usr/bin/bash

# this script is meant to be run from the bot's main directory

echo "Releasing version $1"
git branch release/$1
git checkout release/$1
npm --no-git-tag-version version $1
echo "...updated package.json"
sed "s/\".*\"/\"$1\"/" src/version.js -i
echo "...updated version file"
sed "s/<small>.*<\/small>/<small>$1<\/small>/" docs/_coverpage.md -i
echo "...updated docs coverpage"
git commit package.json package-lock.json src/version.js docs/_coverpage.md -m "Update version to $1"
yarn changelog:build
echo "...changelog ready for editing"
echo "Done"
