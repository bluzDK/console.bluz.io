#!/bin/bash

set -e

npm install

CI=true npm run build

# remove all files that shouldn't be deployed (everything but /build)
mv build /tmp/build
rm --recursive --force *
cp -r /tmp/build/* .