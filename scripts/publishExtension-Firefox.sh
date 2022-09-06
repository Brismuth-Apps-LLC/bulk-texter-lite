#!/bin/bash

# Firefox currently only accepts manifest v2
mv src/manifest.json src/manifest-v3.json
cp src/manifest-v2.json src/manifest.json

cd src

zip -r -FS extensionFirefox.zip * --exclude '*.git*' --exclude '*manifest-*' --exclude '*.DS_Store'
mv extensionFirefox.zip ../

cd ../

# Revert the manifest swap
mv src/manifest-v3.json src/manifest.json
