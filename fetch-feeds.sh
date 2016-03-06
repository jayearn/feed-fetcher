#!/bin/bash

for FILE in `cat feedlist` ;
do
    node fetch-feed.js $FILE &
done

exit 0
