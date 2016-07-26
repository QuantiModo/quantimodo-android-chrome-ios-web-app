angular.module('fabric', ['ng']).config(['$provide', function($provide, $ionicHistory) {
  $provide.decorator("$exceptionHandler", ['$delegate', function($delegate, $ionicHistory, $state) {
    return function(exception, cause) {
      $delegate(exception, cause);

      // Decorating standard exception handling behaviour by sending exception to crashlytics plugin
      var message = exception.toString();
      var ionicViewHistory = {};
      // Here, I rely on stacktrace-js (http://www.stacktracejs.com/) to format exception stacktraces before
      // sending it to the native bridge
      var stacktrace;
      if(typeof exception.stack !== 'undefined'){
         stacktrace = exception.stack.toLocaleString();
      } else {
         stacktrace = "No stack trace provided with exception";
      }
        Bugsnag.apiKey = window.private_keys.bugsnag_key;
      if(typeof $ionicHistory !== "undefined"){
        ionicViewHistory = $ionicHistory.viewHistory();
      } else {
        ionicViewHistory = "$ionicHistory is undefined in fabric.js";
      }
        Bugsnag.notify("ERROR: "+$state.current.name, "ionic history backView: "+ JSON.stringify(ionicViewHistory), ionicViewHistory, "error");
      Bugsnag.notify("ERROR: "+message, "Stacktrace: "+stacktrace, {}, "error");
      if(typeof navigator !== 'undefined' && typeof navigator.crashlytics !== 'undefined'){
        navigator.crashlytics.logException("ERROR: "+message+", stacktrace: "+stacktrace);
      } else {
        console.debug('navigator.crashlytics is undefined!');
      }
    };
  }]);
}]);