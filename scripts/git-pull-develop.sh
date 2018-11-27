#!/usr/bin/env bash
echo "Pruning remote branches no longer on remote"
git -c diff.mnemonicprefix=false -c core.quotepath=false fetch --prune origin
git checkout develop
git pull
echo "Deleting local branches that have been merged to develop already"
git branch --merged | egrep -v "(^\*|master|dev)" | xargs -r git branch -d
sleep 10