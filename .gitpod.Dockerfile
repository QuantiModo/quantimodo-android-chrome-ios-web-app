FROM gitpod/workspace-full:latest

RUN bash -c ". .nvm/nvm.sh     && nvm install 10     && nvm use 10     && nvm alias default 10"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix