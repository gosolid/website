#!/bin/bash -e

#exec 2>&1 >server.log

function checksum() {
  shasum yarn.lock
  shasum package.json
  shasum gatsby-config.js
  shasum gatsby-node.js
}

function start() {
  yarn start &
  echo $! >server.pid
}

function stop() {
  (cat server.pid | xargs kill -9 || true) 2>/dev/null
  rm -f server.pid
}

stop
trap EXIT stop
start

while true; do

git fetch;
LOCAL=$(git rev-parse HEAD);
REMOTE=$(git rev-parse @{u});

LOCALPCHK=$(checksum)
if [ $LOCAL != $REMOTE ]; then
  git pull origin master;
fi
REMOTECHK=$(checksum)

if [ x$LOCALCHK != x$REMOTECHK ]; then
  stop
  start
fi

sleep 1

done