#!/bin/bash

# Firefox currently only accepts manifest v2
mv src/manifest.json src/manifest-v3.json
cp src/manifest-v2.json src/manifest.json

cd src

zip -r -FS bulk-texter-lite-firefox.zip * --exclude '*.git*' --exclude '*manifest-*' --exclude '*.DS_Store'
mv bulk-texter-lite-firefox.zip ../

cd ../

# Revert the manifest swap
mv src/manifest-v3.json src/manifest.json
