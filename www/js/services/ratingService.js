angular.module('starter')
	.factory('ratingService', function(variableCategoryService){
        
		var ratingService = {

            getRatingInfo : function() {
                var ratingInfo =
                { 
                    1 : {
                            displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[0],
                            positiveImage: config.appSettings.positiveRatingImages[0],
                            negativeImage: config.appSettings.negativeRatingImages[0],
                            numericImage:  config.appSettings.numericRatingImages[0],
                        },
                    2 : {
                            displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[1],
                            positiveImage: config.appSettings.positiveRatingImages[1],
                            negativeImage: config.appSettings.negativeRatingImages[1],
                            numericImage:  config.appSettings.numericRatingImages[1],
                        },
                    3 : {
                            displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[2],
                            positiveImage: config.appSettings.positiveRatingImages[2],
                            negativeImage: config.appSettings.negativeRatingImages[2],
                            numericImage:  config.appSettings.numericRatingImages[2],
                        },
                    4 : {
                            displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[3],
                            positiveImage: config.appSettings.positiveRatingImages[3],
                            negativeImage: config.appSettings.negativeRatingImages[3],
                            numericImage:  config.appSettings.numericRatingImages[3],
                        },
                    5 : {
                            displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[4],
                            positiveImage: config.appSettings.positiveRatingImages[4],
                            negativeImage: config.appSettings.negativeRatingImages[4],
                            numericImage:  config.appSettings.numericRatingImages[4],
                        }
                };
                return ratingInfo;
            },

            getPrimaryOutcomeVariableOptionLabels : function(shouldShowNumbers){
                if(shouldShowNumbers || !config.appSettings.primaryOutcomeVariableRatingOptionLabels){
                    return ['1',  '2',  '3',  '4', '5'];
                } else {
                    return config.appSettings.primaryOutcomeVariableRatingOptionLabels;
                }
            },

            getPositiveImageByRatingValue : function(numericValue){
                var positiveRatingOptions = this.getPositiveRatingOptions();
                var filteredList = positiveRatingOptions.filter(function(option){
                    return option.numericValue === numericValue;
                });
                return filteredList.length? filteredList[0].img || false : false;
            },

            getNegativeImageByRatingValue : function(numericValue){
                var negativeRatingOptions = this.getNegativeRatingOptions();
                var filteredList = negativeRatingOptions.filter(function(option){
                    return option.numericValue === numericValue;
                });

                return filteredList.length? filteredList[0].img || false : false;
            },

            getNumericImageByRatingValue : function(numericValue){
                var numericRatingOptions = this.getNumericRatingOptions();
                var filteredList = numericRatingOptions.filter(function(option){
                    return option.numericValue === numericValue;
                });

                return filteredList.length? filteredList[0].img || false : false;
            },
    
            getPrimaryOutcomeVariableByNumber : function(num){
                return config.appSettings.ratingValueToTextConversionDataSet[num] ?
                    config.appSettings.ratingValueToTextConversionDataSet[num] : false;
            },

            getRatingFaceImageByText : function(lowerCaseRatingTextDescription){
                var positiveRatingOptions = ratingService.getPositiveRatingOptions();
                
                var filteredList = positiveRatingOptions.filter(
                    function(option){
                    return option.lowerCaseTextDescription === lowerCaseRatingTextDescription;
                });

                return filteredList.length ? filteredList[0].img || false : false;
            },

            getPositiveRatingOptions : function() {
                return [
                    {
                        numericValue: 1,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[0],
                        lowerCaseTextDescription: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[0],
                        img: config.appSettings.positiveRatingImages[0]
                    },
                    {
                        numericValue: 2,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[1],
                        lowerCaseTextDescription: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[1],
                        img: config.appSettings.positiveRatingImages[1]
                    },
                    {
                        numericValue: 3,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[2],
                        lowerCaseTextDescription: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[2],
                        img: config.appSettings.positiveRatingImages[2],
                    },
                    {
                        numericValue: 4,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[3],
                        lowerCaseTextDescription: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[3],
                        img: config.appSettings.positiveRatingImages[3]
                    },
                    {
                        numericValue: 5,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[4],
                        lowerCaseTextDescription: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[4],
                        img: config.appSettings.positiveRatingImages[4]
                    }
                ];
            },

            getNegativeRatingOptions : function() {
                return [
                    {
                        numericValue: 1,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[4],
                        value: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[4],
                        img: config.appSettings.negativeRatingImages[0]
                    },
                    {
                        numericValue: 2,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[3],
                        value: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[3],
                        img: config.appSettings.negativeRatingImages[1]
                    },
                    {
                        numericValue: 3,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[2],
                        value: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[2],
                        img: config.appSettings.negativeRatingImages[2]
                    },
                    {
                        numericValue: 4,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[1],
                        value: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[1],
                        img: config.appSettings.negativeRatingImages[3]
                    },
                    {
                        numericValue: 5,
                        displayDescription: config.appSettings.primaryOutcomeVariableRatingOptionLabels[0],
                        value: config.appSettings.primaryOutcomeVariableRatingOptionLowercaseLabels[0],
                        img: config.appSettings.negativeRatingImages[4]
                    }
                ];
            },

            getNumericRatingOptions : function() {
                return [
                    {
                        numericValue: 1,
                        img: config.appSettings.numericRatingImages[0]
                    },
                    {
                        numericValue: 2,
                        img: config.appSettings.numericRatingImages[1]
                    },
                    {
                        numericValue: 3,
                        img: config.appSettings.numericRatingImages[2]
                    },
                    {
                        numericValue: 4,
                        img: config.appSettings.numericRatingImages[3]
                    },
                    {
                        numericValue: 5,
                        img: config.appSettings.numericRatingImages[4]
                    }
                ];
            },
            
            addImagesToMeasurements : function (measurements){
                var ratingInfo = ratingService.getRatingInfo();
                var index;
                for (index = 0; index < measurements.length; ++index) {
                    if(!measurements[index].variableName){
                        measurements[index].variableName = measurements[index].variable;
                    }
                    if(measurements[index].variableName === config.appSettings.primaryOutcomeVariableDetails.name){
                        measurements[index].variableDescription = config.appSettings.primaryOutcomeVariableDetails.description;
                    }

                    if (measurements[index].abbreviatedUnitName === '/5') {
                        measurements[index].roundedValue = Math.round(measurements[index].value);
                    }

                    measurements[index].valueUnitVariableName = measurements[index].value + measurements[index].abbreviatedUnitName + ' ' + measurements[index].variableName;
                    if(measurements[index].valueUnitVariableName.length > 29){
                        measurements[index].valueUnitVariableName =  measurements[index].valueUnitVariableName.substring(0, 29)+'...';
                    }

                    // if (measurements[index].abbreviatedUnitName === '%') {
                    //     measurements[index].roundedValue = Math.round(measurements[index].value / 25 + 1);
                    // }

                    if (measurements[index].roundedValue && measurements[index].variableDescription === 'positive') {
                        if (ratingInfo[measurements[index].roundedValue]) {
                            measurements[index].image = ratingInfo[measurements[index].roundedValue].positiveImage;
                        }
                    }

                    if (measurements[index].roundedValue && measurements[index].variableDescription === 'negative') {
                        if (ratingInfo[measurements[index].roundedValue]) {
                            measurements[index].image = ratingInfo[measurements[index].roundedValue].negativeImage;
                        }
                    }

                    if (!measurements[index].image && measurements[index].roundedValue) {
                        if (ratingInfo[measurements[index].roundedValue]) {
                            measurements[index].image = ratingInfo[measurements[index].roundedValue].numericImage;
                        }
                    }

                    if (measurements[index].variableCategoryName){
                        measurements[index].icon =
                            variableCategoryService.getVariableCategoryIcon(measurements[index].variableCategoryName);
                    }
                }
                return measurements;
            }
		};

		return ratingService;
	});