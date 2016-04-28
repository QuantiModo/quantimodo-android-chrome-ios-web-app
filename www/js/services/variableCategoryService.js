angular.module('starter')
    // Variable Category Service
    .factory('variableCategoryService', function($filter){

        // service methods
        var variableCategoryService = {

            getVariableCategoryInfo: function (variableCategoryName) {

                var variableCategoryInfo =
                {
                    "Anything": {
                        defaultUnitAbbreviatedName: '',
                        helpText: "What do you want to record?",
                        variableCategoryNameSingularLowercase: "anything",
                        variableSearchPlaceholderText : "Search for a variable here...",
                        defaultValuePlaceholderText : "Enter most common value here...",
                        defaultValueLabel : 'Value',
                        addNewVariableButtonText : '+ Add a new variable',
                        addNewVariableCardText : 'Add a new variable',
                        variableCategoryName : '',
                        abbreviatedUnitName : '',
                        defaultValue : ''
                    },
                    "Vital Signs": {
                        defaultUnitAbbreviatedName: '',
                        helpText: "What vital sign do you want to record?",
                        variableCategoryName: "Vital Signs",
                        variableCategoryNameSingularLowercase: "vital sign"
                    },
                    Foods: {
                        defaultUnitAbbreviatedName: "serving",
                        helpText: "What did you eat?",
                        variableCategoryName: "Foods",
                        variableCategoryNameSingularLowercase: "food"
                    },
                    Emotions: {
                        defaultUnitAbbreviatedName: "/5",
                        helpText: "What emotion do you want to rate?",
                        variableCategoryName: "Emotions",
                        variableCategoryNameSingularLowercase: "emotion"
                    },
                    Symptoms: {
                        defaultUnitAbbreviatedName: "/5",
                        helpText: "What symptom do you want to record?",
                        variableCategoryName: "Symptoms",
                        variableCategoryNameSingularLowercase: "symptom"
                    },
                    Treatments: {
                        defaultUnitAbbreviatedName: "mg",
                        helpText: "What treatment do you want to record?",
                        variableCategoryName: "Treatments",
                        variableCategoryNameSingularLowercase: "treatment",
                        defaultValueLabel: "Dosage",
                        defaultValuePlaceholderText: "Enter dose value here..."

                    },
                    "Physical Activity": {
                        defaultUnitAbbreviatedName: '',
                        helpText: "What physical activity do you want to record?",
                        variableCategoryName: "Physical Activity",
                        variableCategoryNameSingularLowercase: "physical activity"
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
            }
        };
        
        return variableCategoryService;
    });