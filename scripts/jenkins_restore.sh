#!/usr/bin/env bash
export JENKINS_HOME=/var/lib/jenkins/

export QM_DOCKER_PATH=/vagrant
echo "QM_DOCKER_PATH is $QM_DOCKER_PATH"

#export SYNCTHING_FOLDER=${QM_DOCKER_PATH}/syncthing

#mkdir ${SYNCTHING_FOLDER} || true
#export JENKINS_BACKUP_FOLDER=${SYNCTHING_FOLDER}/jenkins

export JENKINS_BACKUP_FOLDER=/vagrant/backups/jenkins-backup

sudo /etc/init.d/jenkins stop
#cd ${JENKINS_BACKUP_FOLDER}
#tar xzvf jenkins-backup.tar.gz
sudo cp -R ${JENKINS_BACKUP_FOLDER}/* ${JENKINS_HOME}
sudo chown jenkins:jenkins -R ${JENKINS_HOME}
sudo /etc/init.d/jenkins start