angular.module('starter')
    // Variable Category Service
    .factory('variableCategoryService', function($filter, $q, QuantiModo, localStorageService){

        // service methods
        var variableCategoryService = {

            getVariableCategoryInfo: function (variableCategoryName) {

                var variableCategoryInfo =
                {
                    "Anything": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What do you want to record?",
                        variableCategoryNameSingularLowercase: "anything",
                        variableSearchPlaceholderText : "Search for a variable here...",
                        defaultValuePlaceholderText : "Enter most common value here...",
                        defaultValueLabel : 'Value',
                        addNewVariableButtonText : '+ Add a new variable',
                        addNewVariableCardText : 'Add a new variable',
                        variableCategoryName : '',
                        defaultValue : '',
                        measurementSynonymSingularLowercase : "measurement",
                        icon: "ion-speedometer"
                    },
                    "Activity": {
                        defaultAbbreviatedUnitName: 'min',
                        helpText: "What activity do you want to record?",
                        variableCategoryName: "Activity",
                        variableCategoryNameSingularLowercase: "activity",
                        measurementSynonymSingularLowercase : "activity",
                        icon: "ion-ios-body"
                    },
                    "Emotions": {
                        defaultAbbreviatedUnitName: "/5",
                        helpText: "What emotion do you want to rate?",
                        variableCategoryName: "Emotions",
                        variableCategoryNameSingularLowercase: "emotion",
                        measurementSynonymSingularLowercase : "rating",
                        icon: "ion-happy-outline"
                    },
                    "Environment": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What environmental variable do you want to record?",
                        variableCategoryName: "Environment",
                        variableCategoryNameSingularLowercase: "environment",
                        measurementSynonymSingularLowercase : "environmental measurement",
                        icon: "ion-ios-partlysunny-outline"
                    },
                    "Foods" : {
                        defaultAbbreviatedUnitName: "serving",
                        helpText: "What did you eat?",
                        variableCategoryName: "Foods",
                        variableCategoryNameSingularLowercase: "food",
                        measurementSynonymSingularLowercase : "meal",
                        icon: "ion-fork"
                    },
                    "Location" : {
                        defaultAbbreviatedUnitName: "min",
                        helpText: "What location do you want to record?",
                        variableCategoryName: "Location",
                        variableCategoryNameSingularLowercase: "location",
                        measurementSynonymSingularLowercase : "location",
                        icon: "ion-ios-location"
                    },
                    "Music" : {
                        defaultAbbreviatedUnitName: "count",
                        helpText: "What music did you listen to?",
                        variableCategoryName: "Music",
                        variableCategoryNameSingularLowercase: "music",
                        measurementSynonymSingularLowercase : "music",
                        icon: "ion-music-note"
                    },
                    "Nutrients" : {
                        defaultAbbreviatedUnitName: "g",
                        helpText: "What nutrient do you want to track?",
                        variableCategoryName: "Nutrients",
                        variableCategoryNameSingularLowercase: "nutrient",
                        measurementSynonymSingularLowercase : "nutrient",
                        icon: "ion-fork"
                    },
                    "Payments" : {
                        defaultAbbreviatedUnitName: "$",
                        helpText: "What did you pay for?",
                        variableCategoryName: "Payments",
                        variableCategoryNameSingularLowercase: "payment",
                        measurementSynonymSingularLowercase : "payment",
                        icon: "ion-cash"
                    },
                    "Physical Activity": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What physical activity do you want to record?",
                        variableCategoryName: "Physical Activity",
                        variableCategoryNameSingularLowercase: "physical activity",
                        measurementSynonymSingularLowercase : "activity",
                        icon: "ion-ios-body"
                    },
                    "Physique": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What aspect of your physique do you want to record?",
                        variableCategoryName: "Physique",
                        variableCategoryNameSingularLowercase: "physique",
                        measurementSynonymSingularLowercase : "physique measurement",
                        icon: "ion-ios-body"
                    },
                    "Sleep": {
                        defaultAbbreviatedUnitName: "",
                        helpText: "What aspect of sleep do you want to record?",
                        variableCategoryName: "Sleep",
                        variableCategoryNameSingularLowercase: "sleep",
                        measurementSynonymSingularLowercase : "sleep",
                        icon: "ion-ios-moon-outline"
                    },
                    "Symptoms": {
                        defaultAbbreviatedUnitName: "/5",
                        helpText: "What symptom do you want to record?",
                        variableCategoryName: "Symptoms",
                        variableCategoryNameSingularLowercase: "symptom",
                        measurementSynonymSingularLowercase : "rating",
                        icon: "ion-ios-pulse"
                    },
                    "Treatments": {
                        defaultAbbreviatedUnitName : "mg",
                        helpText : "What treatment do you want to record?",
                        variableCategoryName : "Treatments",
                        variableCategoryNameSingularLowercase : "treatment",
                        defaultValueLabel : "Dosage",
                        defaultValuePlaceholderText : "Enter dose value here...",
                        measurementSynonymSingularLowercase : "dose",
                        icon: "ion-ios-medkit-outline"
                    },
                    "Vital Signs": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What vital sign do you want to record?",
                        variableCategoryName: "Vital Signs",
                        variableCategoryNameSingularLowercase: "vital sign",
                        measurementSynonymSingularLowercase : "measurement",
                        icon: "ion-ios-pulse"
                    }
                };


                var selectedVariableCategoryObject = variableCategoryInfo.Anything;

                if(variableCategoryName && variableCategoryInfo[variableCategoryName]){
                    selectedVariableCategoryObject =  variableCategoryInfo[variableCategoryName];

                    if(!selectedVariableCategoryObject.addNewVariableButtonText){
                        selectedVariableCategoryObject.addNewVariableButtonText =
                            "+ Add a new " + $filter('wordAliases')(pluralize(variableCategoryName.toLowerCase(), 1));
                    }

                    if(!selectedVariableCategoryObject.nameSingularLowercase){
                        selectedVariableCategoryObject.nameSingularLowercase =
                            $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variableCategoryName.toLowerCase()), 1);
                    }

                    if(!selectedVariableCategoryObject.addNewVariableCardText){
                        selectedVariableCategoryObject.addNewVariableCardText = "Add a new " +
                            $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variableCategoryName.toLowerCase(), 1));
                    }

                    if(!selectedVariableCategoryObject.variableSearchPlaceholderText){
                        if(variableCategoryName){
                            selectedVariableCategoryObject.variableSearchPlaceholderText =
                                "Search for a " +
                                $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variableCategoryName.toLowerCase(), 1)) +
                                " here...";
                        }
                    }
                }
                
                return selectedVariableCategoryObject;
            },

            // refresh local variable categroies with QuantiModo API
            refreshVariableCategories : function(){
                var deferred = $q.defer();

                QuantiModo.getVariableCategories(function(vars){
                    localStorageService.setItem('variableCategories',JSON.stringify(vars));
                    deferred.resolve(vars);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

            // get variable categories
            getVariableCategories : function(){
                var deferred = $q.defer();

                localStorageService.getItem('variableCategories',function(variableCategories){
                    if(variableCategories){
                        deferred.resolve(JSON.parse(variableCategories));
                    } else {
                        QuantiModo.getVariableCategories(function(vars){
                            localStorageService.setItem('variableCategories', JSON.stringify(vars));
                            deferred.resolve(vars);
                        }, function(){
                            deferred.reject(false);
                        });
                    }
                });

                return deferred.promise;
            },
            
            getVariableCategoryIcon : function(variableCategoryName){
                var variableCategoryInfo = this.getVariableCategoryInfo(variableCategoryName);
                if(variableCategoryInfo.icon){
                    return variableCategoryInfo.icon;
                } else {
                    console.warn('Could not find icon for variableCategoryName ' + variableCategoryName);
                    return 'ion-speedometer';
                }
                
            }
        };
        
        return variableCategoryService;
    });