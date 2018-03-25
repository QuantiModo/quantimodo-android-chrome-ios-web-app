var fs = require('fs');

console.log("EXECUTING after_prepart ios_remove_armv7s.js hook: Remove the `armv7s` architecture from the build process, which " +
    " causes various build errors, especially with `cordova-plugin-facebook4`.");

module.exports = function(ctx) {
  if (ctx.opts.platforms.indexOf('ios') < 0) {
    return;
  }

  var buildCfgPath = 'platforms/ios/cordova';
  var buildCfg = 'build-debug.xcconfig';

  if (ctx.opts.options.release === true) {
    buildCfg = 'build-release.xcconfig';
  }

  var deferral = ctx.requireCordovaModule('q').defer();

  var inLines = function(lines, thing) {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(thing) !== -1) {
        return true;
      }
    }

    return false;
  };

  fs.readFile(buildCfgPath + '/' + buildCfg, function(err, data) {
    if (err) {
      console.error(err);
      deferral.reject("error reading file");
    }

    var lines = data.toString().split('\n');

    if (!inLines(lines, 'ARCHS')) {
      fs.appendFile(buildCfgPath + '/' + buildCfg, 'ARCHS = armv7 arm64', function(err) {
        if (err) {
          console.error(err);
          deferral.reject("error writing to file");
        }

        deferral.resolve();
      });
    } else {
      deferral.resolve();
    }
  });

  return deferral.promise;
};
