FROM weikinhuang/ionic-android-build

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