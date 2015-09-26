angular.module('starter')
	
	// Controls the settings page
	.controller('SettingsCtrl', function($scope,localStorageService, $ionicModal, $timeout, utilsService, authService, measurementService, chartService, $ionicPopover, $cordovaFile, $cordovaFileOpener2, $ionicPopup, $state,notificationService) {
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
            $scope.user_name = user ? JSON.parse(user)['displayName'] : "";
        });

        // when login is tapped
	    $scope.login_from_settings = function(){
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
	        var localAdditonalRatings;
	        localStorageService.getItem('additional_ratings',function(additional_ratings){
                localAdditonalRatings = additional_ratings? JSON.parse(additional_ratings): {};
            });
            var str = "";
	        for(var rat in localAdditonalRatings){
	            if(localAdditonalRatings[rat])
	                str+= rat+",";
	        }
	        str = str.replace(/,$/, '');
	        $scope.addString = str;
	    };

	    // save what other things to track
	    $scope.save_add_ratings = function(){
	    	localStorageService.setItem('additional_ratings', JSON.stringify($scope.additional_ratings));
	        
	        console.log($scope.additional_ratings);
	        
	        // hide popover
	        $scope.additional_rating_popover.hide();
	        
	        // calulcate and show the string on settings page
	        $scope.calculateAddString();
	    };

	    // when interval is updated
	    $scope.save_rating_interval = function(interval){
	        //schedule notification
	        //TODO we can pass callback function to check the status of scheduling
	        notificationService.scheduleNotification(interval);
	        
	        localStorageService.setItem('askForRating', interval);
	        $scope.ratings = interval;
	        
	        // hide popover
	        $scope.rating_popover.hide();
	    };


	    // constructor
	    $scope.init = function(){
	         var localAdditonalRatings;

            localStorageService.getItem('additional_ratings',function(additional_ratings){
                 localAdditonalRatings = additional_ratings? JSON.parse(additional_ratings): {};

            })

	        // populate previously selected additional variables
	        // TODO: Refactor
	        $scope.additional_ratings = {
	            Guilty : localAdditonalRatings && localAdditonalRatings.Guilty? localAdditonalRatings.Guilty : false,
	            Alert : localAdditonalRatings && localAdditonalRatings.Alert? localAdditonalRatings.Alert : false,
	            Excited : localAdditonalRatings && localAdditonalRatings.Excited? localAdditonalRatings.Excited : false,
	            Guilty : localAdditonalRatings && localAdditonalRatings.Guilty? localAdditonalRatings.Guilty : false,
	            Irritable : localAdditonalRatings && localAdditonalRatings.Irritable? localAdditonalRatings.Irritable : false,
	            Ashamed : localAdditonalRatings && localAdditonalRatings.Ashamed? localAdditonalRatings.Ashamed : false,
	            Attentive : localAdditonalRatings && localAdditonalRatings.Attentive? localAdditonalRatings.Attentive : false,
	            Hostile : localAdditonalRatings && localAdditonalRatings.Hostile? localAdditonalRatings.Hostile : false,
	            Active : localAdditonalRatings && localAdditonalRatings.Active? localAdditonalRatings.Active : false,
	            Nervous : localAdditonalRatings && localAdditonalRatings.Nervous? localAdditonalRatings.Nervous : false,
	            Interested : localAdditonalRatings && localAdditonalRatings.Interested? localAdditonalRatings.Interested : false,
	            Irritable : localAdditonalRatings && localAdditonalRatings.Irritable? localAdditonalRatings.Irritable : false,
	            Enthusiastic : localAdditonalRatings && localAdditonalRatings.Enthusiastic? localAdditonalRatings.Enthusiastic : false,
	            Jittery : localAdditonalRatings && localAdditonalRatings.Jittery? localAdditonalRatings.Jittery : false,
	            Strong : localAdditonalRatings && localAdditonalRatings.Strong? localAdditonalRatings.Strong : false,
	            Distressed : localAdditonalRatings && localAdditonalRatings.Distressed? localAdditonalRatings.Distressed : false,
	            Determined : localAdditonalRatings && localAdditonalRatings.Determined? localAdditonalRatings.Determined : false,
	            Upset : localAdditonalRatings && localAdditonalRatings.Upset? localAdditonalRatings.Upset : false,
	            Proud : localAdditonalRatings && localAdditonalRatings.Proud? localAdditonalRatings.Proud : false,
	            Scared : localAdditonalRatings && localAdditonalRatings.Scared? localAdditonalRatings.Scared : false,
	            Inspired: localAdditonalRatings && localAdditonalRatings.Inspired? localAdditonalRatings.Inspired: false
	        };

	        // update string
	        $scope.calculateAddString();
	    };

	    // load rating popover
	    $ionicPopover.fromTemplateUrl('templates/settings/ask_for_a_rating.html', {
	    	scope: $scope
	    }).then(function(popover) {
	    	$scope.rating_popover = popover;
	    });

	    // load additional variables popover
	    $ionicPopover.fromTemplateUrl('templates/settings/additional_ratings_required.html', {
	    	scope: $scope
	    }).then(function(popover) {
	    	$scope.additional_rating_popover = popover;
	    });


	    // Convert all data Array to a CSV object
	    var convertToCSV = function(objArray) {
	        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	        var str = '';
	        for (var i = 0; i < array.length; i++) {
	            var line = '';
	            for (var index in array[i]) {
	                if (line != '') line += ','
	                line += array[i][index];
	            }
	            str += line + '\r\n';
	        }
	        return str;
	    };

	    // show alert box
	    $scope.showAlert = function(title, template) {
	        var alertPopup = $ionicPopup.alert({
	          title: title,
	          template: template
	        });
	    };

	    // When Export is tapped
	    $scope.export = function(){

	    	localStorageService.getItem('allData', function(allData){
		    	// get all data 
		        var arr = allData? JSON.parse(allData) : [];
		        
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