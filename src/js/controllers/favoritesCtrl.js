angular.module('starter').controller('FavoritesCtrl', ["$scope", "$state", "$ionicActionSheet", "$timeout", "qmService", "qmLogService", "$rootScope", "$stateParams", function($scope, $state, $ionicActionSheet, $timeout, qmService, qmLogService, $rootScope,
										  $stateParams) {
    $scope.controller_name = "FavoritesCtrl";
    qmLogService.debug('Loading ' + $scope.controller_name, null);
    $scope.state = {
        selected1to5Value : false,
        loading : true,
        trackingReminder : null,
        lastSent: new Date(),
        title: "Favorites",
        favorites: [],
        addButtonText: "Add a Favorite Variable",
        addButtonIcon: "ion-ios-star",
        helpText: "Favorites are variables that you might want to track on a frequent but irregular basis.  Examples: As-needed medications, cups of coffee, or glasses of water",
        moreHelpText: "Tip: I recommend using reminders instead of favorites whenever possible because they allow you to record regular 0 values as well. Knowing when you didn't take a medication or eat something helps our analytics engine to figure out how these things might be affecting you."
    };
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.$on('$ionicView.enter', function(e) { qmLogService.debug('Entering state ' + $state.current.name, null);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        qmService.rootScope.setProperty('bloodPressure', {systolicValue: null, diastolicValue: null, displayTotal: "Blood Pressure"});
        if($stateParams.variableCategoryName && $stateParams.variableCategoryName  !== 'Anything'){
            $scope.variableCategoryName = $stateParams.variableCategoryName;
            $scope.state.addButtonText = "Add favorite " + $stateParams.variableCategoryName.toLowerCase();
            $scope.state.title = 'Favorite ' + $stateParams.variableCategoryName;
            $scope.state.moreHelpText = null;
        } else {$scope.variableCategoryName = null;}
        if($stateParams.variableCategoryName === 'Treatments') {
            $scope.state.addButtonText = "Add an as-needed medication";
            $scope.state.helpText = "Quickly record doses of medications taken as needed just by tapping.  Tap twice for two doses, etc.";
            $scope.state.addButtonIcon = "ion-ios-medkit-outline";
            $scope.state.title = 'As-Needed Meds';
        }
        if($stateParams.presetVariables){
            $scope.favoritesArray = $stateParams.presetVariables;
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        } else {
            getFavoritesFromLocalStorage();
            $scope.refreshFavorites();
        }
    });
    var getFavoritesFromLocalStorage = function(){
        qmService.storage.getFavorites($stateParams.variableCategoryName).then(function(favorites){$scope.favoritesArray = favorites;});
    };
    $scope.favoriteAddButtonClick = function () {qmService.goToState('app.favoriteSearch');};
    $scope.refreshFavorites = function () {
        qmLogService.debug('ReminderMange init: calling refreshTrackingRemindersAndScheduleAlarms', null);
        qmService.showInfoToast('Syncing...');
        qmService.syncTrackingReminders(true).then(function () {
            getFavoritesFromLocalStorage();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
}]);
