#!/bin/bash

echo "=== buddybuild_postbuild.sh ==="

echo "Current directory: $PWD"
cd ../..
echo "Current directory: $PWD"

#"Directory structure: "
#ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'

echo "www/configs FILE LIST:"
cd www/configs && find .

echo "www/data FILE LIST:"
cd .. && cd data && find .