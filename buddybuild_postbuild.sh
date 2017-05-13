#!/bin/bash

echo "=== buddybuild_postbuild.sh ==="

if [ -z ${CIRCLE_BRANCH} ];
    then
        echo "Not in CircleCI"
    else
        echo "Set BUDDYBUILD_WORKSPACE to $PWD"
        BUDDYBUILD_WORKSPACE=$PWD
fi

if [ -z ${BUDDYBUILD_WORKSPACE} ];
    then
        BUDDYBUILD_WORKSPACE=/vagrant/public.built/ionic/Modo
    else
        echo "BUDDYBUILD_WORKSPACE is ${BUDDYBUILD_WORKSPACE}"
fi

#"Directory structure: "
#ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'

echo "www/configs FILE LIST:"
cd ${BUDDYBUILD_WORKSPACE}/www/configs && find .

echo "www/data FILE LIST:"
cd ${BUDDYBUILD_WORKSPACE}/www/data && find .

if [ -z ${BUDDYBUILD_SCHEME} ];
    then
        echo "=== android-armv7-release.apk INFO ==="
        keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-release.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64
        #unzip android-armv7-release.apk >/dev/null
        #mkdir ${BUDDYBUILD_WORKSPACE}/android-armv7-release && cd ${BUDDYBUILD_WORKSPACE}/android-armv7-release && unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-release.apk >/dev/null
        #keytool -printcert -file META-INF/CERT.RSA
        echo "=== android-x86-release.apk INFO ==="
        keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-x86-release.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64
        #mkdir ${BUDDYBUILD_WORKSPACE}/android-x86-release && cd ${BUDDYBUILD_WORKSPACE}/android-x86-release && unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-x86-release.apk >/dev/null
        #keytool -printcert -file META-INF/CERT.RSA
        echo "=== android-armv7-debug.apk INFO ==="
        keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-debug.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64 || true
        mkdir ${BUDDYBUILD_WORKSPACE}/android-armv7-debug && cd ${BUDDYBUILD_WORKSPACE}/android-armv7-debug && unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-armv7-debug.apk >/dev/null
        keytool -printcert -file META-INF/CERT.RSA
    else
        echo "BUILDING IOS APP because BUDDYBUILD_SCHEME env is ${BUDDYBUILD_SCHEME}"
        echo "NOT BUILDING ANDROID APP because BUDDYBUILD_SCHEME env is set"
fi
