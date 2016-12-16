angular.module('starter')

	.controller('SpreadsheetImportCtrl', function($scope, $ionicLoading, $state, $rootScope, utilsService, QuantiModo,
									   connectorsService, $cordovaOauth, $ionicPopup, $stateParams, measurementService) {

		$scope.controller_name = "SpreadsheetImportCtrl";

	    // constructor
	    var init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }


	    };

	    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
			init();
	    });

        $scope.uploadSpreadsheet = function() {
        	alert('Select spreadsheet');
        };

        $scope.uploadFile = function(){
            var file = $scope.myFile;
            console.log('file is ' );
            console.dir(file);
            var uploadUrl = "/fileUpload";
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };

        // ref: http://stackoverflow.com/a/1293163/2343
        // This will parse a delimited string into an array of
        // arrays. The default delimiter is the comma, but this
        // can be overriden in the second argument.
        function CSVToArray( strData, strDelimiter ){
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
            );


            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;


            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec( strData )){

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                ){

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push( [] );

                }

                var strMatchedValue;

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[ 2 ].replace(
                        new RegExp( "\"\"", "g" ),
                        "\""
                    );

                } else {

                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[ 3 ];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
            }

            // Return the parsed data.
            return( arrData );
        }

        $scope.displayFileContents = function(contents) {
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            $scope.results = contents;
            $scope.resultsArray = CSVToArray(contents);
            parseMintMeasurements($scope.resultsArray);
        };

        var measurement = {
            variableName: null,
            sourceName: null,
            abbreviatedUnitName: null,
            variableCategoryName: null,
            combinationOperation: null,
            value: null,
            startTime: null,
            note: null
        };


        var parseMintMeasurements = function (csvArray) {
            var measurements = [];
            /**
			 * 0 : "Date"
             1 : "Description"
             2 : "Original Description"
             3 : "Amount"
             4 : "Transaction Type"
             5 : "Category"
             6 : "Account Name"
             7 : "Labels"
             8 : "Notes
             */
			for(var i = 1; i < csvArray.length; i++){
                if(!csvArray[i][3]){
                    continue;
                }

                measurement = {
                    variableName: csvArray[i][1] + ' Purchase',
                    sourceName: 'Mint',
                    abbreviatedUnitName: '$',
                    variableCategoryName: 'Purchases',
                    combinationOperation: 'SUM',
                    value: Number(csvArray[i][3]),
                    startTime: null,
					tagVariableNames: csvArray[i][7],
                    note: "Original Description: " + csvArray[i][2] + " - Transaction Type: " + csvArray[i][4] +
						" - Category: " + csvArray[i][5]

                };



                if(csvArray[i][8]){
                	measurement.note = measurement.note + " - Notes: " + csvArray[i][8];
				}

                measurement.tagVariableNames = [];
                if(csvArray[i][7]){
                    measurement.note = measurement.note + " - Labels: " + csvArray[i][7];
                    measurement.tagVariableNames = [csvArray[i][7] + ' Purchase'];
                }

                if(csvArray[i][6]){
                    measurement.note = measurement.note + " - Account Name: " + csvArray[i][6] ;
                }

                measurement.tagVariableNames.push(csvArray[i][5] + ' Purchase');

                measurements.push(measurement);
			}

			measurementService.postMeasurements(measurements).then(function (response) {
				console.debug(response);
				$ionicLoading.hide();
            });
        };

	});
