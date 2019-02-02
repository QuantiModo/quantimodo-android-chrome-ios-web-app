#!/bin/bash
# set -e

declare -a ARGS
for var in "$@"; do
    # Ignore known bad arguments
    if [[ "$var" = '--install' ]] || [[ "$var" = '-i' ]]; then
        npm install;
        continue
    fi
    ARGS[${#ARGS[@]}]="$var"
done

exec "${ARGS[@]}"
