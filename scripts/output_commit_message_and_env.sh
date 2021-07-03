#!/usr/bin/env bash
set +x
export GIT_COMMIT=${GIT_COMMIT:-${CIRCLE_SHA1}}
export GIT_BRANCH=${TRAVIS_BRANCH:-${GIT_BRANCH}} && export GIT_BRANCH=${BUDDYBUILD_BRANCH:-${GIT_BRANCH}} && export GIT_BRANCH=${CIRCLE_BRANCH:-${GIT_BRANCH}}
COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s)
echo "
============================================================
Building $COMMIT_MESSAGE on ${GIT_BRANCH} as USER: ${USER}
============================================================
"
#printenv
