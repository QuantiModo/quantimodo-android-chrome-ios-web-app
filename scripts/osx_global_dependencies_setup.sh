#!/usr/bin/env bash
OSX_USER=mikesinn
echo "Run sudo visudo and uncomment %wheel ALL=(ALL) NOPASSWD: ALL before running this script"
echo "Adding ${OSX_USER} to wheel group to avoid jenkins slave password issues..."

sudo dseditgroup -o edit -a ${OSX_USER} -t user wheel

/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install imagemagick

echo "Installing PHP dependencies..."
brew install php@7.2
brew install composer

echo "Installing Ruby dependencies..."
brew update && brew install ruby
echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.bash_profile
sudo gem install -n /usr/local/bin fastlane --verbose

echo "Installing NodeJS dependencies..."
brew unlink node
brew install node@10
brew link node@10
echo 'export PATH="/usr/local/opt/node@10/bin:$PATH"' >> ~/.bash_profile

gem install cocoapods


echo "Add this to PATH environmental variable in Jenkins slave node settings for this machine because Jenkins can't pick up the right path for some reason"
echo $PATH

echo "Also run:
    npm rebuild node-sass
    and
    npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli
    npm install -g ios-deploy ios-sim
    in a new terminal"
