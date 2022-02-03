angular.module('starter').controller('FavoritesCtrl', ["$scope", "$state", "$ionicActionSheet", "$timeout", "qmService",
    "$rootScope", "$stateParams",
    function($scope, $state, $ionicActionSheet, $timeout, qmService, $rootScope,$stateParams){
    $scope.controller_name = "FavoritesCtrl";
    qmLog.debug('Loading ' + $scope.controller_name, null);
    $scope.state = {
        favoritesArray: [],
        selected1to5Value: false,
        loading: true,
        trackingReminder: null,
        lastSent: new Date(),
        title: "Favorites",
        addButtonText: "Add a Favorite Variable",
        addButtonIcon: "ion-ios-star",
        helpText: "Favorites are variables that you might want to track on a frequent but irregular basis.  Examples: As-needed medications, cups of coffee, or glasses of water",
        moreHelpText: "Tip: I recommend using reminders instead of favorites whenever possible because they allow you to record regular 0 values as well. Knowing when you didn't take a medication or eat something helps our analytics engine to figure out how these things might be affecting you."
    };
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.$on('$ionicView.enter', function(e){
        if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
        qmLog.debug('Entering state ' + $state.current.name, null);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        qmService.rootScope.setProperty('bloodPressure', {displayTotal: "Blood Pressure"});
        var categoryName = qm.variableCategoryHelper.getNameFromStateParamsOrUrl($stateParams);
        if(categoryName){
            $scope.variableCategoryName = categoryName;
            $scope.state.addButtonText = "Add favorite " + categoryName.toLowerCase();
            $scope.state.title = 'Favorite ' + categoryName;
            $scope.state.moreHelpText = null;
        }else{
            $scope.variableCategoryName = null;
        }
        if(categoryName === 'Treatments'){
            $scope.state.addButtonText = "Add an as-needed medication";
            $scope.state.helpText = "Quickly record doses of medications taken as needed just by tapping.  Tap twice for two doses, etc.";
            $scope.state.addButtonIcon = "ion-ios-medkit-outline";
            $scope.state.title = 'As-Needed Meds';
        }
        if($stateParams.presetVariables){
            $scope.state.favoritesArray = $stateParams.presetVariables;
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        }else{
            getFavoritesFromLocalStorage();
            $scope.refreshFavorites();
        }
    });
    var getFavoritesFromLocalStorage = function(){
        var categoryName = qm.variableCategoryHelper.getNameFromStateParamsOrUrl($stateParams);
        qm.reminderHelper.getFavorites(categoryName).then(function(favorites){
            $scope.state.favoritesArray = favorites;
            qmService.showInfoToast('Got ' + favorites.length + ' favorites!');
        });
    };
    $scope.favoriteAddButtonClick = function(){
        qmService.goToState('app.favoriteSearch');
    };
    $scope.trackByFavorite = function(tr, modifiedReminderValue){
        var favorites = $scope.state.favoritesArray;
        qm.reminderHelper.trackByFavorite(tr, modifiedReminderValue, function (){
            $scope.safeApply(function (){ // Update display text
                $scope.state.favoritesArray = favorites
            })
        });
    };
    $scope.refreshFavorites = function(){
        qmLog.info('ReminderMange init: calling refreshFavorites syncTrackingReminders');
        qmService.showInfoToast('Syncing favorites...');
        qm.reminderHelper.syncReminders(true).then(function(){
            getFavoritesFromLocalStorage();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
}]);
