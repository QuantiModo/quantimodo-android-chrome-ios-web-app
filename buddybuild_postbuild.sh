#!/bin/bash

echo "=== buddybuild_postbuild.sh ==="

echo "www/configs FILE LIST:"
cd www/configs && find .

echo "www/data FILE LIST:"
cd .. && cd data && find .