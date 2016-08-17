#!/usr/bin/env ruby
require 'xcodeproj'
xcodeprojPath = "platforms/ios/" + ENV['APP_DISPLAY_NAME'] + ".xcodeproj"
xcproj = Xcodeproj::Project.open(xcodeprojPath)
xcproj.recreate_user_schemes
xcproj.save