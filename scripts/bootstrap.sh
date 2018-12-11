#!/usr/bin/env bash
set -x
set -e
ANDROID_SDK_FILENAME=android-sdk_r24.4.1-linux.tgz
ANDROID_SDK=http://dl.google.com/android/${ANDROID_SDK_FILENAME}

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

# update  Ubuntu to newer LTS releases
#sudo apt-get -y dist-upgrade

sudo apt-get install -y git openjdk-8-jdk ant expect nodejs npm
# install 32-bit dependencies of Android build-tools
sudo apt-get install -y lib32gcc1 libc6-i386 lib32z1 lib32stdc++6 lib32ncurses5 lib32gomp1 lib32z1-dev
sudo ln -s /usr/bin/nodejs /usr/bin/node

curl -O ${ANDROID_SDK}
tar -xzvf ${ANDROID_SDK_FILENAME}
sudo chown -R vagrant android-sdk-linux/

echo "ANDROID_HOME=~/android-sdk-linux" >> /home/vagrant/.bashrc
echo "export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64" >> /home/vagrant/.bashrc
echo "PATH=\$PATH:~/android-sdk-linux/tools:~/android-sdk-linux/platform-tools" >> /home/vagrant/.bashrc

sudo npm install -g node-gyp
sudo npm install -g node-sass
sudo npm install -g typings
sudo npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli # Adding plugins from Github doesn't work on cordova@7.0.0
npm install

sudo chown -R vagrant /usr/lib/node_modules
# allow to uninstall/reinstall ionic w/o root
sudo chown -R vagrant /usr/bin/ionic

#add gradle install here
sudo apt-get autoremove

expect -c '
set timeout -1   ;
spawn /home/vagrant/android-sdk-linux/tools/android update sdk -u --all --filter platform-tool,android-22,android-23,build-tools-22.0.1
expect {
    "Do you accept the license" { exp_send "y\r" ; exp_continue }
    eof
}
'

sudo apt-get install -y software-properties-common
sudo apt-add-repository -y ppa:brightbox/ruby-ng
sudo apt-get update
sudo apt-get install -y ruby2.4
sudo apt-get install -y ruby2.4-dev
sudo gem install bundler
bundle install
#sudo gem install sass
