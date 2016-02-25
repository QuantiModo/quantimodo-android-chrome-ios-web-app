#!/usr/bin/env ruby
require 'xcodeproj'
xcproj = Xcodeproj::Project.open("platforms/ios/MoodiModo.xcodeproj")
xcproj.recreate_user_schemes
xcproj.save