
#!/bin/sh

cd platforms/ios

xcodebuild -workspace MedTLC.xcworkspace -scheme MedTLC -sdk iphoneos -configuration Release  archive -archivePath $PWD/build/MedTLC.xcarchive CODE_SIGN_IDENTITY="$DEVELOPER_NAME" PROVISIONING_PROFILE="$PROFILE_UUID"

xcodebuild -exportArchive -archivePath $PWD/build/MedTLC.xcarchive -exportPath $PWD/build -exportOptionsPlist $PWD/exportOptions.plist

security delete-keychain ios-build.keychain

pilot upload -u ios@quantimodo.com -i $PWD/build/MedTLC.ipa -a com.quantimodo.medtlcapp -p 1046797567 --verbose

