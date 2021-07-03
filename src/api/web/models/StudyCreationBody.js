/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export var StudyCreationBody;
(function (StudyCreationBody) {
    /**
     * Individual studies are based on data of a single user. Group studies are based on data from a specific group of individuals who have joined.  Global studies are based on aggregated and anonymously shared data from all users.
     */
    let type;
    (function (type) {
        type["INDIVIDUAL"] = "individual";
        type["GROUP"] = "group";
        type["GLOBAL"] = "global";
    })(type = StudyCreationBody.type || (StudyCreationBody.type = {}));
})(StudyCreationBody || (StudyCreationBody = {}));
