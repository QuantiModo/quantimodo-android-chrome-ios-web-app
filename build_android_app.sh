#!/usr/bin/env bash
# Run from root of Ionic repo
# Install docker per https://docs.docker.com/engine/installation/linux/ubuntulinux/
apt-get update
apt-get install apt-transport-https ca-certificates
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
# Delete everything in /etc/apt/sources.list.d/docker.list
# Add `deb https://apt.dockerproject.org/repo ubuntu-trusty main` to /etc/apt/sources.list.d/docker.list
apt-get update
apt-get purge lxc-docker
apt-cache policy docker-engine

# Install Docker
sudo apt-get update
sudo apt-get install -y linux-image-extra-$(uname -r)
sudo apt-get install -y docker-engine
sudo service docker start
# sudo docker run hello-world

# Don't require sudo
sudo usermod -aG docker vagrant
# Log in and out
# docker run hello-world

# Fix Swap
# Edit the /etc/default/grub file and set the GRUB_CMDLINE_LINUX value as follows:  `GRUB_CMDLINE_LINUX="cgroup_enable=memory swapaccount=1`
# sudo update-grub

# https://hub.docker.com/r/mkaag/ionic/  -> Unable to locate package oracle-java7-installed
# https://github.com/nicopace/ionic-cordova-android-vagrant-docker -> nicopace/ionic-cordova-android-vagrant-" is not a valid repository/tag
# https://github.com/gleclaire/docker-ionic-framework -> Error: Please install Android target: "android-22"
# https://hub.docker.com/r/agileek/ionic-framework/


sudo docker run -ti -p 8100:8100 -p 35729:35729 -v /vagrant/public.built/ionic/Modo/:/myApp gleclaire/ionic-framework /bin/bash
# npm install -g ionic
npm install -g ionic
ionic plugin add cordova-plugin-inappbrowser
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
ionic build android