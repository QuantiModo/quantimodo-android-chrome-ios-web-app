angular.module('starter')
	
	// Controls the settings page
	.controller('SettingsCtrl', function($scope,localStorageService, $ionicModal, $timeout, utilsService, authService,
										 measurementService, chartService, $ionicPopover, $cordovaFile,
										 $cordovaFileOpener2, $ionicPopup, $state,notificationService, QuantiModo) {
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
            localStorageService.getItem('user',function(user){
                if(!user){
                    authService.setUserInLocalStorageIfWeHaveAccessToken();
                    user = localStorageService.getItemSync('user');
                }

                if(user){
                    $scope.user = JSON.parse(user);
                }
            });
	    };

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