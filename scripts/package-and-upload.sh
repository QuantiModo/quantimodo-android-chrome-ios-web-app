
#!/bin/sh


#####################
# Make the ipa file #
#####################
- cd platforms/ios
- xcodebuild -workspace MoodiModo.xcworkspace -scheme MoodiModo -sdk iphoneos -configuration AppStoreDistribution archive -archivePath $PWD/build/MoodiModo.xcarchive
- xcodebuild -exportArchive -archivePath $PWD/build/MoodiModo.xcarchive -exportPath $PWD/build

