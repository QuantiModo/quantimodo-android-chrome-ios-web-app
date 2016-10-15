angular.module('starter')
    // Variable Category Service
    .factory('variableCategoryService', function($filter, $q, QuantiModo, localStorageService) {

        // service methods
        return {

            getVariableCategoryInfo: function (variableCategoryName) {

                var variableCategoryInfo =
                {
                    "Anything": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What do you want to record?",
                        variableCategoryNameSingular: "anything",
                        defaultValuePlaceholderText : "Enter most common value here...",
                        defaultValueLabel : 'Value',
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
                        variableCategoryNameSingular: "Activity",
                        measurementSynonymSingularLowercase : "activity",
                        icon: "ion-ios-body"
                    },
                    "Emotions": {
                        defaultAbbreviatedUnitName: "/5",
                        helpText: "What emotion do you want to rate?",
                        variableCategoryName: "Emotions",
                        variableCategoryNameSingular: "Emotion",
                        measurementSynonymSingularLowercase : "rating",
                        icon: "ion-happy-outline"
                    },
                    "Environment": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What environmental variable do you want to record?",
                        variableCategoryName: "Environment",
                        variableCategoryNameSingular: "Environment",
                        measurementSynonymSingularLowercase : "environmental measurement",
                        icon: "ion-ios-partlysunny-outline"
                    },
                    "Foods" : {
                        defaultAbbreviatedUnitName: "serving",
                        helpText: "What did you eat?",
                        variableCategoryName: "Foods",
                        variableCategoryNameSingular: "Food",
                        measurementSynonymSingularLowercase : "meal",
                        icon: "ion-fork"
                    },
                    "Location" : {
                        defaultAbbreviatedUnitName: "min",
                        helpText: "What location do you want to record?",
                        variableCategoryName: "Location",
                        variableCategoryNameSingular: "Location",
                        measurementSynonymSingularLowercase : "location",
                        icon: "ion-ios-location"
                    },
                    "Music" : {
                        defaultAbbreviatedUnitName: "count",
                        helpText: "What music did you listen to?",
                        variableCategoryName: "Music",
                        variableCategoryNameSingular: "Music",
                        measurementSynonymSingularLowercase : "music",
                        icon: "ion-music-note"
                    },
                    "Nutrients" : {
                        defaultAbbreviatedUnitName: "g",
                        helpText: "What nutrient do you want to track?",
                        variableCategoryName: "Nutrients",
                        variableCategoryNameSingular: "Nutrient",
                        measurementSynonymSingularLowercase : "nutrient",
                        icon: "ion-fork"
                    },
                    "Payments" : {
                        defaultAbbreviatedUnitName: "$",
                        helpText: "What did you pay for?",
                        variableCategoryName: "Payments",
                        variableCategoryNameSingular: "Payment",
                        measurementSynonymSingularLowercase : "payment",
                        icon: "ion-cash"
                    },
                    "Physical Activity": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What physical activity do you want to record?",
                        variableCategoryName: "Physical Activity",
                        variableCategoryNameSingular: "Physical Activity",
                        measurementSynonymSingularLowercase : "activity",
                        icon: "ion-ios-body"
                    },
                    "Physique": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What aspect of your physique do you want to record?",
                        variableCategoryName: "Physique",
                        variableCategoryNameSingular: "Physique",
                        measurementSynonymSingularLowercase : "physique measurement",
                        icon: "ion-ios-body"
                    },
                    "Sleep": {
                        defaultAbbreviatedUnitName: "",
                        helpText: "What aspect of sleep do you want to record?",
                        variableCategoryName: "Sleep",
                        variableCategoryNameSingular: "Sleep",
                        measurementSynonymSingularLowercase : "Sleep Measurement",
                        icon: "ion-ios-moon-outline"
                    },
                    "Symptoms": {
                        defaultAbbreviatedUnitName: "/5",
                        helpText: "What symptom do you want to record?",
                        variableCategoryName: "Symptoms",
                        variableCategoryNameSingular: "Symptom",
                        measurementSynonymSingularLowercase : "rating",
                        icon: "ion-sad-outline"
                    },
                    "Treatments": {
                        defaultAbbreviatedUnitName : "mg",
                        helpText : "What treatment do you want to record?",
                        variableCategoryName : "Treatments",
                        variableCategoryNameSingular : "Treatment",
                        defaultValueLabel : "Dosage",
                        defaultValuePlaceholderText : "Enter dose value here...",
                        measurementSynonymSingularLowercase : "dose",
                        icon: "ion-ios-medkit-outline"
                    },
                    "Vital Signs": {
                        defaultAbbreviatedUnitName: '',
                        helpText: "What vital sign do you want to record?",
                        variableCategoryName: "Vital Signs",
                        variableCategoryNameSingular: "Vital Sign",
                        measurementSynonymSingularLowercase : "measurement",
                        icon: "ion-ios-pulse"
                    }
                };
                
                var selectedVariableCategoryObject = variableCategoryInfo.Anything;
                if(variableCategoryName && variableCategoryInfo[variableCategoryName]){
                    selectedVariableCategoryObject =  variableCategoryInfo[variableCategoryName];
                }
                
                return selectedVariableCategoryObject;
            },

            // refresh local variable categories with QuantiModo API
            refreshVariableCategories : function(){
                var deferred = $q.defer();

                QuantiModo.getVariableCategories(function(vars){
                    localStorageService.setItem('variableCategories',JSON.stringify(vars));
                    deferred.resolve(vars);
                }, function(error){
                    deferred.reject(error);
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
                        QuantiModo.getVariableCategories(function(variableCategories){
                            localStorageService.setItem('variableCategories', JSON.stringify(variableCategories));
                            deferred.resolve(variableCategories);
                        }, function(error){
                            deferred.reject(error);
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
                
            },
            attachVariableCategoryIcons : function(dataArray){
                if(!dataArray){
                    return;
                }
                var variableCategoryInfo;
                for(var i = 0; i < dataArray.length; i++){
                    variableCategoryInfo = this.getVariableCategoryInfo(dataArray[i].variableCategoryName);
                    if(variableCategoryInfo.icon){
                        if(!dataArray[i].icon){
                            dataArray[i].icon = variableCategoryInfo.icon;
                        }
                    } else {
                        console.warn('Could not find icon for variableCategoryName ' + dataArray[i].variableCategoryName);
                        return 'ion-speedometer';
                    }
                }
                return dataArray;
            }
        };

    });