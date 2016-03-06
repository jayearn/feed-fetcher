#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd $DIR

for FILE in `cat feedlist` ;
do
    node fetch-feed.js $FILE &
done

popd

exit 0
