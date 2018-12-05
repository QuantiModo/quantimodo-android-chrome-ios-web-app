#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ANDROID_SDK_FILENAME=android-sdk_r24.2-linux.tgz
ANDROID_SDK=http://dl.google.com/android/$ANDROID_SDK_FILENAME

#sudo apt-get install python-software-properties
#sudo add-apt-repository ppa:webupd8team/java
apt-get update
apt-get install -y npm git openjdk-7-jdk ant expect
npm install -g n
n stable

cd ~ && curl -O $ANDROID_SDK
cd ~ && tar -xzvf $ANDROID_SDK_FILENAME
cd ~ && sudo chown -R vagrant android-sdk-linux/

echo "ANDROID_HOME=~/android-sdk-linux" >> /home/vagrant/.bashrc
echo "export JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64" >> /home/vagrant/.bashrc
echo "PATH=\$PATH:~/android-sdk-linux/tools:~/android-sdk-linux/platform-tools" >> /home/vagrant/.bashrc

npm install -g cordova
npm install -g ionic

bash $DIR/android_22install



cd $DIR
sudo npm i -g gulp grunt-cli bower yo generator-ionic-gulp
npm rebuild node-sass --no-bin-links
npm install --no-bin-links

sudo chown -R vagrant:vagrant /home/vagrant

ionic state reset

#sudo gem install sass

echo "Please restart your computer now..."