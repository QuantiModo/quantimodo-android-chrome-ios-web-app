#!/usr/bin/env bash
echo "See: https://scotch.io/tutorials/testing-angularjs-with-jasmine-and-karma-part-1"
npm install -g nodemon karma-cli
npm install express body-parser morgan path --save
npm install karma karma-jasmine jasmine-core karma-chrome-launcher angular-mocks karma-spec-reporter --save-dev
