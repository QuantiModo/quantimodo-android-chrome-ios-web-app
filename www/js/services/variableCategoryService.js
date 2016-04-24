angular.module('starter')
    // Variable Category Service
    .factory('variableCategoryService', function(){

        return {
            getVariableCategoryInfo: function (variableCategoryName) {

                var variableCategoryInfo =
                {
                    "Anything": {
                        defaultUnitAbbreviatedName: false,
                        help_text: "What do you want to record?",
                        variable_category_name: "Anything",
                        variable_category_name_singular_lowercase: "anything"
                    },
                    "Vital Signs": {
                        defaultUnitAbbreviatedName: false,
                        help_text: "What vital sign do you want to record?",
                        variable_category_name: "Vital Signs",
                        variable_category_name_singular_lowercase: "vital sign"
                    },
                    Foods: {
                        defaultUnitAbbreviatedName: "serving",
                        help_text: "What did you eat?",
                        variable_category_name: "Foods",
                        variable_category_name_singular_lowercase: "food"
                    },
                    Emotions: {
                        defaultUnitAbbreviatedName: "/5",
                        help_text: "What emotion do you want to rate?",
                        variable_category_name: "Emotions",
                        variable_category_name_singular_lowercase: "emotion"
                    },
                    Symptoms: {
                        defaultUnitAbbreviatedName: "/5",
                        help_text: "What symptom do you want to record?",
                        variable_category_name: "Symptoms",
                        variable_category_name_singular_lowercase: "symptom"
                    },
                    Treatments: {
                        defaultUnitAbbreviatedName: "mg",
                        help_text: "What treatment do you want to record?",
                        variable_category_name: "Treatments",
                        variable_category_name_singular_lowercase: "treatment",
                        defaultValueLabel: "Dosage",
                        defaultValuePlaceholderText: "Enter dose value here..."

                    },
                    "Physical Activity": {
                        defaultUnitAbbreviatedName: false,
                        help_text: "What physical activity do you want to record?",
                        variable_category_name: "Physical Activity",
                        variable_category_name_singular_lowercase: "physical activity"
                    }
                };

                if(variableCategoryName){
                    return variableCategoryInfo[variableCategoryName];
                }

                return variableCategoryInfo['Anything'];
            }
        };
    });