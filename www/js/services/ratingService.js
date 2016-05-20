angular.module('starter')
	.factory('ratingService', function(){
        
		var ratingService = {

            getPrimaryOutcomeVariableOptionLabels : function(shouldShowNumbers){
                if(shouldShowNumbers || !config.appSettings.primaryOutcomeVariableRatingOptionLabels){
                    return ['1',  '2',  '3',  '4', '5'];
                } else {
                    return config.appSettings.primaryOutcomeVariableRatingOptionLabels;
                }
            },
            
            getImageForPrimaryOutcomeVariableByValue : function(val){
                var filtered_list = this.appSettings.positiveRatingOptions.filter(function(option){
                    return option.value === val;
                });
    
                return filtered_list.length? filtered_list[0].img || false : false;
            },

            getImageForPrimaryOutcomeVariableByNumber : function(num){
                var primaryOutcomeVariable = this.appSettings.primaryOutcomeValueConversionDataSet[num] ?
                    this.appSettings.primaryOutcomeValueConversionDataSet[num] : false;
                return primaryOutcomeVariable ? 
                    ratingService.getImageForPrimaryOutcomeVariableByValue(primaryOutcomeVariable) : false;
            },
    
            getPrimaryOutcomeVariableByNumber : function(num){
                return this.appSettings.primaryOutcomeValueConversionDataSet[num] ?
                    this.appSettings.primaryOutcomeValueConversionDataSet[num] : false;
            },

            getRatingFaceImageByValue : function(value){
                var positiveRatingOptions = ratingService.getPositiveRatingOptions();
                
                var filteredList = positiveRatingOptions.filter(
                    function(option){
                    return option.value === value;
                });

                return filteredList.length ? filteredList[0].img || false : false;
            },

            getPositiveRatingOptions : function() {
                return [
                    {
                        numericValue: 1,
                        displayDescription: 'Depressed',
                        value: 'depressed',
                        img: 'img/ic_face_depressed.png'
                    },
                    {
                        numericValue: 2,
                        displayDescription: 'Sad',
                        value: 'sad',
                        img: 'img/ic_face_sad.png'
                    },
                    {
                        numericValue: 3,
                        displayDescription: 'OK',
                        value: 'ok',
                        img: 'img/ic_face_ok.png'
                    },
                    {
                        numericValue: 4,
                        displayDescription: 'Happy',
                        value: 'happy',
                        img: 'img/ic_face_happy.png'
                    },
                    {
                        numericValue: 5,
                        displayDescription: 'Ecstatic',
                        value: 'ecstatic',
                        img: 'img/ic_face_ecstatic.png'
                    }
                ]
            },

            getNegativeRatingOptions : function() {
                return [
                    {
                        numericValue: 1,
                        displayDescription: 'Ecstatic',
                        value: 'ecstatic',
                        img: 'img/ic_face_ecstatic.png'
                    },
                    {
                        numericValue: 2,
                        displayDescription: 'Happy',
                        value: 'happy',
                        img: 'img/ic_face_happy.png'
                    },
                    {
                        numericValue: 3,
                        displayDescription: 'OK',
                        value: 'ok',
                        img: 'img/ic_face_ok.png'
                    },
                    {
                        numericValue: 4,
                        displayDescription: 'Sad',
                        value: 'sad',
                        img: 'img/ic_face_sad.png'
                    },
                    {
                        numericValue: 5,
                        displayDescription: 'Depressed',
                        value: 'depressed',
                        img: 'img/ic_face_depressed.png'
                    }
                ]
            },

            getNumericRatingOptions : function() {
                return [
                    {
                        value: '1',
                        img: 'img/ic_1.png'
                    },
                    {
                        value: '2',
                        img: 'img/ic_2.png'
                    },
                    {
                        value: '3',
                        img: 'img/ic_3.png'
                    },
                    {
                        value: '4',
                        img: 'img/ic_4.png'
                    },
                    {
                        value: '5',
                        img: 'img/ic_5.png'
                    }
                ]
            }
		};

		return ratingService;
	});