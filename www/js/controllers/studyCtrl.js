angular.module('starter')
	.controller('StudyCtrl', function($scope, $state, quantimodoService, $stateParams, $ionicHistory, $rootScope,
                                      $timeout, $ionicLoading, wikipediaFactory, $ionicActionSheet, clipboard) {

		$scope.controller_name = "StudyCtrl";
        $rootScope.showFilterBarSearchIcon = false;

        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            $rootScope.getAllUrlParams();
        });

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $rootScope.hideNavigationMenu = false;
            $scope.state = {
                title: 'Loading study...',
                requestParams: {},
                hideStudyButton: true,
                loading: true
            };

            console.debug($state.current.name + ' initializing...');

            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

            if($rootScope.urlParameters.causeVariableName){
                $scope.state.requestParams.causeVariableName = $rootScope.urlParameters.causeVariableName;
            }

            if($rootScope.urlParameters.effectVariableName){
                $scope.state.requestParams.effectVariableName = $rootScope.urlParameters.effectVariableName;
            }

            if($rootScope.urlParameters.userId){
                getStudy();
                return;
            }

            if($stateParams.correlationObject){
                $scope.correlationObject = $stateParams.correlationObject;
                $scope.state.loading = false;
                quantimodoService.setLocalStorageItem('lastStudy', JSON.stringify($scope.correlationObject));
                $ionicLoading.hide();
            }

            if($scope.correlationObject){
                $scope.state.requestParams = {
                    causeVariableName: $scope.correlationObject.causeVariableName,
                    effectVariableName: $scope.correlationObject.effectVariableName
                };
                //addWikipediaInfo();
                if($scope.correlationObject.userId && !$scope.correlationObject.scatterPlotConfig){
                    getStudy();
                }
                return;
            }

            if(!$scope.state.requestParams.effectVariableName){
                quantimodoService.getLocalStorageItemAsStringWithCallback('lastStudy', function (lastStudy) {
                    if(lastStudy){
                        $scope.correlationObject = JSON.parse(lastStudy);
                        $scope.highchartsReflow();  //Need callback to make sure we get the study before we reflow
                    }
                });
                $scope.state.loading = false;
                $scope.state.requestParams = {
                    causeVariableName: $scope.correlationObject.causeVariableName,
                    effectVariableName: $scope.correlationObject.effectVariableName
                };

                //addWikipediaInfo();
                if($scope.correlationObject.userId && !$scope.correlationObject.scatterPlotConfig){
                    getStudy();
                }
            } else {
                getStudy();
            }
        });

        $scope.refreshStudy = function() {
            quantimodoService.clearCorrelationCache();
            getStudy();
        };

        $scope.joinStudy = function () {
            $state.go('app.studyJoin', {correlationObject: $scope.correlationObject});
        };

        if (!clipboard.supported) {
            console.debug('Sorry, copy to clipboard is not supported');
            $scope.hideClipboardButton = true;
        }

        $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
        $scope.copyStudyUrlToClipboard = function () {
            $scope.copyLinkText = 'Copied!';
            var studyLink;
            if($scope.correlationObject.studyLinkStatic){
                studyLink = $scope.correlationObject.studyLinkStatic;
            }
            if($scope.correlationObject.userStudy && $scope.correlationObject.userStudy.studyLinkStatic){
                studyLink = $scope.correlationObject.userStudy.studyLinkStatic;
            }
            if($scope.correlationObject.publicStudy && $scope.correlationObject.publicStudy.studyLinkStatic){
                studyLink = $scope.correlationObject.publicStudy.studyLinkStatic;
            }
            clipboard.copyText(studyLink);
        };

        function addWikipediaInfo() {
            $scope.causeWikiEntry = null;
            $scope.causeWikiImage = null;
            $scope.effectWikiEntry = null;
            $scope.effectWikiImage = null;

            var causeSearchTerm = $scope.correlationObject.causeVariableCommonAlias;
            if(!causeSearchTerm){
                causeSearchTerm = $scope.state.requestParams.causeVariableName;
            }

            wikipediaFactory.searchArticlesByTitle({
                term: causeSearchTerm, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: '1', // (optional) 'max': extracts for all articles, otherwise only for the first
                exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (causeData) {
                if(causeData.data.query) {
                    $scope.causeWikiEntry = causeData.data.query.pages[0].extract;
                    //$scope.correlationObject.studyBackground = $scope.correlationObject.studyBackground + '<br>' + $scope.causeWikiEntry;
                    if(causeData.data.query.pages[0].thumbnail){
                        $scope.causeWikiImage = causeData.data.query.pages[0].thumbnail.source;
                    }
                    //on success
                } else {
                    var error = 'Wiki not found for ' + causeSearchTerm;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                    console.error(error);
                }
            }).catch(function (error) {
                console.error(error);
                //on error
            });

            var effectSearchTerm = $scope.correlationObject.effectVariableCommonAlias;
            if(!effectSearchTerm){
                effectSearchTerm = $scope.state.requestParams.effectVariableName;
            }

            wikipediaFactory.searchArticlesByTitle({
                term: effectSearchTerm, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: '1', // (optional) 'max': extracts for all articles, otherwise only for the first
                exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (effectData) {
                if(effectData.data.query){
                    $scope.effectWikiEntry = effectData.data.query.pages[0].extract;
                    //$scope.correlationObject.studyBackground = $scope.correlationObject.studyBackground + '<br>' + $scope.effectWikiEntry;
                    if(effectData.data.query.pages[0].thumbnail){
                        $scope.effectWikiImage = effectData.data.query.pages[0].thumbnail.source;
                    }

                } else {
                    var error = 'Wiki not found for ' + effectSearchTerm;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                    console.error(error);
                }

                //on success
            }).catch(function (error) {
                console.error(error);
                //on error
            });
        }

        $scope.weightedPeriod = 5;

        $scope.createUserCharts = function() {
            $scope.loadingCharts = false;
            $scope.state.loading = false;
            $scope.causeTimelineChartConfig = quantimodoService.processDataAndConfigureLineChart(
                $scope.correlationObject.causeProcessedDailyMeasurements,
                {variableName: $scope.state.requestParams.causeVariableName});
            $scope.effectTimelineChartConfig = quantimodoService.processDataAndConfigureLineChart(
                $scope.correlationObject.effectProcessedDailyMeasurements,
                {variableName: $scope.state.requestParams.effectVariableName});

            $scope.highchartsReflow();
            $ionicLoading.hide();
        };

        function getStudy() {
            $scope.loadingCharts = true;
            quantimodoService.getStudyDeferred($scope.state.requestParams).then(function (data) {
                if(data.userStudy){
                    $scope.correlationObject = data.userStudy;
                }
                if(data.publicStudy){
                    $scope.correlationObject = data.publicStudy;
                }
                quantimodoService.setLocalStorageItem('lastStudy', JSON.stringify($scope.correlationObject));
                $scope.createUserCharts();
            }, function (error) {
                console.error(error);
                $scope.loadingCharts = false;
                $scope.state.loading = false;
                $scope.state.studyNotFound = true;
                $scope.state.title = 'Study Not Found';
            });
        }

        $rootScope.showActionSheetMenu = function() {

            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-log-in"></i>' + $scope.correlationObject.causeVariableName.substring(0,15) + ' Settings' },
                    { text: '<i class="icon ion-log-out"></i>' + $scope.correlationObject.effectVariableName.substring(0,15) + ' Settings' },
                    { text: '<i class="icon ion-thumbsup"></i> Seems Right' },
                ],
                destructiveText: '<i class="icon ion-thumbsdown"></i>Seems Wrong',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug($state.current.name + ": " + 'CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug($state.current.name + ": " + 'BUTTON CLICKED', index);
                    if(index === 0){
                        $state.go('app.variableSettings',
                            {variableName: $scope.correlationObject.causeVariableName});
                    }
                    if(index === 1){
                        $state.go('app.variableSettings',
                            {variableName: $scope.correlationObject.effectVariableName});
                    }
                    if(index === 2){
                        $scope.upVote($scope.correlationObject);
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.downVote($scope.correlationObject);
                    return true;
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);
        };
	});
