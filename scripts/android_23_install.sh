#!/usr/bin/env bash

#expect -c '
#set timeout -1   ;
#spawn /home/vagrant/android-sdk-linux/tools/android update sdk -u --all
#expect {
#    "Do you accept the license" { exp_send "y\r" ; exp_continue }
#    eof
#}
#'

expect -c '
set timeout -1   ;
spawn /home/vagrant/android-sdk-linux/tools/android update sdk -u --all --filter platform-tool,android-23,build-tools-23.0.1,extra-android-support
expect {
    "Do you accept the license" { exp_send "y\r" ; exp_continue }
    eof
}
'