angular.module('starter')
    // Variable Category Service
    .factory('variableCategoryService', function(){

        return {
            getVariableCategoryInfo: function (variableCategoryName) {

                var variableCategoryInfo =
                {
                    "Anything": {
                        defaultUnitAbbreviatedName: '',
                        help_text: "What do you want to record?",
                        variable_category_name: "Anything",
                        variable_category_name_singular_lowercase: "anything",
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
                        defaultUnitAbbreviatedName: '',
                        help_text: "What physical activity do you want to record?",
                        variable_category_name: "Physical Activity",
                        variable_category_name_singular_lowercase: "physical activity"
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
                            $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variable_category_name.toLowerCase()), 1);
                    }

                    if(!selectedVariableCategoryObject.addNewVariableCardText){
                        selectedVariableCategoryObject.addNewVariableCardText = "Add a new "
                            + $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variable_category_name.toLowerCase(), 1));
                    }

                    if(!selectedVariableCategoryObject.variableSearchPlaceholderText){
                        if(variableCategoryName){
                            selectedVariableCategoryObject.variableSearchPlaceholderText =
                                "Search for a "
                                + $filter('wordAliases')(pluralize(selectedVariableCategoryObject.variable_category_name.toLowerCase(), 1))
                                + " here..";
                        }
                    }

                } else {
                    selectedVariableCategoryObject = variableCategoryInfo['Anything'];
                }
                
                return selectedVariableCategoryObject;
            }
        };
    });