angular.module('starter')
	
	// Controls the settings page
	.controller('SettingsCtrl', function($scope,localStorageService, $ionicModal, $timeout, utilsService, authService,
										 measurementService, chartService, $ionicPopover, $cordovaFile,
										 $cordovaFileOpener2, $ionicPopup, $state,notificationService, QuantiModo,
                                         $rootScope) {
		$scope.controller_name = "SettingsCtrl";
		// populate ratings interval
        localStorageService.getItem('askForRating', function (askForRating) {
                $scope.ratings = askForRating ? askForRating : "hourly";
        });
		$scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
		$scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
	    // populate user data


        // when login is tapped
	    $scope.loginFromSettings = function(){
			$state.go('app.login');
	    };
        
	    // when interval is updated
	    $scope.saveRatingInterval = function(interval){
	        //schedule notification
	        //TODO we can pass callback function to check the status of scheduling
	        notificationService.scheduleNotification(interval);
	        
	        localStorageService.setItem('askForRating', interval);
	        $scope.ratings = interval;
	        
	        // hide popover
	        $scope.ratingPopover.hide();
	    };
        
		$scope.init = function(){

            if(!$rootScope.user){
                $rootScope.user = localStorageService.getItemAsObject('user');
            }

	    };

        $scope.logout = function(){

            var startLogout = function(){
                console.log('Logging out...')
                $rootScope.isSyncing = false;
                $rootScope.user = null;
                $rootScope.isMobile = window.cordova;
                $rootScope.isBrowser = ionic.Platform.platforms[0] === "browser";
                if($rootScope.isMobile || !$rootScope.isBrowser){
                    console.log('startLogout: Open the auth window via inAppBrowser.  Platform is ' + ionic.Platform.platforms[0]);
                    var ref = window.open(config.getApiUrl() + '/api/v2/auth/logout','_blank', 'location=no,toolbar=yes');

                    console.log('startLogout: listen to its event when the page changes');

                    ref.addEventListener('loadstart', function(event) {
                        ref.close();
                        $scope.showDataClearPopup();
                    });
                } else {
                    $scope.showDataClearPopup();
                }
            };

            function refreshTrackingPageAndGoToWelcome() {
                // calculate primary outcome variable and chart data
                measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function () {
                    measurementService.calculateBothChart();
                    measurementService.resetSyncFlag();
                    //hard reload
                    $state.go(config.appSettings.welcomeState, {}, {
                        reload: true
                    });
                });
            }

            $scope.showDataClearPopup = function(){
                $ionicPopup.show({
                    title:'Clear local storage?',
                    subTitle: 'Do you want do delete all data from local storage?',
                    scope: $scope,
                    buttons:[
                        {
                            text: 'No',
                            type: 'button-assertive',
                            onTap : afterLogoutDoNotDeleteMeasurements
                        },
                        {
                            text: 'Yes',
                            type: 'button-positive',
                            onTap: completelyResetAppState
                        }
                    ]

                });
            };

            function logOutOfApi() {
                if (window.chrome && window.chrome.extension && typeof window.chrome.identity === "undefined") {
                    chrome.tabs.create({
                        url: config.getApiUrl() + "/api/v2/auth/logout"
                    });
                }
            }

            var completelyResetAppState = function(){
                $rootScope.user = null;
                localStorageService.clear();
                notificationService.cancelNotifications();
                refreshTrackingPageAndGoToWelcome();
                logOutOfApi();
                
                localStorageService.setItem('isWelcomed', false);
                $state.go(config.appSettings.welcomeState, {}, {
                    reload: true
                });
            };


            var afterLogoutDoNotDeleteMeasurements = function(){
                $rootScope.user = null;
                clearTokensFromLocalStorage();
                refreshTrackingPageAndGoToWelcome();
                logOutOfApi();
                localStorageService.setItem('isWelcomed', false);
                $state.go(config.appSettings.welcomeState, {}, {
                    reload: true
                });
            };

            startLogout();
        };

        // when user is logging out
        function clearTokensFromLocalStorage() {
            //Set out local storage flag for welcome screen variables
            localStorageService.setItem('isLoggedIn', false);

            localStorageService.setItem('primaryOutcomeVariableReportedWelcomeScreen', true);
            localStorageService.deleteItem('accessToken');
            localStorageService.deleteItem('refreshToken');
            localStorageService.deleteItem('expiresAt');
        }


        // load rating popover
	    $ionicPopover.fromTemplateUrl('templates/settings/ask-for-a-rating.html', {
	    	scope: $scope
	    }).then(function(popover) {
	    	$scope.ratingPopover = popover;
	    });


	    // Convert all data Array to a CSV object
	    var convertToCSV = function(objArray) {
	        var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
	        var str = '';
	        for (var i = 0; i < array.length; i++) {
	            var line = '';
	            for (var index in array[i]) {
	                if (line != '') {
						line += ',';
					}
	                line += array[i][index];
	            }
	            str += line + '\r\n';
	        }
	        return str;
	    };
		

		// When Export is tapped
		$scope.exportCsv = function(){

			QuantiModo.postMeasurementsCsvExport(function(response){
				if(response.success) {
					alert("Your measurements will be emailed to you.");
				} else {
					alert("Could not export measurements.");
					console.log("error", response);
				}
			}, function(response){
				alert("Could not export measurements.");
				console.log("error", response);
			});
		};

		// When Export is tapped
		$scope.exportPdf = function(){

			QuantiModo.postMeasurementsPdfExport(function(response){
				if(response.success) {
					alert("Your measurements will be emailed to you.");
				} else {
					alert("Could not export measurements.");
					console.log("error", response);
				}
			}, function(response){
				alert("Could not export measurements.");
				console.log("error", response);
			});
		};

		// When Export is tapped
		$scope.exportXls = function(){

			QuantiModo.postMeasurementsXlsExport(function(response){
				if(response.success) {
					alert("Your measurements will be emailed to you.");
				} else {
					alert("Could not export measurements.");
					console.log("error", response);
				}
			}, function(response){
				alert("Could not export measurements.");
				console.log("error", response);
			});
		};

	    // When Export is tapped
	    $scope.export = function(){

	    	localStorageService.getItem('allMeasurements', function(allMeasurements){
		    	// get all data 
		        var arr = allMeasurements? JSON.parse(allMeasurements) : [];
		        
		        // convert JSon to CSV
		        var csv = convertToCSV(arr);

		        // write it on storage
		        $cordovaFile.writeFile(cordova.file.dataDirectory, "csv.csv", csv, true)
				.then(function (success) {

		         	// when done, open the file opener / chooser
					$cordovaFileOpener2.open(cordova.file.dataDirectory+'csv.csv','application/csv');

		        }, function (error) {
					utilsService.showAlert('Please generate CSV later!');
				});
	    	});
	    };

	    // call constructor
	    $scope.init();
	});