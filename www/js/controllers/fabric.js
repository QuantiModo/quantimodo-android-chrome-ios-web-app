angular.module('fabric', ['ng']).config(['$provide', function($provide) {
  $provide.decorator("$exceptionHandler", ['$delegate', function($delegate) {
    return function(exception, cause) {
      $delegate(exception, cause);

      // Decorating standard exception handling behaviour by sending exception to crashlytics plugin
      var message = exception.toString();
      // Here, I rely on stacktrace-js (http://www.stacktracejs.com/) to format exception stacktraces before
      // sending it to the native bridge
      var stacktrace;
      if(typeof exception.stack !== 'undefined'){
         stacktrace = exception.stack.toLocaleString();
      } else {
         stacktrace = "No stack trace provided with exception";
      }
      if (typeof Bugsnag !== "undefined") {
          Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
          Bugsnag.notify("ERROR: " + message, "Stacktrace: " + stacktrace, {}, "error");
      }

      if(typeof navigator !== 'undefined' && typeof navigator.crashlytics !== 'undefined'){
        navigator.crashlytics.logException("ERROR: "+message+", stacktrace: "+stacktrace);
      } else {
        console.debug('navigator.crashlytics is undefined!');
      }
    };
  }]);
}]);