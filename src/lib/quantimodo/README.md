# quantimodo

[![Greenkeeper badge](https://badges.greenkeeper.io/QuantiModo/quantimodo-sdk-javascript.svg)](https://greenkeeper.io/)

Quantimodo - JavaScript client for quantimodo
QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).

## Installation

### For [Node.js](https://nodejs.org/)

#### npm

Then install it via:

```shell
npm install quantimodo --save
```

You should now be able to `require('quantimodo')` in javascript files from the directory you ran the last 
command above from.

### For browser

```shell
bower install quantimodo --save
```

Then include *lib/quantimodo/quantimodo-web.js* in the HTML pages.

## Getting Started

Please follow the [installation](#installation) instruction and execute the following JS code:

```javascript
var Quantimodo = require('quantimodo');

var defaultClient = Quantimodo.ApiClient.instance;

// Configure API key authorization: access_token
var access_token = defaultClient.authentications['access_token'];
access_token.apiKey = "YOUR API KEY"
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix['access_token'] = "Token"

// Configure OAuth2 access token for authorization: quantimodo_oauth2
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = "YOUR ACCESS TOKEN"

var api = new Quantimodo.AnalyticsApi()

var body = new Quantimodo.VoteDelete(); // {VoteDelete} The cause and effect variable names for the predictor vote to be deleted.

var opts = { 
  'userId': 3.4, // {Number} User's id
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
api.deleteVote(body, opts, callback);

```

## Documentation for API Endpoints

All URIs are relative to *https://app.quantimo.do/api*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*Quantimodo.ActivitiesApi* | [**getActivities**](docs/ActivitiesApi.md#getActivities) | **GET** /v3/activities | Get Activities
*Quantimodo.ActivitiesApi* | [**postActivities**](docs/ActivitiesApi.md#postActivities) | **POST** /v3/activities | Post Activities
*Quantimodo.AnalyticsApi* | [**getCorrelationExplanations**](docs/AnalyticsApi.md#getCorrelationExplanations) | **GET** /v3/correlations/explanations | Get correlation explanations
*Quantimodo.AnalyticsApi* | [**getCorrelations**](docs/AnalyticsApi.md#getCorrelations) | **GET** /v3/correlations | Get correlations
*Quantimodo.AppSettingsApi* | [**getAppSettings**](docs/AppSettingsApi.md#getAppSettings) | **GET** /v3/appSettings | Get client app settings
*Quantimodo.AuthenticationApi* | [**getAccessToken**](docs/AuthenticationApi.md#getAccessToken) | **GET** /v3/oauth2/token | Get a user access token
*Quantimodo.AuthenticationApi* | [**getOauthAuthorizationCode**](docs/AuthenticationApi.md#getOauthAuthorizationCode) | **GET** /v3/oauth2/authorize | Request Authorization Code
*Quantimodo.AuthenticationApi* | [**postGoogleIdToken**](docs/AuthenticationApi.md#postGoogleIdToken) | **POST** /v3/googleIdToken | Post GoogleIdToken
*Quantimodo.ConnectorsApi* | [**connectConnector**](docs/ConnectorsApi.md#connectConnector) | **GET** /v3/connectors/{connectorName}/connect | Obtain a token from 3rd party data source
*Quantimodo.ConnectorsApi* | [**disconnectConnector**](docs/ConnectorsApi.md#disconnectConnector) | **GET** /v3/connectors/{connectorName}/disconnect | Delete stored connection info
*Quantimodo.ConnectorsApi* | [**getConnectors**](docs/ConnectorsApi.md#getConnectors) | **GET** /v3/connectors/list | List of Connectors
*Quantimodo.ConnectorsApi* | [**getIntegrationJs**](docs/ConnectorsApi.md#getIntegrationJs) | **GET** /v3/integration.js | Get embeddable connect javascript
*Quantimodo.ConnectorsApi* | [**getMobileConnectPage**](docs/ConnectorsApi.md#getMobileConnectPage) | **GET** /v3/connect/mobile | Mobile connect page
*Quantimodo.ConnectorsApi* | [**updateConnector**](docs/ConnectorsApi.md#updateConnector) | **GET** /v3/connectors/{connectorName}/update | Sync with data source
*Quantimodo.FeedApi* | [**getFeed**](docs/FeedApi.md#getFeed) | **GET** /v3/feed | Tracking reminder notifications, messages, and study results
*Quantimodo.FeedApi* | [**postFeed**](docs/FeedApi.md#postFeed) | **POST** /v3/feed | Post user interactions with feed
*Quantimodo.FriendsApi* | [**getFriends**](docs/FriendsApi.md#getFriends) | **GET** /v3/friends | Get Friends
*Quantimodo.FriendsApi* | [**postFriends**](docs/FriendsApi.md#postFriends) | **POST** /v3/friends | Post Friends
*Quantimodo.GroupsApi* | [**getGroups**](docs/GroupsApi.md#getGroups) | **GET** /v3/groups | Get Groups
*Quantimodo.GroupsApi* | [**getGroupsMembers**](docs/GroupsApi.md#getGroupsMembers) | **GET** /v3/groupsMembers | Get GroupsMembers
*Quantimodo.GroupsApi* | [**postGroups**](docs/GroupsApi.md#postGroups) | **POST** /v3/groups | Post Groups
*Quantimodo.GroupsApi* | [**postGroupsMembers**](docs/GroupsApi.md#postGroupsMembers) | **POST** /v3/groupsMembers | Post GroupsMembers
*Quantimodo.MeasurementsApi* | [**deleteMeasurement**](docs/MeasurementsApi.md#deleteMeasurement) | **DELETE** /v3/measurements/delete | Delete a measurement
*Quantimodo.MeasurementsApi* | [**getMeasurements**](docs/MeasurementsApi.md#getMeasurements) | **GET** /v3/measurements | Get measurements for this user
*Quantimodo.MeasurementsApi* | [**getPairs**](docs/MeasurementsApi.md#getPairs) | **GET** /v3/pairs | Get pairs of measurements for correlational analysis
*Quantimodo.MeasurementsApi* | [**measurementExportRequest**](docs/MeasurementsApi.md#measurementExportRequest) | **POST** /v2/measurements/exportRequest | Post Request for Measurements CSV
*Quantimodo.MeasurementsApi* | [**postMeasurements**](docs/MeasurementsApi.md#postMeasurements) | **POST** /v3/measurements/post | Post a new set or update existing measurements to the database
*Quantimodo.MeasurementsApi* | [**updateMeasurement**](docs/MeasurementsApi.md#updateMeasurement) | **POST** /v3/measurements/update | Update a measurement
*Quantimodo.MessagesApi* | [**getMessagesMessages**](docs/MessagesApi.md#getMessagesMessages) | **GET** /v3/messagesMessages | Get MessagesMessages
*Quantimodo.MessagesApi* | [**getMessagesNotices**](docs/MessagesApi.md#getMessagesNotices) | **GET** /v3/messagesNotices | Get MessagesNotices
*Quantimodo.MessagesApi* | [**getMessagesRecipients**](docs/MessagesApi.md#getMessagesRecipients) | **GET** /v3/messagesRecipients | Get MessagesRecipients
*Quantimodo.MessagesApi* | [**postMessagesMessages**](docs/MessagesApi.md#postMessagesMessages) | **POST** /v3/messagesMessages | Post MessagesMessages
*Quantimodo.MessagesApi* | [**postMessagesNotices**](docs/MessagesApi.md#postMessagesNotices) | **POST** /v3/messagesNotices | Post MessagesNotices
*Quantimodo.MessagesApi* | [**postMessagesRecipients**](docs/MessagesApi.md#postMessagesRecipients) | **POST** /v3/messagesRecipients | Post MessagesRecipients
*Quantimodo.NotificationsApi* | [**getNotificationPreferences**](docs/NotificationsApi.md#getNotificationPreferences) | **GET** /v3/notificationPreferences | Get NotificationPreferences
*Quantimodo.NotificationsApi* | [**getNotifications**](docs/NotificationsApi.md#getNotifications) | **GET** /v3/notifications | Get Notifications
*Quantimodo.NotificationsApi* | [**postDeviceToken**](docs/NotificationsApi.md#postDeviceToken) | **POST** /v3/deviceTokens | Post DeviceTokens
*Quantimodo.NotificationsApi* | [**postNotifications**](docs/NotificationsApi.md#postNotifications) | **POST** /v3/notifications | Post Notifications
*Quantimodo.RemindersApi* | [**deleteTrackingReminder**](docs/RemindersApi.md#deleteTrackingReminder) | **DELETE** /v3/trackingReminders/delete | Delete Tracking Reminder
*Quantimodo.RemindersApi* | [**getTrackingReminderNotifications**](docs/RemindersApi.md#getTrackingReminderNotifications) | **GET** /v3/trackingReminderNotifications | Get specific tracking reminder notifications
*Quantimodo.RemindersApi* | [**getTrackingReminders**](docs/RemindersApi.md#getTrackingReminders) | **GET** /v3/trackingReminders | Get repeating tracking reminder settings
*Quantimodo.RemindersApi* | [**postTrackingReminderNotifications**](docs/RemindersApi.md#postTrackingReminderNotifications) | **POST** /v3/trackingReminderNotifications | Snooze, skip, or track a tracking reminder notification
*Quantimodo.RemindersApi* | [**postTrackingReminders**](docs/RemindersApi.md#postTrackingReminders) | **POST** /v3/trackingReminders | Store a Tracking Reminder
*Quantimodo.SharesApi* | [**deleteShare**](docs/SharesApi.md#deleteShare) | **POST** /v3/shares/delete | Delete share
*Quantimodo.SharesApi* | [**getShares**](docs/SharesApi.md#getShares) | **GET** /v3/shares | Get Authorized Apps, Studies, and Individuals
*Quantimodo.SharesApi* | [**inviteShare**](docs/SharesApi.md#inviteShare) | **POST** /v3/shares/invite | Delete share
*Quantimodo.StudiesApi* | [**createStudy**](docs/StudiesApi.md#createStudy) | **POST** /v3/study/create | Create a Study
*Quantimodo.StudiesApi* | [**deleteVote**](docs/StudiesApi.md#deleteVote) | **DELETE** /v3/votes/delete | Delete vote
*Quantimodo.StudiesApi* | [**getOpenStudies**](docs/StudiesApi.md#getOpenStudies) | **GET** /v3/studies/open | These are open studies that anyone can join
*Quantimodo.StudiesApi* | [**getStudies**](docs/StudiesApi.md#getStudies) | **GET** /v3/studies | Get Personal or Population Studies
*Quantimodo.StudiesApi* | [**getStudiesCreated**](docs/StudiesApi.md#getStudiesCreated) | **GET** /v3/studies/created | Get studies you have created
*Quantimodo.StudiesApi* | [**getStudiesJoined**](docs/StudiesApi.md#getStudiesJoined) | **GET** /v3/studies/joined | Studies You Have Joined
*Quantimodo.StudiesApi* | [**getStudy**](docs/StudiesApi.md#getStudy) | **GET** /v4/study | Get Study
*Quantimodo.StudiesApi* | [**joinStudy**](docs/StudiesApi.md#joinStudy) | **POST** /v3/study/join | Join a Study
*Quantimodo.StudiesApi* | [**postVote**](docs/StudiesApi.md#postVote) | **POST** /v3/votes | Post or update vote
*Quantimodo.StudiesApi* | [**publishStudy**](docs/StudiesApi.md#publishStudy) | **POST** /v3/study/publish | Publish Your Study
*Quantimodo.UnitsApi* | [**getUnitCategories**](docs/UnitsApi.md#getUnitCategories) | **GET** /v3/unitCategories | Get unit categories
*Quantimodo.UnitsApi* | [**getUnits**](docs/UnitsApi.md#getUnits) | **GET** /v3/units | Get units
*Quantimodo.UserApi* | [**deleteUser**](docs/UserApi.md#deleteUser) | **DELETE** /v3/user/delete | Delete user
*Quantimodo.UserApi* | [**getUser**](docs/UserApi.md#getUser) | **GET** /v3/user | Get user info
*Quantimodo.UserApi* | [**getUserBlogs**](docs/UserApi.md#getUserBlogs) | **GET** /v3/userBlogs | Get UserBlogs
*Quantimodo.UserApi* | [**getUsers**](docs/UserApi.md#getUsers) | **GET** /v3/users | Get users who shared data
*Quantimodo.UserApi* | [**postUserBlogs**](docs/UserApi.md#postUserBlogs) | **POST** /v3/userBlogs | Post UserBlogs
*Quantimodo.UserApi* | [**postUserSettings**](docs/UserApi.md#postUserSettings) | **POST** /v3/userSettings | Post UserSettings
*Quantimodo.VariablesApi* | [**deleteUserTag**](docs/VariablesApi.md#deleteUserTag) | **DELETE** /v3/userTags/delete | Delete user tag or ingredient
*Quantimodo.VariablesApi* | [**deleteUserVariable**](docs/VariablesApi.md#deleteUserVariable) | **DELETE** /v3/userVariables/delete | Delete All Measurements For Variable
*Quantimodo.VariablesApi* | [**getVariableCategories**](docs/VariablesApi.md#getVariableCategories) | **GET** /v3/variableCategories | Variable categories
*Quantimodo.VariablesApi* | [**getVariables**](docs/VariablesApi.md#getVariables) | **GET** /v3/variables | Get variables along with related user-specific analysis settings and statistics
*Quantimodo.VariablesApi* | [**postUserTags**](docs/VariablesApi.md#postUserTags) | **POST** /v3/userTags | Post or update user tags or ingredients
*Quantimodo.VariablesApi* | [**postUserVariables**](docs/VariablesApi.md#postUserVariables) | **POST** /v3/variables | Update User Settings for a Variable
*Quantimodo.VariablesApi* | [**resetUserVariableSettings**](docs/VariablesApi.md#resetUserVariableSettings) | **POST** /v3/userVariables/reset | Reset user settings for a variable to defaults
*Quantimodo.XprofileApi* | [**getXprofileData**](docs/XprofileApi.md#getXprofileData) | **GET** /v3/xprofileData | Get XprofileData
*Quantimodo.XprofileApi* | [**getXprofileFields**](docs/XprofileApi.md#getXprofileFields) | **GET** /v3/xprofileFields | Get XprofileFields
*Quantimodo.XprofileApi* | [**getXprofileGroups**](docs/XprofileApi.md#getXprofileGroups) | **GET** /v3/xprofileGroups | Get XprofileGroups
*Quantimodo.XprofileApi* | [**postXprofileData**](docs/XprofileApi.md#postXprofileData) | **POST** /v3/xprofileData | Post XprofileData
*Quantimodo.XprofileApi* | [**postXprofileFields**](docs/XprofileApi.md#postXprofileFields) | **POST** /v3/xprofileFields | Post XprofileFields
*Quantimodo.XprofileApi* | [**postXprofileGroups**](docs/XprofileApi.md#postXprofileGroups) | **POST** /v3/xprofileGroups | Post XprofileGroups


## Documentation for Models

 - [Quantimodo.ActivitiesResponse](docs/ActivitiesResponse.md)
 - [Quantimodo.Activity](docs/Activity.md)
 - [Quantimodo.AppSettings](docs/AppSettings.md)
 - [Quantimodo.AppSettingsResponse](docs/AppSettingsResponse.md)
 - [Quantimodo.AuthorizedClients](docs/AuthorizedClients.md)
 - [Quantimodo.Button](docs/Button.md)
 - [Quantimodo.Card](docs/Card.md)
 - [Quantimodo.Chart](docs/Chart.md)
 - [Quantimodo.CommonResponse](docs/CommonResponse.md)
 - [Quantimodo.ConnectInstructions](docs/ConnectInstructions.md)
 - [Quantimodo.ConversionStep](docs/ConversionStep.md)
 - [Quantimodo.Correlation](docs/Correlation.md)
 - [Quantimodo.DataSource](docs/DataSource.md)
 - [Quantimodo.DeviceToken](docs/DeviceToken.md)
 - [Quantimodo.Error](docs/Error.md)
 - [Quantimodo.Explanation](docs/Explanation.md)
 - [Quantimodo.ExplanationStartTracking](docs/ExplanationStartTracking.md)
 - [Quantimodo.FeedResponse](docs/FeedResponse.md)
 - [Quantimodo.Friend](docs/Friend.md)
 - [Quantimodo.FriendsResponse](docs/FriendsResponse.md)
 - [Quantimodo.GetConnectorsResponse](docs/GetConnectorsResponse.md)
 - [Quantimodo.GetCorrelationsDataResponse](docs/GetCorrelationsDataResponse.md)
 - [Quantimodo.GetCorrelationsResponse](docs/GetCorrelationsResponse.md)
 - [Quantimodo.GetSharesResponse](docs/GetSharesResponse.md)
 - [Quantimodo.GetStudiesResponse](docs/GetStudiesResponse.md)
 - [Quantimodo.GetTrackingReminderNotificationsResponse](docs/GetTrackingReminderNotificationsResponse.md)
 - [Quantimodo.Group](docs/Group.md)
 - [Quantimodo.GroupsMember](docs/GroupsMember.md)
 - [Quantimodo.GroupsMembersResponse](docs/GroupsMembersResponse.md)
 - [Quantimodo.GroupsResponse](docs/GroupsResponse.md)
 - [Quantimodo.Image](docs/Image.md)
 - [Quantimodo.InputField](docs/InputField.md)
 - [Quantimodo.JsonErrorResponse](docs/JsonErrorResponse.md)
 - [Quantimodo.Measurement](docs/Measurement.md)
 - [Quantimodo.MeasurementDelete](docs/MeasurementDelete.md)
 - [Quantimodo.MeasurementItem](docs/MeasurementItem.md)
 - [Quantimodo.MeasurementSet](docs/MeasurementSet.md)
 - [Quantimodo.MeasurementUpdate](docs/MeasurementUpdate.md)
 - [Quantimodo.MessagesMessage](docs/MessagesMessage.md)
 - [Quantimodo.MessagesMessagesResponse](docs/MessagesMessagesResponse.md)
 - [Quantimodo.MessagesNotice](docs/MessagesNotice.md)
 - [Quantimodo.MessagesNoticesResponse](docs/MessagesNoticesResponse.md)
 - [Quantimodo.MessagesRecipient](docs/MessagesRecipient.md)
 - [Quantimodo.MessagesRecipientsResponse](docs/MessagesRecipientsResponse.md)
 - [Quantimodo.Notification](docs/Notification.md)
 - [Quantimodo.NotificationsResponse](docs/NotificationsResponse.md)
 - [Quantimodo.Pair](docs/Pair.md)
 - [Quantimodo.ParticipantInstruction](docs/ParticipantInstruction.md)
 - [Quantimodo.PostMeasurementsDataResponse](docs/PostMeasurementsDataResponse.md)
 - [Quantimodo.PostMeasurementsResponse](docs/PostMeasurementsResponse.md)
 - [Quantimodo.PostStudyCreateResponse](docs/PostStudyCreateResponse.md)
 - [Quantimodo.PostStudyPublishResponse](docs/PostStudyPublishResponse.md)
 - [Quantimodo.PostTrackingRemindersDataResponse](docs/PostTrackingRemindersDataResponse.md)
 - [Quantimodo.PostTrackingRemindersResponse](docs/PostTrackingRemindersResponse.md)
 - [Quantimodo.PostUserSettingsDataResponse](docs/PostUserSettingsDataResponse.md)
 - [Quantimodo.PostUserSettingsResponse](docs/PostUserSettingsResponse.md)
 - [Quantimodo.ShareInvitationBody](docs/ShareInvitationBody.md)
 - [Quantimodo.Study](docs/Study.md)
 - [Quantimodo.StudyCharts](docs/StudyCharts.md)
 - [Quantimodo.StudyCreationBody](docs/StudyCreationBody.md)
 - [Quantimodo.StudyHtml](docs/StudyHtml.md)
 - [Quantimodo.StudyImages](docs/StudyImages.md)
 - [Quantimodo.StudyJoinResponse](docs/StudyJoinResponse.md)
 - [Quantimodo.StudyLinks](docs/StudyLinks.md)
 - [Quantimodo.StudySharing](docs/StudySharing.md)
 - [Quantimodo.StudyText](docs/StudyText.md)
 - [Quantimodo.StudyVotes](docs/StudyVotes.md)
 - [Quantimodo.TrackingReminder](docs/TrackingReminder.md)
 - [Quantimodo.TrackingReminderDelete](docs/TrackingReminderDelete.md)
 - [Quantimodo.TrackingReminderNotification](docs/TrackingReminderNotification.md)
 - [Quantimodo.TrackingReminderNotificationAction](docs/TrackingReminderNotificationAction.md)
 - [Quantimodo.TrackingReminderNotificationPost](docs/TrackingReminderNotificationPost.md)
 - [Quantimodo.TrackingReminderNotificationTrackAllAction](docs/TrackingReminderNotificationTrackAllAction.md)
 - [Quantimodo.Unit](docs/Unit.md)
 - [Quantimodo.UnitCategory](docs/UnitCategory.md)
 - [Quantimodo.User](docs/User.md)
 - [Quantimodo.UserBlog](docs/UserBlog.md)
 - [Quantimodo.UserBlogsResponse](docs/UserBlogsResponse.md)
 - [Quantimodo.UserTag](docs/UserTag.md)
 - [Quantimodo.UserVariableDelete](docs/UserVariableDelete.md)
 - [Quantimodo.UsersResponse](docs/UsersResponse.md)
 - [Quantimodo.Variable](docs/Variable.md)
 - [Quantimodo.VariableCategory](docs/VariableCategory.md)
 - [Quantimodo.VariableCharts](docs/VariableCharts.md)
 - [Quantimodo.Vote](docs/Vote.md)
 - [Quantimodo.VoteDelete](docs/VoteDelete.md)
 - [Quantimodo.XprofileDataResponse](docs/XprofileDataResponse.md)
 - [Quantimodo.XprofileDatum](docs/XprofileDatum.md)
 - [Quantimodo.XprofileField](docs/XprofileField.md)
 - [Quantimodo.XprofileFieldsResponse](docs/XprofileFieldsResponse.md)
 - [Quantimodo.XprofileGroup](docs/XprofileGroup.md)
 - [Quantimodo.XprofileGroupsResponse](docs/XprofileGroupsResponse.md)


## Documentation for Authorization


### access_token

- **Type**: API key
- **API key parameter name**: access_token
- **Location**: URL query string

### client_id

- **Type**: API key
- **API key parameter name**: clientId
- **Location**: URL query string

### quantimodo_oauth2

- **Type**: OAuth
- **Flow**: accessCode
- **Authorization URL**: https://app.quantimo.do/api/v1/oauth/authorize
- **Scopes**: 
  - basic: Allows you to read user info (display name, email, etc)
  - readmeasurements: Allows one to read a user&#39;s measurements
  - writemeasurements: Allows you to write user measurements

