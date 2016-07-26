#!/usr/bin/env bash

# Generate iPhone Portrait Screenshots from 6+ for app store submission.
# Upload screeshot to https://launchkit.io/screenshots/dashboard/, customize and download
# Usage From folder containing downloaded 6+ screenshots and this script run: ./generate_screenshots.sh *.jpg

mkdir -p 3.5
mkdir -p 4.0
mkdir -p 4.7
mkdir -p 5.5

for base in "$@"
do
  WIDTH=`identify -format '%w' -quiet "$base"`
  HEIGHT=`identify -format '%h' -quiet "$base"`
  if [ $WIDTH -eq 1242 -a $HEIGHT -eq 2208 ]; then

    dest=${base//jpg/png}

    convert "$base" -resize 640x1136!    4.0/"$dest"
    convert "$base" -resize 750x1334!    4.7/"$dest"
    cp "$base" 5.5/"$dest"

    echo "remove status bar to save some height for 3.5 3:2 aspect ratio"
    mogrify -crop 1242x2208+0+54 -quiet "$dest"

    echo "resize keeping 16:9 aspect ratio and put it in a 3:2 canvas"
    #convert "$base" -resize 540x960! -gravity center -background transparent -extent 640x960  3.5/"$dest"
    convert "$base" -resize 540x960! -gravity center -background white -extent 640x960  3.5/"$dest"

    #echo "remove base file, we can find it's duplicate at 5.5 folder"
    #rm "$base"

    echo "[OK] $base"

  else
     echo "[ERROR] $base not 6+ Screenshot"
  fi

done
