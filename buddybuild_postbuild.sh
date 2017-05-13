#!/bin/bash
echo "=== buddybuild_postbuild.sh ==="
print_sha1(){
    APK_NAME=$1
    echo "=== android-${APK_NAME}.apk INFO ==="
    keytool -list -printcert -jarfile ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-${APK_NAME}.apk | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64
    rm -r ${BUDDYBUILD_WORKSPACE}/android-${APK_NAME}
    mkdir ${BUDDYBUILD_WORKSPACE}/android-${APK_NAME}
    cd ${BUDDYBUILD_WORKSPACE}/android-${APK_NAME}
    unzip ${BUDDYBUILD_WORKSPACE}/platforms/android/build/outputs/apk/android-${APK_NAME}.apk >/dev/null
    keytool -printcert -file META-INF/CERT.RSA
}
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
echo "www/configs FILE LIST:" && cd ${BUDDYBUILD_WORKSPACE}/www/configs && find .
echo "www/data FILE LIST:" && cd ${BUDDYBUILD_WORKSPACE}/www/data && find .
if [ -z ${BUDDYBUILD_SCHEME} ];
    then
        print_sha1 armv7-debug
        print_sha1 x86-release
        print_sha1 armv7-release
    else
        echo "BUILDING IOS APP because BUDDYBUILD_SCHEME env is ${BUDDYBUILD_SCHEME} AND NOT BUILDING ANDROID APP because BUDDYBUILD_SCHEME env is set"
fi