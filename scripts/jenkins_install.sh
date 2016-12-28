#!/usr/bin/env bash

if [[ $EUID -ne 0 ]]; then
	echo "This script must be run as root" 1>&2
	exit 1
fi

# Install the necessary packages to prepare the environment
sudo apt-get update
sudo apt-get install -y autoconf bison build-essential libffi-dev libssl-dev
sudo apt-get install -y libyaml-dev libreadline6 libreadline6-dev zlib1g zlib1g-dev curl git vim

# Install Jenkins
## Before install is necessary to add Jenkins to trusted keys and source list
wget -q -O - http://pkg.jenkins-ci.org/debian/jenkins-ci.org.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins-ci.org/debian binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install -y jenkins

sudo -i
echo 'jenkins   ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
#             ^^
#             tab

sudo usermod -G jenkins vagrant
sudo usermod -G vagrant jenkins

sudo usermod -G jenkins ubuntu
sudo usermod -G ubuntu jenkins

sudo ln -s /var/lib/jenkins/workspace /jenkins

echo "NOW RUN `sudo su` && `visudo -f /etc/sudoers` and  add following line at the end: `jenkins ALL= NOPASSWD: ALL`"