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
      qmLog.error("ERROR: " + message, "Stacktrace: " + stacktrace, {groupingHash: message}, "error");
      if(typeof window.fabric !== 'undefined' && typeof window.fabric.Crashlytics !== 'undefined'){
        window.fabric.Crashlytics.addLog("ERROR: "+message+", stacktrace: "+stacktrace);
      } else {
        window.qmLog.debug('window.fabric.Crashlytics is undefined!', null);
      }
    };
  }]);
}]);
