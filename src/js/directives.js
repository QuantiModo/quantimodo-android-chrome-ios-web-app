angular.module('starter')
.directive( 'creditCardType', function(){
    return {
            require: 'ngModel', link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    scope.ccinfo.type =
                        (/^5[1-5]/.test(value)) ? "mastercard"
                            : (/^4/.test(value)) ? "visa"
                            : (/^3[47]/.test(value)) ? 'amex'
                                : (/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(value)) ? 'discover'
                                    : undefined;
                    ctrl.$setValidity('invalid', !!scope.ccinfo.type);
                    return value;
                });
            }
        };
    }
)
.directive('cardExpiration', function(){
    return {
            require: 'ngModel', link: function (scope, elm, attrs, ctrl) {
                scope.$watch('[ccinfo.month,ccinfo.year]', function (value) {
                    ctrl.$setValidity('invalid', true);
                    if (scope.ccinfo.year === scope.currentYear && scope.ccinfo.month <= scope.currentMonth) {
                        ctrl.$setValidity('invalid', false);
                    }
                    return value;
                }, true);
            }
        };
    }
)
.directive('variableSearch', ["QuantimodoSearchService", function (QuantimodoSearchService) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            console.log("Auto-complete attributes effectOrCause are" + JSON.stringify(attrs.effectOrCause));
            // init jqueryUi auto-complete
            element.autocomplete({
                minLength: 0,
                source: function (request, response) {
                    //do not show results list while searching
                    scope.showResults = false;
                    if (request.term.length >= 3) {
                        request.effectOrCause = attrs.effectOrCause;
                        QuantimodoSearchService.searchVariablesByName(request)
                            .then(function (searchResponse) {
                                if (Array.isArray(searchResponse.data)) {
                                    response(
                                        jQuery.map(searchResponse.data, function (result) {
                                            window.qmLog.debug(result, null);
                                            return {
                                                label: result.name,
                                                value: result.name
                                            };
                                        }));
                                } else {
                                    response(null);
                                }
                            });
                    } else if (request.term.length === 0) {
                        scope.showCorrelations();
                    }
                },
                select: function (event, ui) {
                    ngModel.$setViewValue(ui.item.value);
                    scope.$apply();
                    scope.showCorrelations();
                }
            });
        }
    };
}])
.directive('onReadFile', ["$parse", function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            element.bind('change', function(e) {
                window.qmLog.debug('onReadFile directive called', null);
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
}])
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
}])
.directive('file', function() {
    return {
        restrict: 'AE',
        scope: {
            file: '@'
        },
        link: function(scope, el, attrs){
            el.bind('change', function(event){
                var files = event.target.files;
                var file = files[0];
                scope.file = file;
                scope.$parent.file = file;
                scope.$apply();
            });
        }
    };
})
.directive('lazyLoadData', function($compile) {
    return {
        link: function(scope, el, attrs) {
            var now = new Date().getTime();
            var rep = angular.element(document.getElementsByClassName("md-virtual-repeat-scroller"));
            rep.on('scroll', function(evt){
                if (rep[0].scrollTop + rep[0].offsetHeight >= rep[0].scrollHeight)
                    if (new Date().getTime() - now > 1000) {
                        now = new Date().getTime();
                        scope.$apply(function() {
                            scope.$eval(attrs.lazyLoadData);
                        });
                    }
            });
        }
    };
});
