# Release Guide

Steps to do:

1. run `sh scripts/start-release.sh <version>`
    * this creates the branch `release/<version>`
    * then runs `npm --no-git-tag-version version <version>` to update the version in package.json and package-lock.json
    * then runs `npm run changelog:build` to generate the new version's changelog
2. edit the changelog and duplicate it to `docs/versions.md`
3. commit!
4. merge the release branch into `main`
5. tag the merge commit with the new version
6. merge the release branch into `develop`
7. delete the release branch
8. push main to deploy the release
9. run `yarn node scripts/update-commands.js`
10. run `yarn node scripts/mark-invalid-rolls.js` on the server
11. update the ko-fi page with a new release post
