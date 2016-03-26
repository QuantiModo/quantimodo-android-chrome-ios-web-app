#!/bin/sh

if [[ -z "$ENCRYPTION_SECRET" ]]; then
    echo "Error: Missing encryption secret."
    exit 1
fi

if [[ -z "$PROFILE_NAME" ]]; then
    echo "Error: Missing provision profile name"
    exit 1
fi

if [[ ! -e "./scripts/profile/$PROFILE_NAME.mobileprovision.enc" ]]; then
    echo "Error: Missing encrypted provision profile"
    exit 1
fi

if [[ ! -e "./scripts/certs/dist.cer.enc" ]]; then
    echo "Error: Missing encrypted distribution cert."
    exit 1
fi

if [[ ! -e "./scripts/certs/dist.p12.enc" ]]; then
    echo "Error: Missing encrypted private key."
    exit 1
fi

openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/certs/apple.cer.enc" -d -a \
-out "./scripts/certs/apple.cer"

openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/profile/$PROFILE_NAME.mobileprovision.enc" -d -a \
-out "./scripts/profile/$PROFILE_NAME.mobileprovision"

openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/certs/dist.cer.enc" -d -a \
-out "./scripts/certs/dist.cer"

openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/certs/dist.p12.enc" -d -a \
-out "./scripts/certs/dist.p12"

openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/private_configs/moodimodo.config.js.enc" -d -a \
-out "./www/private_configs/moodimodo.config.js"

find ./hooks -type f -exec chmod 644 {} \;
find ./hooks -type d -exec chmod 755 {} \;