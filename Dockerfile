FROM weikinhuang/ionic-android-build:latest@sha256:8a3554595e8a23ab68484ceb4cfdb91ebd4fdbe10310260242ed4e4448082d9c

# expose the ionic development ports
EXPOSE 8100 35729

# copy project
COPY . /data

# set up ionic requirements
WORKDIR /data

# restore ionic state
RUN npm install --quiet
RUN bower install --quiet --allow-root
RUN ionic state reset