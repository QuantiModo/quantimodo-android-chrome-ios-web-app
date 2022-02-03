angular.module('starter').controller('StudiesCtrl',
    ["$scope", "$ionicLoading", "$state", "$stateParams", "qmService", "$rootScope", "$ionicActionSheet", "$mdDialog",
    function($scope, $ionicLoading, $state, $stateParams, qmService, $rootScope, $ionicActionSheet, $mdDialog){
        $scope.controller_name = "StudiesCtrl";
        $scope.state = {
            variableName: null,
            studiesResponse: {studies: []},
            showLoadMoreButton: false,
            title: "Studies"
        };
        $scope.data = {"search": ''};
        $scope.filterSearchQuery = '';
        $scope.searching = true;
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info('beforeEnter state ' + $state.current.name);
            $scope.showSearchFilterBox = false;
            qmService.navBar.setFilterBarSearchIcon(true);
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            if($stateParams.requestParams){
                $scope.state.requestParams = $stateParams.requestParams;
            }
            updateNavigationMenuButton();
        });
        function updateNavigationMenuButton(){
            qmService.rootScope.setShowActionSheetMenu(function(){
                // Show the action sheet
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        {text: '<i class="icon ion-arrow-down-c"></i>Descending Significance'},
                        {text: '<i class="icon ion-arrow-down-c"></i>Descending QM Score'},
                        {text: '<i class="icon ion-arrow-down-c"></i>Positive Relationships'},
                        {text: '<i class="icon ion-arrow-up-c"></i>Negative Relationships'},
                        {text: '<i class="icon ion-arrow-down-c"></i>Number of Participants'},
                        {text: '<i class="icon ion-arrow-up-c"></i>Ascending pValue'},
                        {text: '<i class="icon ion-arrow-down-c"></i>Your Down-Votes'},
                        qmService.actionSheets.actionSheetButtons.refresh,
                        qmService.actionSheets.actionSheetButtons.settings
                    ],
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLog.debug('CANCELLED', null);
                    },
                    buttonClicked: function(index, button){
                        if(index === 0){
                            populateStudyListBySortParam('-statisticalSignificance');
                        }
                        if(index === 1){
                            populateStudyListBySortParam('-qmScore');
                        }
                        if(index === 2){
                            populateStudyListBySortParam('correlationCoefficient');
                        }
                        if(index === 3){
                            populateStudyListBySortParam('-correlationCoefficient');
                        }
                        if(index === 4){
                            populateStudyListBySortParam('-numberOfUsers');
                        }
                        if(index === 5){
                            populateStudyListBySortParam('pValue');
                        }
                        if(index === 6){
                            resetAndShowLoader();
                            $scope.state.requestParams.downvoted = true; // Need to attach to scope so it's still included when clicking load more
                            populateStudyList($scope.state.requestParams);
                        }
                        if(index === 7){
                            $scope.refreshList();
                        }
                        if(index === 8){
                            qmService.goToState(qm.staticData.stateNames.settings);
                        }
                        return true;
                    }
                });
            });
        }
        // Have to get url params after entering.  Otherwise, we get params from study if coming back
        $scope.$on('$ionicView.afterEnter', function(e){
            qm.loaders.robots();
            qmLog.info('afterEnter state ' + $state.current.name);
            $scope.state.requestParams.aggregated = qm.urlHelper.getParam('aggregated');
            if(!variablesHaveChanged()){
                return;
            }
            if(getCauseVariableName()){
                $scope.state.requestParams.causeVariableName = getCauseVariableName();
                $scope.state.variableName = getCauseVariableName();
                $scope.outcomeList = true;
            }
            if(getEffectVariableName()){
                $scope.state.requestParams.effectVariableName = getEffectVariableName();
                $scope.state.variableName = getEffectVariableName();
                $scope.predictorList = true;
            }
            if($stateParams.valence === 'positive'){
                $scope.state.requestParams.correlationCoefficient = "(gt)0";
            }
            if($stateParams.valence === 'negative'){
                $scope.state.requestParams.correlationCoefficient = "(lt)0";
            }
            setTitle();
            populateStudyListBySortParam();
        });
        function populateStudyList(params){
            qmLog.info('Getting studies with params ' + JSON.stringify(params));
            qm.studyHelper.getStudiesFromApi(params, function(r){
                if(!r || !r.studies){
                    qm.toast.errorToast("Could not get studies! response: ", r);
                    $scope.goBack();
                    return;
                }
                qmLog.info('Got ' + r.studies.length + ' studies with params ' + JSON.stringify(params));
                if(r && !$scope.state.studiesResponse.studies.length){
                    $scope.state.studiesResponse = r;
                } else if(r.studies.length){
                    qmLog.info('First correlation is ' + r.studies[0].causeVariableName + " vs " +
                        r.studies[0].effectVariableName);
                    if(!params.refresh && $scope.state.studiesResponse.studies){
                        $scope.state.studiesResponse.studies =
                            $scope.state.studiesResponse.studies.concat(r.studies);
                    }else{
                        $scope.state.studiesResponse.studies = r.studies;
                    }
                }else{
                    qmLog.info('Did not get any studies with params ' + JSON.stringify(params));
                    $scope.state.noStudies = true;
                }
                showLoadMoreButtonIfNecessary();
                hideLoader();
            }, function(error){
                hideLoader();
                qmLog.error('studiesCtrl: Could not get studies: ' + JSON.stringify(error));
            });
        }
        function populateStudyListBySortParam(newSortParam, refresh){
            if(newSortParam){
                $scope.state.studiesResponse.studies = [];
                qmLog.debug('Sort by ' + newSortParam);
                $scope.state.requestParams.sort = newSortParam;
            }
            $scope.searching = true;
            var params = $scope.state.requestParams;
            params.open = getOpenParam();
            if(refresh){params.refresh = refresh;}
            params.created = getCreatedParam();
            params.limit = 10;
            populateStudyList(params);
        }
        function getCreatedParam(){
            return qm.parameterHelper.getStateUrlRootScopeOrRequestParam('created', $stateParams, $scope, $rootScope);
        }
        function getOpenParam(){
            return qm.parameterHelper.getStateUrlRootScopeOrRequestParam('open', $stateParams, $scope, $rootScope);
        }
        function setTitle(){
            $scope.state.title = "Studies";
            if(getEffectVariableName()){
                $scope.state.title = "Predictors";
            }
            if(getCauseVariableName()){
                $scope.state.title = "Outcomes";
            }
            if(getCreatedParam()){
                $scope.state.title = "Your Studies";
            }
            if(getOpenParam()){
                $scope.state.title = "Open Studies";
            }
        }
        function variablesHaveChanged(){
            if(!$scope.state.studiesResponse.studies || !$scope.state.studiesResponse.studies.length){
                return true;
            }
            if(getEffectVariableName() && $scope.state.requestParams.effectVariableName &&
                getEffectVariableName() !== $scope.state.requestParams.effectVariableName){
                return true;
            }
            if(getCauseVariableName() && $scope.state.requestParams.causeVariableName &&
                getCauseVariableName() !== $scope.state.requestParams.causeVariableName){
                return true;
            }
            return false;
        }
        function getEffectVariableName(){
            if(qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope)){
                var name = qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope);
                if(name && name.indexOf(':') === 0){
                    qmService.goToState(qm.staticData.stateNames.predictorSearch);
                }
                return name;
            }
            if($stateParams.fallBackToPrimaryOutcome && !getCauseVariableName()){
                return qm.getPrimaryOutcomeVariable().name;
            }
        }
        function getCauseVariableName(){
            var name = qm.studyHelper.getCauseVariableName($stateParams, $scope, $rootScope);
            if(name && name.indexOf(':') === 0){
                qmService.goToState(qm.staticData.stateNames.outcomeSearch);
            }
            return name;
        }
        $rootScope.toggleFilterBar = function(){
            $scope.showSearchFilterBox = !$scope.showSearchFilterBox;
        };
        $scope.filterSearch = function(){
            qmLog.debug($scope.data.search, null);
            if($scope.outcomeList){
                $scope.state.studiesResponse.studies = $scope.state.studiesResponse.studies.filter(function(obj){
                    return obj.effectVariableName.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1;
                });
            }else{
                $scope.state.studiesResponse.studies = $scope.state.studiesResponse.studies.filter(function(obj){
                    return obj.causeVariableName.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1;
                });
            }
            if($scope.data.search.length < 4 || $scope.state.studiesResponse.studies.length){
                return;
            }
            if($scope.outcomeList){
                $stateParams.effectVariableName = '**' + $scope.data.search + '**';
            }else{
                $stateParams.causeVariableName = '**' + $scope.data.search + '**';
            }
            $scope.state.requestParams.offset = null;
            populateStudyListBySortParam();
        };
        function showLoadMoreButtonIfNecessary(){
            if($scope.state.studiesResponse.studies.length &&
                $scope.state.studiesResponse.studies.length % $scope.state.requestParams.limit === 0){
                $scope.state.showLoadMoreButton = true;
            }else{
                $scope.state.showLoadMoreButton = false;
            }
        }
        function hideLoader(){
            $scope.$broadcast('scroll.infiniteScrollComplete');
            qmService.hideLoader();
            $scope.searching = false;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        $scope.loadMore = function(){
            //qmService.showBlackRingLoader();
            if($scope.state.studiesResponse.studies.length){
                $scope.state.requestParams.offset = $scope.state.studiesResponse.studies.length;
                populateStudyListBySortParam();
            }
        };
        $scope.refreshList = function(){
            $scope.state.requestParams.offset = 0;
            populateStudyListBySortParam(null, true);
        };
        $scope.openStore = function(name){
            qmLog.debug('open store for ', null, name); // make url
            name = name.split(' ').join('+'); // launch inAppBrowser
            var url = 'http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k=' + name;
            $scope.openUrl(url);
        };
        function resetAndShowLoader(){
            $scope.state.studiesResponse.studies = [];
            $scope.searching = true;
            qm.loaders.robots();
        }
        $rootScope.openStudySearchDialog = function($event){
            $mdDialog.show({
                controller: StudySearchCtrl,
                controllerAs: 'ctrl',
                templateUrl: 'templates/dialogs/variable-search-dialog.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose: false // I think true causes auto-close on iOS
            });
        };
        var StudySearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, qmService, $q, $log){
            var self = this;
            self.studies = loadAll();
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange = searchTextChange;
            if($stateParams.causeVariableName){
                self.variableName = $stateParams.causeVariableName;
                self.title = "Specific Outcome";
                self.helpText = "Search for an outcome that you think might be influenced by " + self.variableName + ".";
                self.placeholder = "Search for an outcome...";
            }
            if($stateParams.effectVariableName){
                self.variableName = $stateParams.effectVariableName;
                self.title = "Specific Predictor";
                self.helpText = "Search for a factor that you think might influence " + self.variableName + ".";
                self.placeholder = "Search for a predictor...";
            }
            self.helpText = self.helpText + "  Then you can see a study exploring the relationship between those variables.";
            self.getHelp = function(){
                if(self.helpText && !self.showHelp){
                    return self.showHelp = true;
                }
                qmService.goToState(window.qm.staticData.stateNames.help);
                $mdDialog.cancel();
            };
            self.cancel = function(){
                $mdDialog.cancel();
            };
            self.finish = function(){
                qmService.goToStudyPageViaStudy(self.study);
                $mdDialog.hide();
            };
            function querySearch(query){
                self.notFoundText = "I don't have enough data to determine the relationship between " + query + " and " +
                    self.variableName + ".  I generally need about a month of overlapping data for each variable first.  " +
                    "Create some reminders and let's make some discoveries!";
                var deferred = $q.defer();
                var requestParams = {};
                if($stateParams.causeVariableName){
                    requestParams.causeVariableName = $stateParams.causeVariableName;
                    requestParams.effectVariableName = "**" + query + "**";
                }
                if($stateParams.effectVariableName){
                    requestParams.effectVariableName = $stateParams.effectVariableName;
                    requestParams.causeVariableName = "**" + query + "**";
                }
                qm.studyHelper.getStudiesFromApi(requestParams, function(studiesResponse){
                    deferred.resolve(loadAll(studiesResponse.studies));
                }, function(error){
                    deferred.reject(error);
                });
                return deferred.promise;
            }
            function searchTextChange(text){
                $log.debug('Text changed to ' + text, null);
            }
            function selectedItemChange(item){
                self.selectedItem = item;
                self.correlationObject = item.correlationObject;
                self.buttonText = "Go to Study";
                $log.info(null, 'Item changed to ' + item.name, null);
            }
            function loadAll(studies){
                if(!studies){
                    return [];
                }
                return studies.map(function(study){
                    if($stateParams.effectVariableName){
                        return {
                            value: study.causeVariableName.toLowerCase(),
                            name: study.causeVariableName,
                            study: study
                        };
                    }
                    if($stateParams.causeVariableName){
                        return {
                            value: study.effectVariableName.toLowerCase(),
                            name: study.effectVariableName,
                            study: study
                        };
                    }
                });
            }
        };
        StudySearchCtrl.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "$q", "$log"];
    }]);
