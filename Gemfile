source "https://rubygems.org"

gem "fastlane"
gem 'travis'
#gem 'fastlane-plugin-cordova'
#gem 'fastlane-plugin-ionic'
#gem 'fastlane-plugin-upgrade_super_old_xcode_project'

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
