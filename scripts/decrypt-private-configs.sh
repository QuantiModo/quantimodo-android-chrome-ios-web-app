#!/bin/sh

if [[ -z "$LOWERCASE_APP_NAME" ]]; then
    echo "Error: Missing LOWERCASE_APP_NAME env"
    exit 1
fi

if [[ -z "$ENCRYPTION_SECRET" ]]; then
    echo "Error: Missing encryption secret."
    exit 1
fi

echo "DECRYPTING ./scripts/private_configs/$LOWERCASE_APP_NAME.private_config.json.enc..."
openssl aes-256-cbc \
-k "$ENCRYPTION_SECRET" \
-in "./scripts/private_configs/$LOWERCASE_APP_NAME.private_config.json.enc" -d -a \
-out "./www/private_configs/$LOWERCASE_APP_NAME.private_config.json"