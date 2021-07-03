#!/bin/bash
if [ "x$(id -u)" != 'x0' ]; then
    echo
    echo "================ Error ================="
    echo "This script can only be executed by root"
    echo "========================================"
    echo
    exit 1
fi
