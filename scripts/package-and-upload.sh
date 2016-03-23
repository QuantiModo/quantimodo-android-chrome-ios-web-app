
#!/bin/sh

cd platforms/ios

xcodebuild -workspace MedTLC.xcworkspace -scheme MedTLC -sdk iphoneos -configuration Release  archive -archivePath $PWD/build/MedTLC.xcarchive CODE_SIGN_IDENTITY="$DEVELOPER_NAME" PROVISIONING_PROFILE="$PROFILE_UUID" CODE_SIGN_IDENTITY[sdk=iphoneos*]="$DEVELOPER_NAME"

xcodebuild -exportArchive -archivePath $PWD/build/MedTLC.xcarchive -exportPath $PWD/build -exportOptionsPlist $PWD/exportOptions.plist

pilot upload -u ios@quantimodo.com -i $PWD/build/MedTLC.ipa -a com.quantimodo.medtlcapp -p 1046797567 --verbose

