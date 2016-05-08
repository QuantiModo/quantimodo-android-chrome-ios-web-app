#!/usr/bin/env bash

# Usage: Run `bash scripts/create_icons` from the root of repo with icon and splash in resources folder
echo -e "${GREEN}Installing imagemagick package if it doesn't exist. ${NC}"
if ! type "imagemagick" > /dev/null;
  then
  apt-get install imagemagick # For Linux
  echo "If you are using OSX, install https://www.macports.org/install.php and run: 'sudo port install ImageMagick' in a new terminal..."
fi

ionic resources
cp resources/icon.png www/img/icon_700.png
convert resources/icon.png -resize 16x16 www/img/icon_16.png
convert resources/icon.png -resize 48x48 www/img/icon_48.png
convert resources/icon.png -resize 128x128 www/img/icon_128.png
