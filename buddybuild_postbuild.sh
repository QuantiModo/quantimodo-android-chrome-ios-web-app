#!/bin/bash

echo "=== buddybuild_postbuild.sh ==="

echo "Current directory: $PWD"
cd ../..
echo "Current directory: $PWD"

#"Directory structure: "
#ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'

echo "www/configs FILE LIST:"
cd www/configs && find .

echo "www/data FILE LIST:"
cd .. && cd data && find .

if [ -z ${BUDDYBUILD_SCHEME} ];
    then
        echo "android-armv7-release.apk"
        keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-release.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64
        #unzip android-armv7-release.apk >/dev/null
        #unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-release.apk >/dev/null
        #keytool -printcert -file META-INF/CERT.RSA
        echo "android-x86-release.apk"
        #keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-x86-release.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64
        #unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-x86-release.apk >/dev/null
        #keytool -printcert -file META-INF/CERT.RSA
        echo "android-armv7-debug.apk"
        keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-debug.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64 || true
        unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-debug.apk
        keytool -printcert -file META-INF/CERT.RSA
    else
        echo "BUILDING IOS APP because BUDDYBUILD_SCHEME env is ${BUDDYBUILD_SCHEME}"
        echo "NOT BUILDING ANDROID APP because BUDDYBUILD_SCHEME env is set"
fi
