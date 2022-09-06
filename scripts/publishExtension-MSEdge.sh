#!/bin/bash

cd src

zip -r -FS extensionEdge.zip * --exclude '*.git*' --exclude '*manifest-*' --exclude '*.DS_Store'
mv extensionEdge.zip ../

cd ../