angular.module('starter')
	
	// Controls the settings page
	.controller('SettingsCtrl', function($scope,localStorageService, $ionicModal, $timeout, utilsService, authService,
										 measurementService, chartService, $ionicPopover, $cordovaFile,
										 $cordovaFileOpener2, $ionicPopup, $state,notificationService, QuantiModo) {
		$scope.controller_name = "SettingsCtrl";
		
		// populate ratings interval
        localStorageService.getItem('askForRating', function (askForRating) {
                $scope.ratings = askForRating ? askForRating : "hourly"
        });
		$scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
		$scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
	    // populate user data
        localStorageService.getItem('user',function(user){
            $scope.userName = user ? JSON.parse(user)['displayName'] : "";
        });

        // when login is tapped
	    $scope.loginFromSettings = function(){
	        if(ionic.Platform.platforms[0] === "browser"){
	        	// if on browser
	            $state.go('app.welcome');
	            
	            // let it login
	            setTimeout(function(){
	                $scope.login();
	            },100);

	        } else $scope.login();
	    };


	    // add other factors to track to a string to show on settings page 
	    $scope.calculateAddString = function(){
	        var localAdditionalRatings;
	        localStorageService.getItem('additionalRatings',function(additionalRatings){
                localAdditionalRatings = additionalRatings? JSON.parse(additionalRatings): {};
            });
            var string = "";
	        for(var rat in localAdditionalRatings){
	            if(localAdditionalRatings[rating])
	                string += rating + ",";
	        }
			string = string.replace(/,$/, '');
	        $scope.addString = string;
	    };

	    // save what other things to track
	    $scope.saveAddRatings = function(){
	    	localStorageService.setItem('additionalRatings', JSON.stringify($scope.additionalRatings));
	        
	        console.log($scope.additionalRatings);
	        
	        // hide popover
	        $scope.additionalRatingPopover.hide();
	        
	        // calculate and show the string on settings page
	        $scope.calculateAddString();
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


	    // constructor
	    $scope.init = function(){
	         var localAdditionalRatings;

            localStorageService.getItem('additionalRatings',function(additionalRatings){
                 localAdditionalRatings = additionalRatings? JSON.parse(additionalRatings): {};

            });

	        // populate previously selected additional variables
	        // TODO: Refactor
	        $scope.additionalRatings = {
	            Guilty : localAdditionalRatings && localAdditionalRatings.Guilty? localAdditionalRatings.Guilty : false,
	            Alert : localAdditionalRatings && localAdditionalRatings.Alert? localAdditionalRatings.Alert : false,
	            Excited : localAdditionalRatings && localAdditionalRatings.Excited? localAdditionalRatings.Excited : false,
	            Ashamed : localAdditionalRatings && localAdditionalRatings.Ashamed? localAdditionalRatings.Ashamed : false,
	            Attentive : localAdditionalRatings && localAdditionalRatings.Attentive? localAdditionalRatings.Attentive : false,
	            Hostile : localAdditionalRatings && localAdditionalRatings.Hostile? localAdditionalRatings.Hostile : false,
	            Active : localAdditionalRatings && localAdditionalRatings.Active? localAdditionalRatings.Active : false,
	            Nervous : localAdditionalRatings && localAdditionalRatings.Nervous? localAdditionalRatings.Nervous : false,
	            Interested : localAdditionalRatings && localAdditionalRatings.Interested? localAdditionalRatings.Interested : false,
	            Irritable : localAdditionalRatings && localAdditionalRatings.Irritable? localAdditionalRatings.Irritable : false,
	            Enthusiastic : localAdditionalRatings && localAdditionalRatings.Enthusiastic? localAdditionalRatings.Enthusiastic : false,
	            Jittery : localAdditionalRatings && localAdditionalRatings.Jittery? localAdditionalRatings.Jittery : false,
	            Strong : localAdditionalRatings && localAdditionalRatings.Strong? localAdditionalRatings.Strong : false,
	            Distressed : localAdditionalRatings && localAdditionalRatings.Distressed? localAdditionalRatings.Distressed : false,
	            Determined : localAdditionalRatings && localAdditionalRatings.Determined? localAdditionalRatings.Determined : false,
	            Upset : localAdditionalRatings && localAdditionalRatings.Upset? localAdditionalRatings.Upset : false,
	            Proud : localAdditionalRatings && localAdditionalRatings.Proud? localAdditionalRatings.Proud : false,
	            Scared : localAdditionalRatings && localAdditionalRatings.Scared? localAdditionalRatings.Scared : false,
	            Inspired: localAdditionalRatings && localAdditionalRatings.Inspired? localAdditionalRatings.Inspired: false
	        };

	        // update string
	        $scope.calculateAddString();
	    };

	    // load rating popover
	    $ionicPopover.fromTemplateUrl('templates/settings/ask_for_a_rating.html', {
	    	scope: $scope
	    }).then(function(popover) {
	    	$scope.ratingPopover = popover;
	    });

	    // load additional variables popover
	    $ionicPopover.fromTemplateUrl('templates/settings/additionalRatings_required.html', {
	    	scope: $scope
	    }).then(function(popover) {
	    	$scope.additionalRatingPopover = popover;
	    });


	    // Convert all data Array to a CSV object
	    var convertToCSV = function(objArray) {
	        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	        var str = '';
	        for (var i = 0; i < array.length; i++) {
	            var line = '';
	            for (var index in array[i]) {
	                if (line != '') line += ',';
	                line += array[i][index];
	            }
	            str += line + '\r\n';
	        }
	        return str;
	    };

	    // show alert box
	    $scope.showAlert = function(title, template) {
	        var alertPopup = $ionicPopup.alert({
				cssClass : 'positive',
				okType : 'button-positive',
				title: title,
				template: template
	        });
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

	    	localStorageService.getItem('allLocalMeasurements', function(allLocalMeasurements){
		    	// get all data 
		        var arr = allLocalMeasurements? JSON.parse(allLocalMeasurements) : [];
		        
		        // convert JSon to CSV
		        var csv = convertToCSV(arr);

		        // write it on storage
		        $cordovaFile.writeFile(cordova.file.dataDirectory, "csv.csv", csv, true)
				.then(function (success) {

		         	// when done, open the file opener / chooser
					$cordovaFileOpener2.open(cordova.file.dataDirectory+'csv.csv','application/csv');

		        }, function (error) {
					$scope.showAlert('Please generate CSV later!');
				});
	    	});
	    };

	    // call constructor
	    $scope.init();
	});