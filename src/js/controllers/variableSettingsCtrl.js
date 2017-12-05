angular.module('starter').controller('VariableSettingsCtrl', ["$scope", "$state", "$rootScope", "$timeout", "$q",
    "$mdDialog", "$ionicLoading", "$stateParams", "$ionicHistory", "$ionicActionSheet", "qmService", "qmLogService",
    function($scope, $state, $rootScope, $timeout, $q, $mdDialog, $ionicLoading, $stateParams, $ionicHistory,
             $ionicActionSheet, qmService, qmLogService) {
    $scope.controller_name = "VariableSettingsCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.state = {variableObject: null};
    function getVariableName() {
        if($stateParams.variableName){$scope.variableName = $stateParams.variableName;}
        if($stateParams.variableObject){$scope.variableName = $stateParams.variableObject.name;}
        if($scope.variableName){return $scope.variableName;}
        qmLog.error("No variable name in variable settings page!");
        $scope.goBack();
    }
    function getUserVariableWithTags() {
        if(!$scope.state.variableObject){qmService.showBlackRingLoader();}
        qmService.getUserVariablesFromApi({name: getVariableName(), includeTags: true}, function(userVariables){
            qmService.hideLoader();
            if(userVariables && userVariables[0]){
                setVariableObject(userVariables[0]);
            }
        })
    }
    function setVariableObject(variableObject) {
        $scope.state.variableObject = $scope.state.variableObject = variableObject;
        setShowActionSheetMenu(variableObject);
    }
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug('Entering state ' + $state.current.name, null);
        qmService.sendToLoginIfNecessaryAndComeBack();
        $rootScope.hideNavigationMenu = false;
        if($stateParams.variableObject){
            setVariableObject($stateParams.variableObject);
            getUserVariableWithTags();
        } else {
            getUserVariableWithTags();
        }
    });
    function setShowActionSheetMenu(variableObject) {
        $rootScope.showActionSheetMenu = function() {
            qmLogService.debug('variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $scope.state.variableObject: ', null, variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    qmService.actionSheetButtons.measurementAddVariable,
                    qmService.actionSheetButtons.reminderAdd,
                    qmService.actionSheetButtons.chartSearch,
                    qmService.actionSheetButtons.historyAllVariable,
                    { text: '<i class="icon ion-pricetag"></i>Tag ' + qmService.getTruncatedVariableName(variableObject.name)},
                    { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() { qmLogService.debug('CANCELLED', null); },
                buttonClicked: function(index) {
                    if(index === 0){qmService.goToState('app.measurementAddVariable', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 2) {qmService.goToState('app.charts', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 3) {qmService.goToState('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 4) {qmService.goToState('app.tagSearch',  {fromState: $state.current.name, userTaggedVariableObject: variableObject}); }
                    if(index === 5) {$scope.tagAnotherVariable(variableObject);}
                    return true;
                },
                destructiveButtonClicked: function() {qmService.showDeleteAllMeasurementsForVariablePopup(variableObject.name); return true;}
            });
            qmLogService.debug('Setting hideSheet timeout', null);
            $timeout(function() { hideSheet(); }, 20000);
        };
    }
    $scope.openTagVariableSearchDialog = function($event) {
        function selectVariable(selectedVariable) {
            var userTagData;
            if($scope.state.variableObject.unit.abbreviatedName !== '/5'){
                qmService.goToState('app.tagAdd', {
                    userTaggedVariableObject: $scope.state.variableObject,
                    fromState: $state.current.name,
                    fromStateParams: {variableObject: $scope.state.variableObject},
                    userTagVariableObject: selectedVariable
                });
            } else {
                userTagData = {userTagVariableId: selectedVariable.id, userTaggedVariableId: $scope.state.variableObject.id, conversionFactor: 1};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function (response) {
                    $scope.state.variableObject = response.data.userTaggedVariable;
                    qmService.hideLoader();
                });
            }
        }
        var dataToPass = {
            title: 'Add a Tag',
            helpText: "Search for a variable like an ingredient or category " +
            "that you'd like to tag " + $scope.state.variableObject.name.toUpperCase() + " with.  Then " +
            "when your tag variable is analyzed, measurements from " +
            $scope.state.variableObject.name.toUpperCase() + " will be included.",
            placeholder: "Search for a tag...",
            buttonText: "Select Variable",
            requestParams: {includePublic: true, taggedVariableId: $scope.state.variableObject.id},
            excludeLocal: true // Necessary because API does complex filtering
        };
        qmService.showVariableSearchDialog(dataToPass, selectVariable, null, $event);
    };
    $scope.openTagVariableSearchDialog = function($event) {
        function selectVariable(selectedVariable) {
            var userTagData;
            if($scope.state.variableObject.unit.abbreviatedName !== '/5'){
                qmService.goToState('app.tagAdd', {
                    userTagVariableObject: $scope.state.variableObject,
                    fromState: $state.current.name,
                    fromStateParams: {variableObject: $scope.state.variableObject},
                    userTaggedVariableObject: selectedVariable
                });
            } else {
                userTagData = {userTaggedVariableId: selectedVariable.id, userTagVariableId: $scope.state.variableObject.id, conversionFactor: 1};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function (response) {
                    $scope.state.variableObject = response.data.userTagVariable;
                    qmService.hideLoader();
                });
            }
        }
        var dataToPass = {
            title: 'Tag another variable',
            helpText: "Search for a variable " +
            " for which " + $scope.state.variableObject.name.toUpperCase() + " is an ingredient or category.  Then " +
            "when " + $scope.state.variableObject.name.toUpperCase() + " is analyzed, measurements from " +
            "your tagged variable will also be included.",
            placeholder: "Search for a variable to tag...",
            buttonText: "Select Variable",
            requestParams: {includePublic: true, tagVariableId: $scope.state.variableObject.id},
            excludeLocal: true // Necessary because API does complex filtering
        };
        qmService.showVariableSearchDialog(dataToPass, selectVariable, null, $event);
    };
    $scope.openJoinVariableSearchDialog = function($event) {
        function selectVariable(selectedVariable) {
            var variableData = {
                parentVariableId: $scope.state.variableObject.id,
                joinedVariableId: selectedVariable.id,
                conversionFactor: 1
            };
            qmService.postVariableJoinDeferred(variableData).then(function (response) {
                qmService.hideLoader();
                $scope.state.variableObject = response.data.parentVariable;
            }, function (error) {
                qmService.hideLoader();
                qmLogService.error(null, error);
            });
            $mdDialog.hide();
        }
        var dataToPass = {
            title: 'Join a Duplicate',
            helpText: "Search for a duplicated or synonymous variable that you'd like to join to " +
                $scope.state.variableObject.name + ". Once joined, its measurements will be included in the analysis of " +
                $scope.state.variableObject.name + ".  You can only join variables that have the same unit " +
                $scope.state.variableObject.unit.abbreviatedName + ".",
            placeholder: "What variable would you like to join?",
            buttonText: "Select Variable",
            requestParams: {includePublic: true, joinVariableId: $scope.state.variableObject.id},
            excludeLocal: true // Necessary because API does complex filtering
        };
        qmService.showVariableSearchDialog(dataToPass, selectVariable, null, $event);
    };
    var SelectWikipediaArticleController = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService, $q, $log, dataToPass) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dataToPass.title;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.getHelp = function(){
            if(self.helpText && !self.showHelp){return self.showHelp = true;}
            qmService.goToState(window.qmStates.help);
            $mdDialog.cancel();
        };
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event, variableName) { $mdDialog.hide($scope.variable); };
        function querySearch (query) {
            self.notFoundText = "No articles matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            if(!query || !query.length){ query = dataToPass.variableName; }
            wikipediaFactory.searchArticles({
                term: query, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
                //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (repsonse) {
                if(repsonse.data.query) {
                    deferred.resolve(loadAll(repsonse.data.query.pages));
                    $scope.causeWikiEntry = repsonse.data.query.pages[0].extract;
                    if(repsonse.data.query.pages[0].thumbnail){$scope.causeWikiImage = repsonse.data.query.pages[0].thumbnail.source;}
                } else {
                    var error = 'Wiki not found for ' + query;
                    qmLogService.error(null, error);
                    qmLogService.error(null, error);
                }
            }).catch(function (error) {qmLogService.error(null, error);});
            return deferred.promise;
        }
        function searchTextChange(text) { qmLogService.debug('Text changed to ' + text, null); }
        function selectedItemChange(item) {
            $scope.state.variableObject.wikipediaPage = item.page;
            $scope.state.variableObject.wikipediaExtract = item.page.extract;
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(pages) {
            if(!pages){ return []; }
            return pages.map( function (page) {
                return {
                    value: page.title,
                    display: page.title,
                    page: page,
                };
            });
        }
    };
    SelectWikipediaArticleController.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "qmLogService", "$q", "$log", "dataToPass"];
    $scope.searchWikipediaArticle = function (ev) {
        $mdDialog.show({
            controller: SelectWikipediaArticleController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: "Select Wikipedia Article",
                    helpText: "Change the search query until you see a relevant article in the search results.  This article will be included in studies involving this variable.",
                    placeholder: "Search for a Wikipedia article...",
                    buttonText: "Select Article",
                    variableName: $scope.state.variableObject.name
                }
            },
        }).then(function(page) {
            $scope.state.variableObject.wikipediaPage = page;
        }, function() {
            qmLogService.debug('User cancelled selection', null);
        });
    };
    $scope.resetVariableToDefaultSettings = function(variableObject) {
        // Populate fields with original settings for variable
        qmService.showBlackRingLoader();
        qmService.resetUserVariableDeferred(variableObject.id).then(function(userVariable) {
            $scope.state.variableObject = userVariable;
            //qmService.addWikipediaExtractAndThumbnail($scope.state.variableObject);
        });
    };
    $scope.saveVariableSettings = function(variableObject){
        qmService.showBlackRingLoader();
        var experimentEndTimeString, experimentStartTimeString = null;
        if(variableObject.experimentStartTimeString){
            try {
                experimentStartTimeString = variableObject.experimentStartTimeString.toISOString();
            } catch (error){
                qmLogService.error(null, 'Could not convert experimentStartTimeString to ISO format', {experimentStartTimeString: variableObject.experimentStartTimeString, errorMessage: error});
            }
        }
        if(variableObject.experimentEndTimeString){
            try {
                experimentEndTimeString = variableObject.experimentEndTimeString.toISOString();
            } catch (error){
                qmLogService.error(null, 'Could not convert experimentEndTimeString to ISO format', {experimentEndTimeString: variableObject.experimentEndTimeString, errorMessage: error});
            }
        }
        console.log("debugMode is " + window.debugMode);
        var body = {
            variableId: variableObject.id,
            durationOfAction: variableObject.durationOfActionInHours*60*60,
            fillingValue: variableObject.fillingValue,
            //joinWith
            maximumAllowedValue: variableObject.maximumAllowedValue,
            minimumAllowedValue: variableObject.minimumAllowedValue,
            onsetDelay: variableObject.onsetDelayInHours*60*60,
            combinationOperation: variableObject.combinationOperation,
            shareUserMeasurements: variableObject.shareUserMeasurements,
            defaultUnitId: variableObject.userVariableDefaultUnitId,
            userVariableVariableCategoryName: variableObject.userVariableVariableCategoryName,
            //userVariableAlias: $scope.state.userVariableAlias
            experimentStartTimeString: experimentStartTimeString,
            experimentEndTimeString: experimentEndTimeString
        };
        qmService.postUserVariableDeferred(body).then(function(userVariable) {
            qmService.hideLoader();
            qmService.showInfoToast('Saved ' + variableObject.name + ' settings');
            $scope.goBack({variableObject: userVariable});  // Temporary workaround to make tests pass
        }, function(error) {
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
    $scope.deleteTaggedVariable = function(taggedVariable) {
        taggedVariable.hide = true;
        var userTagData = {userTagVariableId: $scope.state.variableObject.id, userTaggedVariableId: taggedVariable.id};
        qmService.deleteUserTagDeferred(userTagData);
    };
    $scope.deleteTagVariable = function(tagVariable) {
        tagVariable.hide = true;
        var userTagData = {userTaggedVariableId: $scope.state.variableObject.id, userTagVariableId: tagVariable.id};
        qmService.deleteUserTagDeferred(userTagData);
    };
    $scope.editTag = function(userTagVariable){
        qmService.goToState('app.tagAdd', {
            tagConversionFactor: userTagVariable.tagConversionFactor,
            userTaggedVariableObject: $scope.state.variableObject,
            fromState: $state.current.name,
            userTagVariableObject: userTagVariable
        });
    };
    $scope.editTagged = function(userTaggedVariable){
        qmService.goToState('app.tagAdd', {
            tagConversionFactor: userTaggedVariable.tagConversionFactor,
            userTaggedVariableObject: userTaggedVariable,
            fromState: $state.current.name,
            userTagVariableObject: $scope.state.variableObject
        });
    };
    $scope.refreshUserVariable = function (hideLoader) {
        var refresh = true;
        if($scope.state.variableObject && $scope.state.variableObject.name !== variableName){ $scope.state.variableObject = null; }
        if(!hideLoader){ qmService.showBlackRingLoader(); }
        var params = {includeTags : true};
        qmService.getUserVariableByNameFromLocalStorageOrApiDeferred(variableName, params, refresh).then(function(variableObject){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            $scope.state.variableObject = variableObject;
            //qmService.addWikipediaExtractAndThumbnail($scope.state.variableObject);
            qmService.setupVariableByVariableObject(variableObject);
        }, function (error) {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
}]);
