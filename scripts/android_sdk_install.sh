#!/usr/bin/env bash
# install java
apt-get install -y software-properties-common
apt-add-repository -y ppa:webupd8team/java
apt-get update
apt-get install -y oracle-java8-installer

# download latest android sdk
# http://developer.android.com/sdk/index.html#Other
cd /opt
wget http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz

tar -xvf android-sdk*-linux.tgz
cd android-sdk-linux/tools
./android update sdk --no-ui --filter platform,platform-tools

# set path
echo 'export PATH=$PATH:/opt/android-sdk-linux/platform-tools' >> /etc/profile.d/android.sh
echo 'export ANDROID_TOOLS=/opt/android-sdk-linux' >> /etc/profile.d/android.sh
source /etc/profile.d/android.sh

# add i386 support
dpkg --add-architecture i386
apt-get update
apt-get install -y libc6:i386 libstdc++6:i386 zlib1g:i386

# install sdks
cd /opt/android-sdk-linux/tools
./android list sdk --all
./android update -u -t 1,2,4,26,103

sudo chmod -R 777 /opt/android-sdk-linux/
sudo /opt/android-sdk-linux/tools/android update sdk -u --all --filter platform-tool,android-23,build-tools-23.0.1,extra-android-support

sudo mkdir /opt/android-sdk-linux/licenses
sudo cp ${IONIC_PATH}/android-licenses/* /opt/android-sdk-linux/licenses/
sudo chmod -R 777 /opt/android-sdk-linux/licenses