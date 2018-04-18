#!/bin/sh

if [[ -z "$QUANTIMODO_CLIENT_ID" ]]; then
    echo "Error: Missing QUANTIMODO_CLIENT_ID env"
    exit 1
fi

if [[ -z "$ENCRYPTION_SECRET" ]]; then
    echo "Error: Missing encryption secret."
    exit 1
fi

echo "DECRYPTING ./scripts/$QUANTIMODO_CLIENT_ID.private_config.json.enc..."
openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/$QUANTIMODO_CLIENT_ID.private_config.json.enc" -d -a \
-out "./www/$QUANTIMODO_CLIENT_ID.private_config.json"
