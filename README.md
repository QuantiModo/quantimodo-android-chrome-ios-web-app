# QuantiModo Ionic App

A generic app that can be easily configured to help the user track and optimize any given outcome variable.

# DEMOS
- [QuantiModo Web App](https://app.quantimo.do)
- [QuantiModo for iOS](https://itunes.apple.com/us/app/quantimodo-life-tracker/id1115037060?mt=8)
- [QuantiModo Chrome Extension ](https://Chrome.google.com/webstore/detail/quantimodo-life-tracking/jioloifallegdkgjklafkkbniianjbgi)
- [QuantiModo for Android](https://play.google.com/store/apps/details?id=com.quantimodo.quantimodo)

# 5-Minute Quick Start
1. Fork this repository.
1. Install [Node.js](http://nodejs.org/).  (Windows Developers: We recommend [Visual Studio Community](https://taco.visualstudio.com/), which automatically installs everything you need!)
1. Install the latest Cordova and Ionic command-line tools in your terminal with `npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli`. # Adding plugins from Github doesn't work on cordova@7.0.0
(Mac Users:  Avoid using `sudo` with your npm commands if possible as it tends to cause problems.)
1. Run `npm install` in the root of this repository.
1. Create your application at [app.quantimo.do/api/v2/apps](https://app.quantimo.do/api/v2/apps).
1. Run `gulp devSetup` in the root of this repository, follow the prompts, and you should see your app at
[http://localhost:8100/#/](http://localhost:8100/#/) or similar.
1. Need help?  Please [create an issue](https://github.com/QuantiModo/quantimodo-android-chrome-ios-web-app/issues) or contact us at [help.quantimo.do](http://help.quantimo.do).

## QuantiModo API
For more info about the types of data you can store and get from the QuantiModo API, try out our
[Interactive API Explorer](https://app.quantimo.do/api/v2/account/api-explorer)

## [Complete Documentation](docs)

## [Contribute](docs/contributing.md)

## Screenshots
<p align="center">
<img src="https://raw.githubusercontent.com/QuantiModo/quantimodo-android-chrome-ios-web-app/develop/resources-shared/screenshots/5.5-inch%20(iPhone%206%2B)%20-%20History%20Screenshot%201.jpg" width="300">
&nbsp
<img src="https://raw.githubusercontent.com/QuantiModo/quantimodo-android-chrome-ios-web-app/develop/resources-shared/screenshots/5.5-inch%20(iPhone%206+)%20-%20import%20data%20Screenshot%201.jpg" width="300">
<br><br>
<img src="https://raw.githubusercontent.com/QuantiModo/quantimodo-android-chrome-ios-web-app/develop/resources-shared/screenshots/5.5-inch%20(iPhone%206+)%20-%20bar%20chart%20Screenshot%201.jpg" width="300">
&nbsp
<img src="https://raw.githubusercontent.com/QuantiModo/quantimodo-android-chrome-ios-web-app/develop/resources-shared/screenshots/5.5-inch%20(iPhone%206+)%20-%20predictors%20Screenshot%201.jpg" width="300">
<br><br>
<img src="https://raw.githubusercontent.com/QuantiModo/quantimodo-android-chrome-ios-web-app/develop/resources-shared/screenshots/5.5-inch%20(iPhone%206+)%20-%20reminder%20inbox%20Screenshot%201.jpg?" width="300">
</p>
  # **Ionic Docker Image**
Ionic docker image for development, build and continous integration (and certainly useful for all Cordova projects in general as well)


## Why
- Installing Java and Android SDK is a pain
- Keeping your Node modules in sync and up-to-date is a pain
- Ensuring all project developers have exactly the same Java version, Android SDK, and node modules is a Sisyphos like task, not to mention your CI environment.
- Using a standardized Docker image and a versionednDocker-Compose file for your project ensures an identical environment for all developers, testers, build bots etc.


## Features
- Based on Ubuntu 16.04
- Minimal assumptions/restrictions regarding your development environment and project structure
- Android SDK, Node, Npm, Yarn, Cordova, Ionic installed
- Easily set package versions (Java, Android, Node, Cordova, Ionic) via cli arguments based on your project requirements
- Map your local Cordova/Ionic project via docker volume
- package.json is continously watched and re-installed on changes
- Yarn available optionally
- Gulp available optionally


## Default versions
The following default versions are installed (for customizing see below):
- Java: 8
- Android platforms: 25
- Android build tools: 25.0.3
- Node: 6.9.5
- Npm: 5.3.0
- Cordova: 6.5.0
- Ionic: 3.6.1
- Typescript: 2.3.4
- Yarn: latest


## Quick start
Create your project directory
```
mkdir demoapp
cd demoapp
```

Download the docker-compose file
```
curl -o docker-compose.yml https://raw.githubusercontent.com/mswag/docker-ionic/master/docker-compose.yml
```

Build the docker image (grab a coffee, this might take a while when you run it the first time)
```
docker-compose build
```
*This will only work, if you have docker already installed on your machine. If not, please look at the Usage section for more instructions.*

Start the development server
```
docker-compose up
```
Congratulations! Look at the default Ionic project at localhost:8100 that is served out of your Docker container.

**If you want to know, how to get your own Ionic project served and built out of the Docker container, follow the instructions below.**


## Usage
1. Install Docker
Install docker for your platform [Linux](https://docs.docker.com/engine/installation/linux/ubuntu/), [Mac](https://docs.docker.com/docker-for-mac/install/) or [Windows](https://docs.docker.com/docker-for-windows/install/).


2. Build your image and start your container
You can build your image and start your container directly with docker. Or you can use docker-compose. In general, we recommend to download our compose file and work with docker-compose.

3. How to develop your local Ionic project in the Docker container
The provided image / container does have an Ionic app setup and installled in the directory /app. This app is only for demo purposes and not intended for development. You you should create / integrate your Ionic project from the host aka your development machine. Therefore, you map your local Ionic project directory to the container via a volume mapping. This will work out of the box if you follow instructions below.

By default, the Docker container has a start script that watches your package.json, which installs on start or on changes.


## Usage with docker-compose

To manage the build and run options in your project via cli parameters is a hassle and does not scale very well in larger project teams. Therefore, we recommend to use a compose file, which can be versioned and should be checked into your project repository.

1. Create your inital docker-compose.yml file

    Download it from our repository into your project root
    ```
    curl -o docker-compose.yml https://raw.githubusercontent.com/mswag/docker-ionic/develop/docker-compose.yml
    ```
    and customize it to your needs. However, the defaults should be good to start with.

2. Build your image

    After customizing your docker-compose file, build your project specific image
    ```
    docker-compose build
    ```

3. Run the container

    The default container command is "ionic serve -b". Thus,  by just starting the container via
    ```
    docker-compose up
    ```
    you will have your development server up and running on port 8100.

    You can change the default command by appending to cli call. E.g. this command
    ```
    docker-compose run ionic npm run test
    ```
    will start the unit tests.

4. Run specific one-off commands
    Use the run commaned for one-off commands. E.g. to build the Android APKs just run
    ```
    docker-compose run ionic ionic build android
    ```

    If you want to check the build configuration of your underlying container, just run
    ```
    docker-compose run ionic cat /image.config
    ```


## Usage with docker

1. Build your custom docker image

    ```
    docker build -tag [IMAGE_NAME] \
                 --build-arg [ARG=VALUE] \
                 https://github.com/mswag/docker-ionic
    ```
    (this might take a while the first time)

    Please choose an appropriate IMAGE_NAME for the built image; the name of your project might be a good idea.

    The following build arguments can be used to customize your image:
    - USER (mandatory, default: ionic): the project user, which will be used to run this Docker container
    - JAVA_VERSION (mandatory, default: 8): the java version that should be installed and used to run the Android SDKstalled and used by Cordova
    - ANDROID_PLATFORMS_VERSION (mandatory, default: 25): the Android SDK Tools platforms version that should be installed and used by Cordova
    - ANDROID_BUILD_TOOLS_VERSION (mandatory, default: 25.0.3): the Android build tools version that should be installed and used by Cordova
    - NODE_VERSION (mandatory, default: 6.9.1): the node version that should be installed globally and used by Cordova and Ionic
    - NPM_VERSION (mandatory, default: 5.3.0): the npm version that will be installed with node globally
    - PACKAGE_MANAGER (mandatory, default: npm): if yarn or npm should be used as package manager
    - CORDOVA_VERSION (mandatory, default: 6.5.0): the Cordova version that will be installed globally and used by Ionic to build the Android APKs
    - IONIC_VERSION (optional, default: 2.2.1): the Ionic version that will be installed globally to power your project
    - TYPESCRIPT_VERSION (optional, default: 2.0.3): the Typescript version that will be installed globally to translate your .ts files
    - GULP_VERSION (optional, default: none): the Gulp version that will be installed globally to run your gulp tasks

    *Example for Ionic 2 project*:
    ```
    docker build --tag my-great-ionic2-project \
                 --build-arg USER="$USER"
                 https://github.com/mswag/docker-ionic
    ```
    This will generate a Docker image named "my-great-ionic2-project" with the default configuration and a user, who's name is identical to the one on the host.


2. Feel free to use your image and connect with a bash shell:

    ```
    docker run --name "my-great-ionic2-project" -it \
               -v $PWD:/app:rw \
               -v /dev/bus/usb:/dev/bus/usb \
               -u `id -u $USER` \
               -p 3000:3000 -p 5000:5000 -p 8100:8100 -p 8080:8080 -p 9876:9876 -p 35729:35729 \
               my-great-ionic2-project-container
    ```
    This will run the created image with the following features:

   - **Project Directory**:

        The option ```-v $PWD:/app:rw``` will map your hosts current directory to /app in the container. This should  allways be our project root directory, where the package.jsons ist provided.

    - **USB Devices**:

        The option ```-v /dev/bus/usb:/dev/bus/usb``` will map your hosts usb ports such that you can build/deploy your project directly to your device.

        **Attention**: this will not work on osx.

    - **Container User Id**

        The option ```-u `id -u $USER``` will run the container with the current user's id. This will avoid permissions issues on the host.

    - **Port Mappings**

        The defined port mappings ("-p") do map the following ports from the container to the host:
        - 3000: Angular Lite Server
        - 5000: node
        - 8100: ionic
        - 8080: webpack
        - 9876: karma
        - 35729: ionic livereload

Now you have a Docker container, that you can use to develop, build and serve your Ionic (or Cordova) project.

