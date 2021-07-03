import * as api from './api/api';
import * as angular from 'angular';

const apiModule = angular.module('api', [])
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
.service('XprofileApi', api.XprofileApi)

export default apiModule;
