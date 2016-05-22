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
                        abbreviatedUnitName : '',
                        defaultValue : '',
                        measurementSynonymSingularLowercase : "measurement",
                        icon: "ion-ios-nutrition"
                    },
                    "Vital Signs": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What vital sign do you want to record?",
                        variableCategoryName: "Vital Signs",
                        variableCategoryNameSingularLowercase: "vital sign",
                        measurementSynonymSingularLowercase : "measurement",
                        icon: "ion-ios-pulse"
                    },
                    "Foods" : {
                        defaultAbbreviatedUnitName: "serving",
                        helpText: "What did you eat?",
                        variableCategoryName: "Foods",
                        variableCategoryNameSingularLowercase: "food",
                        measurementSynonymSingularLowercase : "meal",
                        icon: "ion-ios-nutrition"
                    },
                    Emotions: {
                        defaultAbbreviatedUnitName: "/5",
                        helpText: "What emotion do you want to rate?",
                        variableCategoryName: "Emotions",
                        variableCategoryNameSingularLowercase: "emotion",
                        measurementSynonymSingularLowercase : "rating",
                        icon: "ion-happy-outline"
                    },
                    Symptoms: {
                        defaultAbbreviatedUnitName: "/5",
                        helpText: "What symptom do you want to record?",
                        variableCategoryName: "Symptoms",
                        variableCategoryNameSingularLowercase: "symptom",
                        measurementSynonymSingularLowercase : "rating",
                        icon: "ion-ios-pulse"
                    },
                    Treatments: {
                        defaultAbbreviatedUnitName : "mg",
                        helpText : "What treatment do you want to record?",
                        variableCategoryName : "Treatments",
                        variableCategoryNameSingularLowercase : "treatment",
                        defaultValueLabel : "Dosage",
                        defaultValuePlaceholderText : "Enter dose value here...",
                        measurementSynonymSingularLowercase : "dose",
                        icon: "ion-ios-medkit-outline"
                    },
                    "Physical Activity": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What physical activity do you want to record?",
                        variableCategoryName: "Physical Activity",
                        variableCategoryNameSingularLowercase: "physical activity",
                        measurementSynonymSingularLowercase : "activity",
                        icon: "ion-ios-body"
                    }
                };


                if(variableCategoryName){
                    var selectedVariableCategoryObject =  variableCategoryInfo[variableCategoryName];

                    if(!selectedVariableCategoryObject.addNewVariableButtonText){
                        selectedVariableCategoryObject.addNewVariableButtonText =
                            "+ Add a new " + $filter('wordAliases')(pluralize(variableCategoryName.toLowerCase(), 1));
                    }

                    if(!selectedVariableCategoryObject.nameSingularLowercase){
                        selectedVariableCategoryObject.nameSingularLowercase =
                            $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variableCategoryName.toLowerCase()), 1);
                    }

                    if(!selectedVariableCategoryObject.addNewVariableCardText){
                        selectedVariableCategoryObject.addNewVariableCardText = "Add a new "
                            + $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variableCategoryName.toLowerCase(), 1));
                    }

                    if(!selectedVariableCategoryObject.variableSearchPlaceholderText){
                        if(variableCategoryName){
                            selectedVariableCategoryObject.variableSearchPlaceholderText =
                                "Search for a "
                                + $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variableCategoryName.toLowerCase(), 1))
                                + " here...";
                        }
                    }

                } else {
                    selectedVariableCategoryObject = variableCategoryInfo['Anything'];
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