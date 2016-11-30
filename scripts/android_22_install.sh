#!/usr/bin/env bash

expect -c '
set timeout -1   ;
spawn /home/vagrant/android-sdk-linux/tools/android update sdk -u --all --filter platform-tool,android-22,build-tools-22.0.1,extra-android-support
expect {
    "Do you accept the license" { exp_send "y\r" ; exp_continue }
    eof
}
'
