angular.module('starter').controller('VariableSettingsCtrl', ["$scope", "$state", "$rootScope", "$timeout", "$q",
    "$mdDialog", "$ionicLoading", "$stateParams", "$ionicHistory", "$ionicActionSheet", "qmService", "qmLogService",
    function($scope, $state, $rootScope, $timeout, $q, $mdDialog, $ionicLoading, $stateParams, $ionicHistory,
             $ionicActionSheet, qmService, qmLogService) {
    $scope.controller_name = "VariableSettingsCtrl";
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.state = {variableObject: null};
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug('Entering state ' + $state.current.name, null);
        qmService.login.sendToLoginIfNecessaryAndComeBack();
        qmService.navBar.showNavigationMenu();
        if(qmService.variableIdToGetOnReturnToSettings){
            getUserVariableWithTags(qmService.variableIdToGetOnReturnToSettings);
            qm.userVariables.getFromLocalStorageOrApi({id: qmLogService.variableIdToGetOnReturnToSettings}, function (variables) {
                setVariableObject(variables[0])
            });
            delete qmService.variableIdToGetOnReturnToSettings;
        } else if ($stateParams.variableObject){
            setVariableObject($stateParams.variableObject);
            getUserVariableWithTags();
        } else {
            getUserVariableWithTags();
        }
    });
    $scope.$on("$ionicView.afterEnter", function() {
            qm.loaders.robots();
        });
    function getVariableParams() {
        var params = {includeTags: true};
        params = qmService.stateHelper.addVariableNameOrIdToRequestParams(params, $scope, $stateParams);
        return params;
    }
    function getUserVariableWithTags() {
        if(!$scope.state.variableObject){qmService.showBlackRingLoader();}
        var params = getVariableParams();
        if(!params){
            $scope.goBack();
            return;
        }
        $scope.state.loading = true;
        qm.userVariables.getFromApi(params, function(userVariables){
            qmService.hideLoader();
            $scope.state.loading = false;
            if(userVariables && userVariables[0]){
                setVariableObject(userVariables[0]);
            }
        })
    }
    function setVariableObject(variableObject) {
        $scope.state.variableObject = $scope.state.variableObject = variableObject;
        if(!$scope.variableName){$scope.variableName = variableObject.name;}
        setShowActionSheetMenu(variableObject);
    }
    function setShowActionSheetMenu(variableObject) {
        qmService.rootScope.setShowActionSheetMenu(function() {
            qmLogService.debug('variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $scope.state.variableObject: ', null, variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    qmService.actionSheets.actionSheetButtons.measurementAddVariable,
                    qmService.actionSheets.actionSheetButtons.reminderAdd,
                    qmService.actionSheets.actionSheetButtons.chartSearch,
                    qmService.actionSheets.actionSheetButtons.historyAllVariable,
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
        });
    }
    var dialogParameters = {
        buttonText: "Select Variable",
        excludeLocal: true, // Necessary because API does complex filtering
        minLength: 2
    };
    function getConversionFactor(conversionFactor){
        if($scope.state.variableObject.unit.abbreviatedName === "/5"){
            return 1;
        }
        return conversionFactor;
    }
    function openTagVariableSearchDialog($event, requestParams, dialogParameters) {
        requestParams.includePublic = true;
        function selectVariable(selectedVariable) {
            var userTagData;
            if(!getConversionFactor(dialogParameters.conversionFactor)){
                goToAddTagState({
                    userTaggedVariableObject: $scope.state.variableObject,
                    userTagVariableObject: selectedVariable
                });
            } else {
                userTagData = {userTagVariableId: selectedVariable.id, userTaggedVariableId: $scope.state.variableObject.id,
                    conversionFactor: getConversionFactor(dialogParameters.conversionFactor)};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function (response) {
                    $scope.state.variableObject = response.data.userTaggedVariable;
                    qmService.hideLoader();
                });
            }
        }
        dialogParameters.requestParams = requestParams;
        qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, $event);
    }
    function goToAddTagState(stateParams){
        stateParams.fromState = $state.current.name;
        stateParams.fromStateParams = {variableObject: $scope.state.variableObject};
        qmService.variableIdToGetOnReturnToSettings = $scope.state.variableObject.id;
        qmService.goToState(qmStates.tagAdd, stateParams);
    }
    $scope.state.openParentVariableSearchDialog = function(e){
        dialogParameters.conversionFactor = 1;
        dialogParameters.title = 'Add a parent category';
        dialogParameters.helpText = "Search for a parent category " +
            "that you'd like to tag " + $scope.state.variableObject.name.toUpperCase() + " with.  Then " +
            "when your parent category variable is analyzed, measurements from " +
            $scope.state.variableObject.name.toUpperCase() + " will be included.";
        dialogParameters.placeholder = "Search for a parent category...";
        var requestParams =  {childUserTagVariableId: $scope.state.variableObject.id};
        openTagVariableSearchDialog(e, requestParams, dialogParameters);
    };
    $scope.state.openIngredientVariableSearchDialog = function(e){
        dialogParameters.conversionFactor = 1;
        dialogParameters.title = 'Add an ingredient';
        dialogParameters.helpText = "Search for an ingredient " +
            "that you'd like to tag " + $scope.state.variableObject.name.toUpperCase() + " with.  Then " +
            "when your ingredient variable is analyzed, converted measurements from " +
            $scope.state.variableObject.name.toUpperCase() + " will be included.";
        dialogParameters.placeholder = "Search for an ingredient...";
        var requestParams =  {ingredientOfUserTagVariableId: $scope.state.variableObject.id};
        openTagVariableSearchDialog(e, requestParams, dialogParameters);
    };
    $scope.state.openChildVariableSearchDialog = function(e){
        dialogParameters.title = 'Add a child sub-type';
        dialogParameters.helpText = "Search for a child sub-class of " +
            $scope.state.variableObject.name.toUpperCase() + ".  Then " +
            "when " + $scope.state.variableObject.name.toUpperCase() + " is analyzed, measurements from " +
            "your child sub-type variable will also be included.";
        dialogParameters.placeholder = "Search for a variable to tag...";
        var requestParams = {parentUserTagVariableId: $scope.state.variableObject.id};
        openTageeVariableSearchDialog(e, requestParams, dialogParameters);
    };
    $scope.state.openIngredientOfVariableSearchDialog = function(e){
        dialogParameters.title = 'Add a parent';
        dialogParameters.helpText = "Search for a variable that contains " +
            $scope.state.variableObject.name.toUpperCase() + ".  Then " +
            "when " + $scope.state.variableObject.name.toUpperCase() + " is analyzed, converted measurements from " +
            "your selected variable will also be included.";
        dialogParameters.placeholder = "Search for variable containing "+ $scope.state.variableObject.name;
        var requestParams = {ingredientUserTagVariableId: $scope.state.variableObject.id};
        openTageeVariableSearchDialog(e, requestParams, dialogParameters);
    };
    function openTageeVariableSearchDialog($event, requestParams, dialogParameters) {
        requestParams.includePublic = true;
        function selectVariable(selectedVariable) {
            var userTagData;
            if(!getConversionFactor(dialogParameters.conversionFactor)){
                goToAddTagState({
                    userTagVariableObject: $scope.state.variableObject,
                    userTaggedVariableObject: selectedVariable
                });
            } else {
                userTagData = {userTaggedVariableId: selectedVariable.id, userTagVariableId: $scope.state.variableObject.id,
                    conversionFactor: getConversionFactor(dialogParameters.conversionFactor)};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function (response) {
                    $scope.state.variableObject = response.data.userTagVariable;
                    qmService.hideLoader();
                });
            }
        }
        dialogParameters.requestParams = requestParams;
        qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, $event);
    };
    $scope.openJoinVariableSearchDialog = function($event, requestParams) {
        qmLog.info("openJoinVariableSearchDialog called by this event:", $event);
        qmLog.info("openJoinVariableSearchDialog requestParams:", requestParams);
        requestParams = requestParams || {joinVariableId: $scope.state.variableObject.id};
        requestParams.includePublic = true;
        function selectVariable(selectedVariable) {
            var variableData = {
                parentVariableId: $scope.state.variableObject.id,
                joinedVariableId: selectedVariable.id,
                conversionFactor: 1
            };
            qmService.postVariableJoinDeferred(variableData).then(function (currentVariable) {
                qmService.hideLoader();
                $scope.state.variableObject = currentVariable;
            }, function (error) {
                qmService.hideLoader();
                qmLogService.error(error);
            });
            $mdDialog.hide();
        }
        var dialogParameters = {
            title: 'Join a Duplicate',
            helpText: "Search for a duplicated or synonymous variable that you'd like to join to " +
                $scope.state.variableObject.name + ". Once joined, its measurements will be included in the analysis of " +
                $scope.state.variableObject.name + ".  You can only join variables that have the same unit " +
                $scope.state.variableObject.unit.abbreviatedName + ".",
            placeholder: "What variable would you like to join?",
            buttonText: "Select Variable",
            requestParams: requestParams,
            excludeLocal: true, // Necessary because API does complex filtering
            doNotCreateNewVariables: true
        };
        qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, $event);
    };
    var SelectWikipediaArticleController = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService, $q, $log, dialogParameters) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dialogParameters.title;
        self.helpText = dialogParameters.helpText;
        self.placeholder = dialogParameters.placeholder;
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
            if(!query || !query.length){ query = dialogParameters.variableName; }
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
                    qmLogService.error(error);
                    qmLogService.error(error);
                }
            }).catch(function (error) {qmLogService.error(error);});
            return deferred.promise;
        }
        function searchTextChange(text) { qmLogService.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            $scope.state.variableObject.wikipediaPage = item.page;
            $scope.state.variableObject.wikipediaExtract = item.page.extract;
            self.selectedItem = item;
            self.buttonText = dialogParameters.buttonText;
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
    SelectWikipediaArticleController.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "qmLogService", "$q", "$log", "dialogParameters"];
    $scope.searchWikipediaArticle = function (ev) {
        $mdDialog.show({
            controller: SelectWikipediaArticleController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/dialogs/variable-search-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dialogParameters: {
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
                qmLogService.error('Could not convert experimentStartTimeString to ISO format', {experimentStartTimeString: variableObject.experimentStartTimeString, errorMessage: error});
            }
        }
        if(variableObject.experimentEndTimeString){
            try {
                experimentEndTimeString = variableObject.experimentEndTimeString.toISOString();
            } catch (error){
                qmLogService.error('Could not convert experimentEndTimeString to ISO format', {experimentEndTimeString: variableObject.experimentEndTimeString, errorMessage: error});
            }
        }
        console.log("debugMode is " + qmLog.getDebugMode());
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
            defaultUnitId: variableObject.userUnitId,
            userVariableVariableCategoryName: variableObject.variableCategoryName,
            //userVariableAlias: $scope.state.userVariableAlias
            experimentStartTimeString: experimentStartTimeString,
            experimentEndTimeString: experimentEndTimeString
        };
        qmService.postUserVariableDeferred(body).then(function(userVariable) {
            qmService.hideLoader();
            qmService.showInfoToast('Saved ' + variableObject.name + ' settings');
            $scope.goBack({variableObject: userVariable, refresh: true});  // Temporary workaround to make tests pass
        }, function(error) {
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
    $scope.deleteTaggedVariable = function(taggedVariable) {
        taggedVariable.hide = true;
        var userTagData = {userTagVariableId: $scope.state.variableObject.id, userTaggedVariableId: taggedVariable.id};
        qmService.deleteUserTagDeferred(userTagData);  // Delete doesn't return response for some reason
    };
    $scope.deleteTagVariable = function(tagVariable) {
        tagVariable.hide = true;
        var userTagData = {userTaggedVariableId: $scope.state.variableObject.id, userTagVariableId: tagVariable.id};
        qmService.deleteUserTagDeferred(userTagData); // Delete doesn't return response for some reason
    };
    $scope.deleteJoinedVariable = function(tagVariable) {
        tagVariable.hide = true;
        var postBody = {currentVariableId: $scope.state.variableObject.id, joinedUserTagVariableId: tagVariable.id};
        qmService.deleteVariableJoinDeferred(postBody); // Delete doesn't return response for some reason
    };
    $scope.editTag = function(userTagVariable){
        goToAddTagState({
            tagConversionFactor: userTagVariable.tagConversionFactor,
            userTaggedVariableObject: $scope.state.variableObject,
            userTagVariableObject: userTagVariable
        });
    };
    $scope.editTagged = function(userTaggedVariable){
        goToAddTagState({
            tagConversionFactor: userTaggedVariable.tagConversionFactor,
            userTaggedVariableObject: userTaggedVariable,
            userTagVariableObject: $scope.state.variableObject
        });
    };
    $scope.refreshUserVariable = function (hideLoader) {
        var refresh = true;
        if($scope.state.variableObject && $scope.state.variableObject.name !== variableName){ $scope.state.variableObject = null; }
        if(!hideLoader){ qmService.showBlackRingLoader(); }
        var params = {includeTags : true};
        qm.userVariables.getByName(variableName, params, refresh, function(variableObject){
            $scope.$broadcast('scroll.refreshComplete');  //Stop the ion-refresher from spinning
            qmService.hideLoader();
            $scope.state.variableObject = variableObject;
            //qmService.addWikipediaExtractAndThumbnail($scope.state.variableObject);
            qmService.setupVariableByVariableObject(variableObject);
        }, function (error) {
            $scope.$broadcast('scroll.refreshComplete');  //Stop the ion-refresher from spinning
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
}]);
