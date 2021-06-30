"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var configuration_1 = require("./configuration");
var activities_service_1 = require("./api/activities.service");
var analytics_service_1 = require("./api/analytics.service");
var appSettings_service_1 = require("./api/appSettings.service");
var authentication_service_1 = require("./api/authentication.service");
var connectors_service_1 = require("./api/connectors.service");
var feed_service_1 = require("./api/feed.service");
var friends_service_1 = require("./api/friends.service");
var groups_service_1 = require("./api/groups.service");
var measurements_service_1 = require("./api/measurements.service");
var messages_service_1 = require("./api/messages.service");
var notifications_service_1 = require("./api/notifications.service");
var reminders_service_1 = require("./api/reminders.service");
var shares_service_1 = require("./api/shares.service");
var studies_service_1 = require("./api/studies.service");
var units_service_1 = require("./api/units.service");
var user_service_1 = require("./api/user.service");
var variables_service_1 = require("./api/variables.service");
var xprofile_service_1 = require("./api/xprofile.service");
var ApiModule = /** @class */ (function () {
    function ApiModule(parentModule, http) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
                'See also https://github.com/angular/angular/issues/20575');
        }
    }
    ApiModule_1 = ApiModule;
    ApiModule.forRoot = function (configurationFactory) {
        return {
            ngModule: ApiModule_1,
            providers: [{ provide: configuration_1.Configuration, useFactory: configurationFactory }]
        };
    };
    var ApiModule_1;
    ApiModule = ApiModule_1 = __decorate([
        core_1.NgModule({
            imports: [],
            declarations: [],
            exports: [],
            providers: [
                activities_service_1.ActivitiesService,
                analytics_service_1.AnalyticsService,
                appSettings_service_1.AppSettingsService,
                authentication_service_1.AuthenticationService,
                connectors_service_1.ConnectorsService,
                feed_service_1.FeedService,
                friends_service_1.FriendsService,
                groups_service_1.GroupsService,
                measurements_service_1.MeasurementsService,
                messages_service_1.MessagesService,
                notifications_service_1.NotificationsService,
                reminders_service_1.RemindersService,
                shares_service_1.SharesService,
                studies_service_1.StudiesService,
                units_service_1.UnitsService,
                user_service_1.UserService,
                variables_service_1.VariablesService,
                xprofile_service_1.XprofileService
            ]
        }),
        __param(0, core_1.Optional()), __param(0, core_1.SkipSelf()),
        __param(1, core_1.Optional())
    ], ApiModule);
    return ApiModule;
}());
exports.ApiModule = ApiModule;
