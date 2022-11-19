#!/bin/bash

cd src

zip -r -FS bulk-texter-lite-edge.zip * --exclude '*.git*' --exclude '*manifest-*' --exclude '*.DS_Store'
mv bulk-texter-lite-edge.zip ../

cd ../