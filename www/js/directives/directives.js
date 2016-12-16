angular.module('starter')
.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            element.bind('change', function(e) {

                console.debug('onReadFile directive called');

                var onFileReadFn = $parse(attrs.onReadFile);
                var reader = new FileReader();

                reader.onload = function() {
                    var fileContents = reader.result;
                    // invoke parsed function on scope
                    // special syntax for passing in data
                    // to named parameters
                    // in the parsed function
                    // we are providing a value for the property 'contents'
                    // in the scope we pass in to the function
                    scope.$apply(function() {
                        onFileReadFn(scope, {
                            'contents' : fileContents
                        });
                    });
                };
                reader.readAsText(element[0].files[0]);
            });
        }
    };
})

.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);