#!/usr/bin/env ruby
require 'xcodeproj'
if defined?(ENV['APP_DISPLAY_NAME']) # will now return true or false
  print 'APP_DISPLAY_NAME is ' + ENV['APP_DISPLAY_NAME'] + "\n"
else
  print "ERROR: APP_DISPLAY_NAME is not defined!  Build failed!\n" + ENV['APP_DISPLAY_NAME']
end
xcodeprojPath = 'platforms/ios/' + ENV['APP_DISPLAY_NAME'] + '.xcodeproj'
xcproj = Xcodeproj::Project.open(xcodeprojPath)
xcproj.recreate_user_schemes
xcproj.save