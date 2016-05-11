#!/bin/sh
if [[ -z "$KEY_PASSWORD" ]]; then
    echo "Error: Missing password for adding private key"
    exit 1
fi

echo "CREATING ios-build.keychain..."
security create-keychain -p travis ios-build.keychain

echo "IMPORTING ./scripts/certs/apple.cer..."
security import ./scripts/certs/apple.cer \
-k ~/Library/Keychains/ios-build.keychain \
-T /usr/bin/codesign

echo "IMPORTING ./scripts/certs/dist.cer..."
security import ./scripts/certs/dist.cer \
-k ~/Library/Keychains/ios-build.keychain \
-T /usr/bin/codesign

echo "IMPORTING ./scripts/certs/dist.p12..."
security import ./scripts/certs/dist.p12 \
-k ~/Library/Keychains/ios-build.keychain \
-P $KEY_PASSWORD \
-T /usr/bin/codesign

echo "security set-keychain-settings..."
security set-keychain-settings -t 3600 \
-l ~/Library/Keychains/ios-build.keychain

echo "SETTING ios-build.keychain to default keychain..."
security default-keychain -s ios-build.keychain

security list-keychains -d user -s login.keychain ios-build.keychain

echo "UNLOCKING ios-build.keychain..."
security unlock-keychain -p travis ios-build.keychain

echo "ADDING $PROFILE_NAME.mobileprovision to ~/Library/MobileDevice/Provisioning\ Profiles/..."
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

cp "./scripts/profile/$PROFILE_NAME.mobileprovision" ~/Library/MobileDevice/Provisioning\ Profiles/
