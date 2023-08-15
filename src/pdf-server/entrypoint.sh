#!/bin/sh -e

yarn wait-on ${SITE} -t 5000
exec $@