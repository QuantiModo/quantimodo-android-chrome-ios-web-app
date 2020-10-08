#!/usr/bin/env bash
echo "Saving host environment variables to host.env to access within docker"
printenv > .env