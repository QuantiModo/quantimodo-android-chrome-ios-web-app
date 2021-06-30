import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { ActivitiesService } from './api/activities.service';
import { AnalyticsService } from './api/analytics.service';
import { AppSettingsService } from './api/appSettings.service';
import { AuthenticationService } from './api/authentication.service';
import { ConnectorsService } from './api/connectors.service';
import { FeedService } from './api/feed.service';
import { FriendsService } from './api/friends.service';
import { GroupsService } from './api/groups.service';
import { MeasurementsService } from './api/measurements.service';
import { MessagesService } from './api/messages.service';
import { NotificationsService } from './api/notifications.service';
import { RemindersService } from './api/reminders.service';
import { SharesService } from './api/shares.service';
import { StudiesService } from './api/studies.service';
import { UnitsService } from './api/units.service';
import { UserService } from './api/user.service';
import { VariablesService } from './api/variables.service';
import { XprofileService } from './api/xprofile.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    ActivitiesService,
    AnalyticsService,
    AppSettingsService,
    AuthenticationService,
    ConnectorsService,
    FeedService,
    FriendsService,
    GroupsService,
    MeasurementsService,
    MessagesService,
    NotificationsService,
    RemindersService,
    SharesService,
    StudiesService,
    UnitsService,
    UserService,
    VariablesService,
    XprofileService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
