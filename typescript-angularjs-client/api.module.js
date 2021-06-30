"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var api = __importStar(require("./api/api"));
var angular = __importStar(require("angular"));
var apiModule = angular.module('api', [])
    .service('ActivitiesApi', api.ActivitiesApi)
    .service('AnalyticsApi', api.AnalyticsApi)
    .service('AppSettingsApi', api.AppSettingsApi)
    .service('AuthenticationApi', api.AuthenticationApi)
    .service('ConnectorsApi', api.ConnectorsApi)
    .service('FeedApi', api.FeedApi)
    .service('FriendsApi', api.FriendsApi)
    .service('GroupsApi', api.GroupsApi)
    .service('MeasurementsApi', api.MeasurementsApi)
    .service('MessagesApi', api.MessagesApi)
    .service('NotificationsApi', api.NotificationsApi)
    .service('RemindersApi', api.RemindersApi)
    .service('SharesApi', api.SharesApi)
    .service('StudiesApi', api.StudiesApi)
    .service('UnitsApi', api.UnitsApi)
    .service('UserApi', api.UserApi)
    .service('VariablesApi', api.VariablesApi)
    .service('XprofileApi', api.XprofileApi);
exports.default = apiModule;
//# sourceMappingURL=api.module.js.map