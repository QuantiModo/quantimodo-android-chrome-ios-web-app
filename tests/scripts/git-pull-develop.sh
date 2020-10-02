#!/usr/bin/env bash
stash() {
  # check if we have un-committed changes to stash
  git status --porcelain | grep "^." >/dev/null;
  if [[ $? -eq 0 ]]
  then
    if git stash save -u "git-update on `date`";
    then
      stash=1;
    fi
  fi
}
unstash() {
  # check if we have un-committed change to restore from the stash
  if [[ ${stash} -eq 1 ]]
  then
    git stash pop;
  fi
}
echo "Pruning remote branches no longer on remote"
git -c diff.mnemonicprefix=false -c core.quotepath=false fetch --prune origin
stash=0;
stash;
branch=`git branch | grep "\*" | cut -d " " -f 2-9`;
if [[ "$branch" == "develop" ]]
then
  git pull origin develop;
else
  git checkout develop;
  git pull origin develop;
  #git checkout "$branch";  // If you want to switch back and merge changes
  #git rebase develop;
fi
sleep 3
unstash;
echo "Deleting local branches that have been merged to develop already"
git branch --merged | egrep -v "(^\*|master|dev)" | xargs -r git branch -d
#sleep 10