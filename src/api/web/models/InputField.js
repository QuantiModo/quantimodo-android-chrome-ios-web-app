/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export var InputField;
(function (InputField) {
    /**
     * Ex: Title
     */
    let type;
    (function (type) {
        type["CHECK_BOX"] = "check_box";
        type["DATE"] = "date";
        type["EMAIL"] = "email";
        type["NUMBER"] = "number";
        type["POSTAL_CODE"] = "postal_code";
        type["SELECT_OPTION"] = "select_option";
        type["STRING"] = "string";
        type["SWITCH"] = "switch";
        type["TEXT_AREA"] = "text_area";
        type["UNIT"] = "unit";
        type["VARIABLE_CATEGORY"] = "variable_category";
    })(type = InputField.type || (InputField.type = {}));
})(InputField || (InputField = {}));
