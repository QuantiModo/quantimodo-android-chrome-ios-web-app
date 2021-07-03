"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyCreationBody = void 0;
var StudyCreationBody;
(function (StudyCreationBody) {
    /**
     * Individual studies are based on data of a single user. Group studies are based on data from a specific group of individuals who have joined.  Global studies are based on aggregated and anonymously shared data from all users.
     */
    var type;
    (function (type) {
        type["INDIVIDUAL"] = "individual";
        type["GROUP"] = "group";
        type["GLOBAL"] = "global";
    })(type = StudyCreationBody.type || (StudyCreationBody.type = {}));
})(StudyCreationBody = exports.StudyCreationBody || (exports.StudyCreationBody = {}));
//# sourceMappingURL=StudyCreationBody.js.map