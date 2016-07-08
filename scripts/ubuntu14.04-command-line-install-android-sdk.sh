# install openjdk
sudo apt-get install openjdk-7-jdk

# download android sdk
wget http://dl.google.com/android/android-sdk_r24.2-linux.tgz

tar -xvf android-sdk_r24.2-linux.tgz
cd android-sdk-linux/tools

# install all sdk packages
./android update sdk --no-ui

# set path
vi ~/.zshrc << EOT

export PATH=${PATH}:$HOME/sdk/android-sdk-linux/platform-tools:$HOME/sdk/android-sdk-linux/tools:$HOME/sdk/android-sdk-linux/build-tools/22.0.1/

EOT

source ~/.zshrc

# adb
sudo apt-get install libc6:i386 libstdc++6:i386
# aapt
sudo apt-get install zlib1g:i386
