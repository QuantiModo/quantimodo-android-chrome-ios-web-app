angular.module('starter').factory('configurationService', function($http, $q, $rootScope, $state, qmService, $timeout){
    var configurationService = {
        getAppsListFromLocalStorage: function(){
            return qm.storage.getItem(qm.items.appList);
        },
        getAppSettingsArrayFromApi: function(){
            qmLog.info("getAppSettingsArrayFromApi...");
            var deferred = $q.defer();
            var params = qm.api.addGlobalParams({all: true, designMode: true});
            qm.api.get('api/v1/appSettings', [], params, function(response){
                qmLog.debug(response);
                /** @namespace response.allAppSettings */
                var appList = configurationService.convertAppSettingsToAppList(response.allAppSettings);
                configurationService.saveAppList(appList);
                configurationService.allAppSettings = response.allAppSettings;
                deferred.resolve(response.allAppSettings);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        saveAppList: function(appList){
            qm.storage.setItem(qm.items.appList, appList);
        },
        convertAppSettingsToAppList: function(appSettingsArray){
            if(!appSettingsArray){
                return [];
            }
            var appList = [];
            for(var i = 0; i < appSettingsArray.length; i++){
                appList.push({
                    clientId: appSettingsArray[i].clientId,
                    appDisplayName: appSettingsArray[i].appDisplayName,
                    appIcon: appSettingsArray[i].additionalSettings.appImages.appIcon
                });
            }
            return appList;
        },
        setBuilderClientId: function(clientId){
            qm.storage.setItem(qm.items.builderClientId, clientId);
        },
        menu: {
            addSubMenuItem: function(parentMenuItem){
                parentMenuItem.subMenu = parentMenuItem.subMenu || [];
                var subMenuItem = JSON.parse(JSON.stringify(parentMenuItem));
                subMenuItem.title = "Edit Me";
                subMenuItem.subMenu = null;
                parentMenuItem.subMenu.push(subMenuItem);
                parentMenuItem.showSubMenu = true;
                $rootScope.openEditAppSettingsModal('menu', subMenuItem);
            }
        },
        reminders: {
            editReminderCallback: function(editedReminder){
                var reminders = configurationService.reminders.getDefaultTrackingReminderSettings();
                reminders = reminders.filter(function(reminder){
                    return reminder.variableId !== editedReminder.variableId;
                });
                reminders.push(editedReminder);
                $timeout(function(){ // Ensure changes are applied
                    $rootScope.appSettings.appDesign.defaultTrackingReminderSettings.active = reminders;
                }, 0);
                configurationService.saveRevisionAndPostAppSettingsAfterConfirmation($rootScope.appSettings);
                qmService.goToState(qm.afterEditReminderGoTo);
                qm.editReminderCallback = qm.afterEditReminderGoTo = null;
            },
            addReminder: function($state){
                qm.afterEditReminderGoTo = $state.current.name;
                qm.editReminderCallback = configurationService.reminders.editReminderCallback;
                qmService.goToState(qm.staticData.stateNames.reminderSearch);
            },
            editReminder: function(reminder, $state){
                qm.afterEditReminderGoTo = $state.current.name;
                qm.editReminderCallback = configurationService.reminders.editReminderCallback;
                qmService.goToState(qm.staticData.stateNames.reminderAdd, {reminder: reminder});
            },
            deleteReminder: function(reminderToDelete){
                var reminders = configurationService.reminders.getDefaultTrackingReminderSettings();
                reminders = reminders.filter(function(reminder){
                    return reminder.variableId !== reminderToDelete.variableId;
                });
                configurationService.saveRevisionAndPostAppSettingsAfterConfirmation($rootScope.appSettings);
            },
            getDefaultTrackingReminderSettings: function(){
                if(!$rootScope.appSettings.appDesign.defaultTrackingReminderSettings){
                    $rootScope.appSettings.appDesign.defaultTrackingReminderSettings = {};
                }
                if(!$rootScope.appSettings.appDesign.defaultTrackingReminderSettings.active){
                    $rootScope.appSettings.appDesign.defaultTrackingReminderSettings.active = [];
                }
                return $rootScope.appSettings.appDesign.defaultTrackingReminderSettings.active;
            }
        }
    };
    var menuItems = {
        inbox: {
            "title": "Reminder Inbox",
            "stateName": "app.remindersInbox",
            "icon": "ion-archive"
        },
        favorites: {
            "title": "Favorites",
            "stateName": "app.favorites",
            "icon": "ion-ios-star"
        },
        settings: {
            "title": "Settings",
            "stateName": "app.settings",
            "icon": "ion-ios-gear-outline"
        },
        helpAndFeedback: {
            "title": "Help & Feedback",
            "stateName": "app.feedback",
            "icon": "ion-ios-help-outline"
        },
        treatments: {
            "title": "Treatments",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Treatments"},
            "icon": "ion-ios-medkit-outline"
        },
        symptoms: {
            "title": "Symptoms",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Symptoms"},
            "icon": "ion-sad-outline"
        },
        vitalSigns: {
            "title": "Vital Signs",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Vital Signs"},
            "icon": "ion-ios-pulse"
        },
        emotions: {
            "title": "Emotions",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Emotions"},
            "icon": "ion-happy-outline"
        },
        foods: {
            "title": "Foods",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Foods"},
            "icon": "ion-ios-nutrition-outline"
        },
        physicalActivity: {
            "title": "Physical Activity",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Physical Activity"},
            "icon": "ion-ios-body-outline"
        },
        importData: {
            "title": "Import Data",
            "stateName": "app.import",
            "icon": "ion-ios-cloud-download-outline"
        },
        chartSearch: {
            "title": "Charts",
            "stateName": "app.chartSearch",
            "icon": "ion-arrow-graph-up-right"
        },
        everything: {
            "title": "Everything",
            "stateName": "app.variableListCategory", "params": {"variableCategoryName": "Anything"},
            "icon": "ion-android-globe"
        },
        studyCreation: {
            "title": "Create Study",
            "stateName": "app.studyCreation",
            "icon": "ion-erlenmeyer-flask"
        },
        studies: {
            "title": "Discoveries",
            "stateName": qm.staticData.stateNames.studies,
            "icon": "ion-wand"
        },
        predictorSearch: {
            "title": "Predictor Search",
            "stateName": "app.predictorSearch",
            "icon": "ion-log-in"
        },
        outcomeSearch: {
            "title": "Outcome Search",
            "stateName": "app.outcomeSearch",
            "icon": "ion-log-out"
        }
    };
    var subMenus = {
        manageReminders: [
            {
                "title": "All Reminders",
                "stateName": "app.remindersManage",
                "icon": "ion-android-globe"
            },
            {
                "title": "Emotions",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Emotions"},
                "icon": "ion-happy-outline"
            },
            {
                "title": "Foods",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Foods"},
                "icon": "ion-ios-nutrition-outline"
            },
            {
                "title": "Physical Activity",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Physical Activity"},
                "icon": "ion-ios-body-outline"
            },
            {
                "title": "Symptoms",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Symptoms"},
                "icon": "ion-sad-outline"
            },
            {
                "title": "Treatments",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-ios-medkit-outline"
            },
            {
                "title": "Vital Signs",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Vital Signs"},
                "icon": "ion-ios-pulse"
            }
        ],
        recordMeasurement: [
            {
                "title": "Track Anything",
                "stateName": "app.measurementAddSearch",
                "icon": "ion-android-globe"
            },
            {
                "title": "Record a Meal",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Foods"},
                "icon": "ion-ios-nutrition-outline"
            },
            {
                "title": "Rate an Emotion",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Emotions"},
                "icon": "ion-happy-outline"
            },
            {
                "title": "Rate a Symptom",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Symptoms"},
                "icon": "ion-ios-pulse"
            },
            {
                "title": "Record a Treatment",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-ios-medkit-outline"
            },
            {
                "title": "Record Activity",
                "stateName": qm.staticData.stateNames.measurementAddSearch,
                "params": {"variableCategoryName": "Physical Activity"},
                "icon": "ion-ios-body-outline"
            },
            {
                "title": "Record Vital Sign",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Vital Signs"},
                "icon": "ion-ios-pulse"
            }
        ],
        overallMood: [
            {
                "title": "Charts",
                "stateName": "app.track",
                "icon": "ion-arrow-graph-up-right"
            },
            {
                "title": "History",
                "stateName": "app.history",
                "icon": ionIcons.history
            },
            {
                "title": "Positive Predictors",
                "stateName": "app.predictorsPositive",
                "icon": "ion-happy-outline"
            },
            {
                "title": "Negative Predictors",
                "stateName": "app.predictorsNegative",
                "icon": "ion-sad-outline"
            }
        ],
        history: [
            {
                "title": "All Measurements",
                "stateName": "app.historyAll",
                "icon": "ion-android-globe"
            },
            {
                "title": "Emotions",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Emotions"},
                "icon": "ion-happy-outline"
            },
            {
                "title": "Foods",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Foods"},
                "icon": "ion-ios-nutrition-outline"
            },
            {
                "title": "Symptoms",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Symptoms"},
                "icon": "ion-sad-outline"
            },
            {
                "title": "Treatments",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-ios-medkit-outline"
            },
            {
                "title": "Physical Activity",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Physical Activity"},
                "icon": "ion-ios-body-outline"
            },
            {
                "title": "Vital Signs",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Vital Signs"},
                "icon": "ion-ios-pulse"
            },
            {
                "title": "Locations",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Location"},
                "icon": "ion-ios-location-outline"
            }
        ],
        discoveries: [
            menuItems.predictorSearch,
            menuItems.outcomeSearch,
            menuItems.studyCreation,
            menuItems.studies
        ],
        discoveriesWithMood: [
            menuItems.predictorSearch,
            menuItems.outcomeSearch,
            {
                "title": "Positive Mood",
                "stateName": "app.predictorsPositive",
                "icon": "ion-happy-outline"
            },
            {
                "title": "Negative Mood",
                "stateName": "app.predictorsNegative",
                "icon": "ion-sad-outline"
            },
            menuItems.studyCreation,
            menuItems.studies
        ],
        medications: [
            {
                "title": "Overdue",
                "stateName": "app.remindersInboxCategory", "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-clock"
            },
            {
                "title": "Today's Schedule",
                "stateName": "app.remindersInboxTodayCategory", "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-android-sunny"
            },
            {
                "title": "Manage Scheduled",
                "stateName": "app.manage-scheduled-meds",
                "icon": "ion-android-notifications-none"
            },
            {
                "title": "As-Needed Meds",
                "stateName": "app.as-needed-meds",
                "icon": "ion-ios-medkit-outline"
            },
            {
                "title": "Record a Dose",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-edit"
            },
            {
                "title": "History",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Treatments"},
                "icon": "ion-ios-paper-outline"
            }
        ],
        symptoms: [
            {
                "title": "Manage Reminders",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Symptoms"},
                "icon": "ion-android-notifications-none"
            },
            {
                "title": "Rate Symptom",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Symptoms"},
                "icon": "ion-edit"
            },
            {
                "title": "History",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Symptoms"},
                "icon": "ion-ios-paper-outline"
            }
        ],
        vitalSigns: [
            {
                "title": "Manage Reminders",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Vital Signs"},
                "icon": "ion-android-notifications-none"
            },
            {
                "title": "Record Now",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Vital Signs"},
                "icon": "ion-edit"
            },
            {
                "title": "History",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Vital Signs"},
                "icon": "ion-ios-paper-outline"
            }
        ],
        physicalActivity: [
            {
                "title": "Manage Reminders",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Physical Activity"},
                "icon": "ion-android-notifications-none"
            },
            {
                "title": "Record Activity",
                "stateName": qm.staticData.stateNames.measurementAddSearch,
                "params": {"variableCategoryName": "Physical Activity"},
                "icon": "ion-edit"
            },
            {
                "title": "History",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Physical Activity"},
                "icon": "ion-ios-paper-outline"
            }
        ],
        emotions: [
            {
                "title": "Manage Reminders",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Emotions"},
                "icon": "ion-android-notifications-none"
            },
            {
                "title": "Record Rating",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Emotions"},
                "icon": "ion-edit"
            },
            {
                "title": "History",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Emotions"},
                "icon": "ion-ios-paper-outline"
            }
        ],
        diet: [
            {
                "title": "Manage Reminders",
                "stateName": "app.remindersManageCategory", "params": {"variableCategoryName": "Foods"},
                "icon": "ion-android-notifications-none"
            },
            {
                "title": "Record Meal",
                "stateName": qm.staticData.stateNames.measurementAddSearch, "params": {"variableCategoryName": "Foods"},
                "icon": "ion-edit"
            },
            {
                "title": "History",
                "stateName": qm.staticData.stateNames.historyAllCategory, "params": {"variableCategoryName": "Foods"},
                "icon": "ion-ios-paper-outline"
            }
        ],
        variables: [
            menuItems.everything,
            menuItems.treatments,
            menuItems.symptoms,
            menuItems.vitalSigns,
            menuItems.emotions,
            menuItems.foods,
            menuItems.physicalActivity
        ]
    };
    var parentMenus = {
        overallMood: {
            "title": "Overall Mood",
            "icon": "ion-happy-outline",
            "subMenu": subMenus.overallMood
        },
        manageReminders: {
            "title": "Manage Reminders",
            "subMenu": subMenus.manageReminders,
            "icon": "ion-android-notifications-none"
        },
        recordMeasurement: {
            "title": "Record Measurement",
            "subMenu": subMenus.recordMeasurement,
            "icon": "ion-compose"
        },
        history: {
            "title": "History",
            "subMenu": subMenus.history,
            "icon": ionIcons.history
        },
        discoveries: {
            "title": "Discoveries",
            "subMenu": subMenus.discoveries,
            "icon": "ion-ios-analytics"
        },
        variables: {
            "title": "My Variables",
            "subMenu": subMenus.variables,
            "icon": "ion-android-globe"
        },
        medications: {
            "title": "Medications",
            "subMenu": subMenus.medications,
            "icon": "ion-ios-medkit-outline"
        },
        symptoms: {
            "title": "Symptoms",
            "subMenu": subMenus.symptoms,
            "icon": "ion-sad-outline"
        },
        vitalSigns: {
            "title": "Vital Signs",
            "subMenu": subMenus.vitalSigns,
            "icon": "ion-ios-pulse"
        },
        physicalActivity: {
            "title": "Physical Activity",
            "subMenu": subMenus.physicalActivity,
            "icon": "ion-ios-body-outline"
        },
        emotions: {
            "title": "Emotions",
            "subMenu": subMenus.emotions,
            "icon": "ion-happy-outline"
        },
        diet: {
            "title": "Diet",
            "subMenu": subMenus.diet,
            "icon": "ion-ios-nutrition-outline"
        }
    };
    var floatingActionButtons = {
        help: {
            "icon": "ion-help",
            "label": "Get Help",
            "stateName": "app.help",
            "stateParameters": {}
        },
        importData: {
            "icon": "ion-ios-cloud-download-outline",
            "label": "Import Data",
            "stateName": "app.import",
            "stateParameters": {}
        },
        recordMeasurement: {
            "icon": "ion-compose",
            "label": "Record a Measurement",
            "stateName": "app.measurementAddSearch",
            "stateParameters": {variableCategoryName: "Anything"}
        },
        addReminder: {
            "icon": "ion-android-notifications-none",
            "label": "Add a Reminder",
            "stateName": "app.reminderSearch",
            "stateParameters": {variableCategoryName: "Anything"}
        }
    };
    var introSlides = {
        hi: {
            diet: {
                "title": "Hi! I'm  __APP_DISPLAY_NAME__!",
                "color": qmService.colors.green,
                "image": {"url": "img/robots/robot-waving.svg"},
                "overlayIcon": true,
                "bodyText": "I'm going to use data to help you take the guesswork out of healthy eating!"
            },
            general: {
                "title": "Hi! I'm  __APP_DISPLAY_NAME__!",
                "color": "green",
                "image": {"url": "img/robots/robot-waving.svg"},
                "bodyText": "I've been programmed to reduce human suffering with data."
            },
            medication: {
                "title": "Welcome to __APP_DISPLAY_NAME__!",
                "color": qmService.colors.blue,
                "image": {"url": "https://quantimodo.s3.amazonaws.com/app_uploads/medimodo/app_images_appIcon.png"},
                "overlayIcon": true,
                "bodyText": "I'm going to help you and your physician use data to optimize your health!"
            }
        },
        youAreWhatYouEat: {
            "title": "You Are What You Eat",
            "color": qmService.colors.blue,
            "image": {"url": "img/intro/patient-frown-factors.png"},
            "bodyText": "Chronic diseases with nutritional solutions cost the US healthcare system billions of dollars each year and less than 2% of Americans eat an ideal diet."
        },
        onlyHuman: {
            "title": "Only Human",
            "color": qmService.colors.yellow,
            "image": {"url": "img/brains/brain-pink.svg"},
            "bodyText": "Human brains can only hold 7 numbers in working-memory at a time.  So on their own, they're not able to determine which diet is best for you. "
        },
        machineLearning: {
            "title": "Machine Learning",
            "color": qmService.colors.blue,
            "image": {"url": "img/robots/quantimodo-robot-brain.svg"},
            "bodyText": "My brain can hold trillions of numbers!  I can also analyze it to help your dietitian determine how different foods could be affecting your health! "
        },
        automatedTracking: {
            "title": "Automated Tracking",
            "color": qmService.colors.green,
            "image": {"url": "img/intro/download_2-96.png"},
            "bodyText": "Weight, blood pressure, heart rate, physical activity data can be collected automatically and imported from dozens of devices.  Weather and the amount of time spent at the gym, restaurants, work, or doctors offices can be collected via your phone's GPS."
        },
        effortlessTracking: {
            "title": "Effortless Tracking",
            "color": qmService.colors.yellow,
            "image": {"url": "img/intro/inbox.svg"},
            "bodyText": "By taking just a few minutes each day, you can easily record your diet and symptoms in the" +
                " Reminder Inbox.  The more data you give me, the smarter I get.  Your data doesn't have to be perfect to be valuable, but it's important to track regularly. "
        },
        dataSecurity: {
            "title": "Data Security",
            "color": qmService.colors.blue,
            "image": {"url": "img/intro/lock.svg"},
            "bodyText": "I use bank-level encryption to keep your data secure.  Human eyes will never see your data unless you intentionally share it. "
        },
        hiddenInfluences: {
            "title": "Hidden Influences",
            "color": qmService.colors.blue,
            "image": {"url": "img/intro/patient-frown-factors.png"},
            "bodyText": "Your symptoms can be worsened or improved by medical treatments, your sleep, exercise, " +
                "the hundreds of chemicals you consume through your diet, and even the weather!"
        },
        treatmentDetermination: {
            "title": "Treatment Determination",
            "color": "green",
            "image": {"url": "img/intro/doctor-frown-factors.png"},
            "bodyText": "Indeed, humans have access to less than 1% of the relevant information when they use " +
                "intuition to determine the best ways to treat your symptoms!"
        }
    };
    var onboardingPages = {
        addEmotionReminders: {
            id: "addEmotionRemindersCard",
            //"title": 'Varying Emotions?',
            "title": null,
            "color": qmService.colors.green,
            variableCategoryName: "Emotions",
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png"},
            //addButtonText: 'Add Emotion',
            //nextPageButtonText: 'Maybe Later',
            addButtonText: 'Yes',
            nextPageButtonText: 'No',
            "bodyText": "Do you regularly experience any unpleasant emotions?"
        },
        addSymptomReminders: {
            id: "addSymptomRemindersCard",
            //"title": 'Recurring Symptoms?',
            "title": null,
            "color": qmService.colors.blue,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png"},
            variableCategoryName: "Symptoms",
            //addButtonText: 'Add Symptom',
            //nextPageButtonText: 'Maybe Later',
            addButtonText: 'Yes',
            nextPageButtonText: 'No',
            "bodyText": 'Do you have any recurring symptoms?'
        },
        addFoodReminders: {
            id: "addFoodRemindersCard",
            //"title": 'Common Foods or Drinks?',
            "title": null,
            "color": qmService.colors.blue,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Food/vegetarian_food-96.png"},
            variableCategoryName: "Foods",
            //addButtonText: 'Add Food or Drink',
            //nextPageButtonText: 'Maybe Later',
            addButtonText: 'Yes',
            nextPageButtonText: 'No',
            "bodyText": "Are there any foods or drinks that you consume more than a few times a week?"
        },
        addTreatmentReminders: {
            id: "addTreatmentRemindersCard",
            //"title": 'Any Treatments?',
            "title": null,
            "color": qmService.colors.yellow,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Healthcare/pill-96.png"},
            variableCategoryName: "Treatments",
            //addButtonText: 'Add Treatment',
            //appComponentTypeChange(appSettings.appDesign.menu.type)nextPageButtonText: 'Maybe Later',
            addButtonText: 'Yes',
            nextPageButtonText: 'No',
            "bodyText": 'Are you taking any medications, treatments, supplements, or other interventions like meditation or psychotherapy? '
        },
        locationTracking: {
            id: "locationTrackingPage",
            "title": 'Location Tracking',
            "color": qmService.colors.green,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Maps/treasure_map-96.png"},
            variableCategoryName: "Location",
            premiumFeature: true,
            nextPageButtonText: 'Maybe Later',
            "bodyText": "Would you like to automatically log location to see how time spent at restaurants, the gym, work or doctors offices might be affecting you? "
        },
        weatherTracking: {
            id: "weatherTrackingPage",
            "title": 'Weather Tracking',
            "color": qmService.colors.green,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Weather/chance_of_storm-96.png"},
            variableCategoryName: "Environment",
            premiumFeature: false,
            nextPageButtonText: 'Maybe Later',
            "bodyText": "Would you like to automatically record the weather to see how temperature or sunlight exposure might be affecting you? "
        },
        importData: {
            id: "importDataPage",
            "title": 'Import Your Data',
            "color": qmService.colors.yellow,
            "image": {"url": "img/intro/download_2-96.png"},
            premiumFeature: true,
            "bodyText": "Let's go to the Import Data page and see if you're using any of the dozens of apps and devices that I can automatically pull data from!",
            nextPageButtonText: "Maybe Later"
        },
        livesWithFamilyQuestion: {
            id: "livesWithFamilyQuestion",
            "title": 'Do you have family living with you?',
            "variableName": "Lives with Family",
            "variableCategoryName": "Environment",
            "moreInfo": false,
            "unitAbbreviatedName": "yes/no",
            "color": qmService.colors.blue,
            "image": {"url": "img/family.svg"},
            premiumFeature: false,
            "bodyText": null
        },
        participatesInSupportNetworkQuestion: {
            id: "participatesInSupportNetworkQuestion",
            "title": 'Do you participate in a support network?',
            "variableName": "Participated in Support Network",
            "variableCategoryName": "Environment",
            "moreInfo": false,
            "unitAbbreviatedName": "yes/no",
            "color": qmService.colors.blue,
            "image": {"url": "img/family.svg"},
            premiumFeature: false,
            "bodyText": null
        },
        belongsToAdvocacyGroupQuestion: {
            id: "belongsToAdvocacyGroupQuestion",
            "title": 'Do you belong to an advocacy group?',
            "variableName": "Participated in Advocacy Group",
            "variableCategoryName": "Environment",
            "moreInfo": false,
            "unitAbbreviatedName": "yes/no",
            "color": qmService.colors.blue,
            "image": {"url": "img/family.svg"},
            premiumFeature: false,
            "bodyText": null
        },
        participateInDatabaseQuestion: {
            id: "participateInDatabaseQuestion",
            "title": 'Do you agree to participate in the database?',
            "variableName": "Agreed to Share Anonymous Data",
            "variableCategoryName": "Miscellaneous",
            "moreInfo": false,
            "unitAbbreviatedName": "yes/no",
            "color": qmService.colors.blue,
            "image": {"url": "img/family.svg"},
            premiumFeature: false,
            "bodyText": null
        },
        agreeToReceiveNewsletterQuestion: {
            id: "agreeToReceiveNewsletterQuestion",
            "title": 'Do you agree to receive our newsletter and other marketing materials?',
            "variableName": "Agreed to Receive Newsletter",
            "variableCategoryName": "Miscellaneous",
            "moreInfo": false,
            "unitAbbreviatedName": "yes/no",
            "color": qmService.colors.blue,
            "image": {"url": "img/family.svg"},
            premiumFeature: false,
            "bodyText": null,
        },
        agreeToShareCertainInformationQuestion: {
            id: "agreeToShareCertainInformationQuestion",
            "title": 'Do you agree to share certain information with others?',
            "variableName": "Agreed to Share Certain Information",
            "variableCategoryName": "Miscellaneous",
            "moreInfo": false,
            "unitAbbreviatedName": "yes/no",
            "color": qmService.colors.blue,
            "image": {"url": "img/family.svg"},
            premiumFeature: false,
            "bodyText": null,
        },
        allDone: {
            id: "allDoneCard",
            "title": 'Great job!',
            "color": qmService.colors.green,
            "image": {"url": "img/robots/robot-waving.svg"},
            "bodyText": "You're all set up!  Let's take a minute to record your first measurements and then you're done for the day! "
        }
    };
    var helpCards = {
        getStartedHelpCard: {
            "id": "getStartedHelpCard",
            "title": "Reminder Inbox",
            "icon": "ion-archive",
            "bodyText": "Scroll through the Inbox and press the appropriate button on each reminder notification. Each one only takes a few seconds. You'll be shocked at how much valuable data you can collect with just a few minutes in the Reminder Inbox each day!"
        },
        recordMeasurementInfoCard: {
            "id": "recordMeasurementInfoCard",
            "title": "Record Measurements",
            "icon": "ion-edit",
            "bodyText": "Want to just record a medication, food or symptom immediately instead of creating a reminder? Just go to the Record Measurement menu item and select the appropriate variable category. Alternatively, you can just press the little red button at the bottom of the screen."
        },
        chromeExtensionInfoCard: {
            "id": "chromeExtensionInfoCard",
            "title": "Track on the Computer",
            "icon": "ion-social-chrome",
            "bodyText": "Did you know that you can easily track everything on your laptop and desktop with our Google Chrome browser extension?  Your data is synced between devices so you'll never have to track twice!",
            "emailButton": {
                "type": "chrome",
                "text": "Send Me a Link",
                "ionIcon": "ion-checkmark"
            }
        },
        getHelpInfoCard: {
            "id": "getHelpInfoCard",
            "title": "Need Help?",
            "icon": "ion-help-circled",
            "bodyText": "If you need help or have any suggestions, please click the question mark in the upper right corner.",
            goToStateButton: {
                id: "locationButton",
                buttonText: 'Get Help',
                buttonClass: "button button-clear button-positive ion-checkmark",
                goToState: qm.staticData.stateNames.help
            }
        },
        getFitbitHelpInfoCard: {
            "id": "getFitbitHelpInfoCard",
            "title": "Automated Tracking",
            "icon": "ion-wand",
            "bodyText": "Want to automatically record your sleep, exercise, and heart rate?",
            "emailButton": {
                "type": "fitbit",
                "text": "Get Fitbit",
                "ionIcon": "ion-checkmark"
            }
        },
        locationTracking: {
            id: "locationTrackingPage",
            "title": 'Location Tracking',
            "color": qmService.colors.green,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Maps/treasure_map-96.png"},
            variableCategoryName: "Location",
            premiumFeature: true,
            nextPageButtonText: 'Maybe Later',
            goToStateButton: {
                id: "locationButton",
                buttonText: 'Enable in Settings',
                buttonClass: "button button-clear button-positive ion-checkmark",
                goToState: qm.staticData.stateNames.settings
            },
            "bodyText": "Would you like to automatically log location to see how time spent at restaurants, the gym, work or doctors offices might be affecting you? "
        },
        weatherTracking: {
            id: "weatherTrackingPage",
            "title": 'Weather Tracking',
            "color": qmService.colors.green,
            "image": {"url": "https://maxcdn.icons8.com/Color/PNG/96/Weather/chance_of_storm-96.png"},
            variableCategoryName: "Environment",
            premiumFeature: true,
            nextPageButtonText: 'Maybe Later',
            "bodyText": "Would you like to automatically record the weather to see how temperature or sunlight exposure might be affecting you? ",
            goToStateButton: {
                id: "weatherButton",
                buttonText: 'Import Weather Data',
                buttonClass: "button button-clear button-positive ion-checkmark",
                goToState: qm.staticData.stateNames.import
            }
        },
        importData: {
            id: "importDataPage",
            "title": 'Import Your Data',
            "color": qmService.colors.yellow,
            "image": {"url": "img/intro/download_2-96.png"},
            premiumFeature: true,
            "bodyText": "Let's go to the Import Data page and see if you're using any of the dozens of apps and devices that I can automatically pull data from!",
            nextPageButtonText: "Maybe Later",
            goToStateButton: {
                id: "importButton",
                buttonText: 'Import Your Data',
                buttonClass: "button button-clear button-positive ion-checkmark",
                goToState: qm.staticData.stateNames.import
            }
        }
    };
    configurationService.defaultDesigns = {
        "intro": {
            "diet": [
                introSlides.hi.diet,
                introSlides.youAreWhatYouEat,
                introSlides.onlyHuman,
                introSlides.machineLearning,
                introSlides.automatedTracking,
                introSlides.effortlessTracking,
                introSlides.dataSecurity
            ],
            "medication": [
                introSlides.hi.medication,
                introSlides.hiddenInfluences,
                introSlides.onlyHuman,
                introSlides.treatmentDetermination,
                introSlides.machineLearning,
                introSlides.automatedTracking,
                introSlides.effortlessTracking,
                introSlides.dataSecurity
            ],
            "mood": [
                introSlides.hi.general,
                introSlides.hiddenInfluences,
                introSlides.onlyHuman,
                introSlides.treatmentDetermination,
                introSlides.machineLearning,
                introSlides.automatedTracking,
                introSlides.effortlessTracking,
                introSlides.dataSecurity
            ],
            "general": [
                introSlides.hi.general,
                introSlides.hiddenInfluences,
                introSlides.onlyHuman,
                introSlides.treatmentDetermination,
                introSlides.machineLearning,
                introSlides.automatedTracking,
                introSlides.effortlessTracking,
                introSlides.dataSecurity
            ]
        },
        "floatingActionButton": {
            "diet": {
                "button1": {
                    "icon": "ion-android-notifications-none",
                    "label": "Add Frequent Food",
                    "stateName": "app.reminderSearch",
                    "stateParameters": {variableCategoryName: "Foods"}
                },
                "button2": {
                    "icon": "ion-compose",
                    "label": "Record a Meal",
                    "stateName": "app.measurementAddSearch",
                    "stateParameters": {variableCategoryName: "Foods"}
                },
                "button3": floatingActionButtons.importData,
                "button4": floatingActionButtons.help
            },
            "medication": {
                "button1": {
                    "icon": "ion-android-notifications-none",
                    "label": "Add a Medication",
                    "stateName": "app.reminderSearch",
                    "stateParameters": {variableCategoryName: "Treatments"}
                },
                "button2": {
                    "icon": "ion-compose",
                    "label": "Record a Dose",
                    "stateName": "app.measurementAddSearch",
                    "stateParameters": {variableCategoryName: "Treatments"}
                },
                "button3": floatingActionButtons.importData,
                "button4": floatingActionButtons.help
            },
            "mood": {
                "button1": floatingActionButtons.addReminder,
                "button2": floatingActionButtons.recordMeasurement,
                "button3": floatingActionButtons.importData,
                "button4": floatingActionButtons.help
            },
            "general": {
                "button1": floatingActionButtons.addReminder,
                "button2": floatingActionButtons.recordMeasurement,
                "button3": floatingActionButtons.importData,
                "button4": floatingActionButtons.help
            }
        },
        "onboarding": {
            "diet": [
                onboardingPages.addFoodReminders,
                onboardingPages.addSymptomReminders,
                onboardingPages.importData,
                onboardingPages.allDone
            ],
            "medication": [
                onboardingPages.addEmotionReminders,
                onboardingPages.addSymptomReminders,
                onboardingPages.addFoodReminders,
                onboardingPages.addTreatmentReminders,
                onboardingPages.locationTracking,
                onboardingPages.weatherTracking,
                onboardingPages.importData,
                onboardingPages.allDone
            ],
            "mood": [
                onboardingPages.addEmotionReminders,
                onboardingPages.addSymptomReminders,
                onboardingPages.addFoodReminders,
                onboardingPages.addTreatmentReminders,
                onboardingPages.locationTracking,
                onboardingPages.weatherTracking,
                onboardingPages.importData,
                onboardingPages.allDone
            ],
            "general": [
                onboardingPages.addEmotionReminders,
                onboardingPages.addSymptomReminders,
                onboardingPages.addFoodReminders,
                onboardingPages.addTreatmentReminders,
                onboardingPages.locationTracking,
                onboardingPages.weatherTracking,
                onboardingPages.importData,
                onboardingPages.allDone
            ],
            all: [
                onboardingPages.addEmotionReminders,
                onboardingPages.addSymptomReminders,
                onboardingPages.addFoodReminders,
                onboardingPages.addTreatmentReminders,
                onboardingPages.locationTracking,
                onboardingPages.weatherTracking,
                onboardingPages.importData,
                onboardingPages.belongsToAdvocacyGroupQuestion,
                onboardingPages.livesWithFamilyQuestion,
                onboardingPages.participatesInSupportNetworkQuestion,
                onboardingPages.agreeToReceiveNewsletterQuestion,
                onboardingPages.agreeToShareCertainInformationQuestion,
                onboardingPages.participateInDatabaseQuestion,
                onboardingPages.allDone
            ]
        },
        "menu": {
            extended: [
                menuItems.inbox,
                menuItems.favorites,
                parentMenus.overallMood,
                parentMenus.manageReminders,
                parentMenus.recordMeasurement,
                parentMenus.history,
                menuItems.importData,
                menuItems.chartSearch,
                parentMenus.discoveries,
                menuItems.settings,
                menuItems.helpAndFeedback
            ],
            general: [
                menuItems.inbox,
                parentMenus.variables,
                parentMenus.history,
                menuItems.importData,
                parentMenus.discoveries,
                menuItems.chartSearch,
                menuItems.settings
            ],
            medication: [
                menuItems.inbox,
                menuItems.treatments,
                parentMenus.variables,
                parentMenus.history,
                menuItems.importData,
                parentMenus.discoveries,
                menuItems.chartSearch,
                menuItems.settings
            ],
            diet: [
                menuItems.inbox,
                menuItems.foods,
                parentMenus.variables,
                parentMenus.history,
                menuItems.importData,
                parentMenus.discoveries,
                menuItems.chartSearch,
                menuItems.settings
            ],
            mood: [
                menuItems.inbox,
                parentMenus.overallMood,
                parentMenus.variables,
                parentMenus.history,
                menuItems.importData,
                parentMenus.discoveries,
                menuItems.chartSearch,
                menuItems.settings
            ]
        },
        "helpCard": {
            general: [
                helpCards.getStartedHelpCard,
                helpCards.recordMeasurementInfoCard,
                helpCards.chromeExtensionInfoCard,
                helpCards.getHelpInfoCard,
                helpCards.getFitbitHelpInfoCard,
                helpCards.locationTracking,
                helpCards.weatherTracking,
                helpCards.importData
            ]
        },
        "aliases": {
            "general": {
                "Physician": "Physician",
                "Patient": "Patient"
            },
            "diet": {
                "Physician": "Dietican",
                "Patient": "Client"
            },
            "mood": {
                "Physician": "Therapist",
                "Patient": "Client"
            }
        }
        //         "upgradePleadingCard": {
        //             "general": {
        //                 "web":{
        //                     "image":"img/ivy-sad-bw-300-300.png",
        //                     "text":"Please subscribe to my daddy's app or I'll be cold and hungry..."
        //                 },
        //                 "mobile":{
        //                    "image":"img/ivy-sad-bw.jpg",
        //                    "textHtml":"Please subscribe to my daddy's app or I'll be cold... <br> and hungry...</span>"
        //                  }
        //             },
        //             "disabled": null
        //         }
    };
    $rootScope.previewStates = {
        intro: "app.intro",
        onboarding: "app.onboarding"
    };
    function getPropertyNames(object, excludedPropertyName, type){
        var propertyNames = [];
        for(var propertyName in object){
            if(propertyName === excludedPropertyName){
                continue;
            }
            if(object.hasOwnProperty(propertyName)){
                if(type && typeof object.propertyName !== type){
                    continue;
                }
                propertyNames.push(propertyName);
            }
        }
        return propertyNames.sort();
    }
    function getValuesForSubPropertyInObject(object, subPropertyName){
        var values = [];
        for(var propertyName in object){
            if(object.hasOwnProperty(propertyName) && object[propertyName][subPropertyName]){
                values.push(object[propertyName][subPropertyName].toLowerCase());
            }
        }
        function onlyUnique(value, index, self){
            return self.indexOf(value) === index;
        }
        values = values.filter(onlyUnique);
        return values.sort();
    }
    function getValuesForSubPropertyInObjectPlusCustom(object, subPropertyName){
        var values = getValuesForSubPropertyInObject(object, subPropertyName);
        values.push("custom");
        return values.sort();
    }
    configurationService.appTypeData = {};
    function getAppTypeDataFromVariableCategories(){
        for(var variableCategoryName in $rootScope.variableCategories){
            if($rootScope.variableCategories.hasOwnProperty(variableCategoryName) && $rootScope.variableCategories[variableCategoryName].appType){
                configurationService.appTypeData[$rootScope.variableCategories[variableCategoryName].appType] = $rootScope.variableCategories[variableCategoryName];
            }
        }
    }
    getAppTypeDataFromVariableCategories();
    function getPropertyNamesPlusCustom(object){
        var propertyNames = getPropertyNames(object);
        propertyNames.push("custom");
        return propertyNames.sort();
    }
    function getAppComponent(appComponentName){
        if($rootScope.appSettings.appType !== "custom" && configurationService.defaultDesigns[appComponentName][$rootScope.appSettings.appType]){
            $rootScope.appSettings.appDesign[appComponentName].type = $rootScope.appSettings.appType;
        }
        if(!$rootScope.appSettings.appDesign[appComponentName].type){
            $rootScope.appSettings.appDesign[appComponentName].type = 'general';
        }
        var selectedType = $rootScope.appSettings.appDesign[appComponentName].type;
        var defaultComponent = configurationService.defaultDesigns[appComponentName][selectedType];
        if(!defaultComponent){
            qmLog.info("No default design for " + selectedType + " " + appComponentName);
            return null;
        }
        defaultComponent = JSON.parse(JSON.stringify(defaultComponent).replace('__APP_DISPLAY_NAME__', $rootScope.appSettings.appDisplayName));
        if(defaultComponent){
            if(!$rootScope.appSettings.appDesign[appComponentName].custom){
                $rootScope.appSettings.appDesign[appComponentName].custom = configurationService.defaultDesigns[appComponentName][selectedType];
            }
            return qmService.addColorsCategoriesAndNames(defaultComponent);
        }
        if(!$rootScope.appSettings.appDesign[appComponentName].custom){
            $rootScope.appSettings.appDesign[appComponentName].custom = configurationService.defaultDesigns[appComponentName].general;
        }
        return qmService.addColorsCategoriesAndNames($rootScope.appSettings.appDesign[appComponentName].custom);
    }
    $rootScope.appComponentNames = getPropertyNames(configurationService.defaultDesigns, "custom");
    $rootScope.appComponentOptions = {};
    for(var i = 0; i < $rootScope.appComponentNames.length; i++){
        $rootScope.appComponentOptions[$rootScope.appComponentNames[i]] = getPropertyNamesPlusCustom(configurationService.defaultDesigns[$rootScope.appComponentNames[i]]);
    }
    configurationService.setFallBackAppComponents = function(){
        for(var i = 0; i < $rootScope.appComponentNames.length; i++){
            if(!$rootScope.appSettings.appDesign[$rootScope.appComponentNames[i]]){
                var fallbackComponent = configurationService.defaultDesigns[$rootScope.appComponentNames[i]][$rootScope.appSettings.appType];
                $rootScope.appSettings.appDesign[$rootScope.appComponentNames[i]] = {
                    active: fallbackComponent,
                    type: $rootScope.appSettings.appType,
                    custom: fallbackComponent
                };
            }
        }
    };
    configurationService.updateAppComponentTypesAfterAppTypeChange = function(){
        if($rootScope.appSettings.appType !== "custom"){
            for(var i = 0; i < $rootScope.appComponentNames.length; i++){
                if(configurationService.defaultDesigns[$rootScope.appComponentNames[i]][$rootScope.appSettings.appType]){
                    $rootScope.appSettings.appDesign[$rootScope.appComponentNames[i]].type = $rootScope.appSettings.appType;
                }else{
                    $rootScope.appSettings.appDesign[$rootScope.appComponentNames[i]].type = "general";
                }
            }
        }
    };
    configurationService.updateAppComponents = function(){
        configurationService.setFallBackAppComponents();
        for(var i = 0; i < $rootScope.appComponentNames.length; i++){
            var appComponentName = $rootScope.appComponentNames[i];
            var appComponent = getAppComponent(appComponentName);
            if(appComponent){
                if(appComponentName === 'menu'){
                    //appComponent = qm.menu.stateName.addStateNamesToOneMenu(appComponent);
                }
                $rootScope.appSettings.appDesign[appComponentName].active = appComponent;
            }
        }
    };
    configurationService.convertAppSettingsRevisionsArrayToRevisionsList = function(revisions){
        var revisionsList = [];
        for(var i = 0; i < revisions.length; i++){
            revisionsList.push({
                appDisplayName: revisions[i].appDisplayName, revisionTime: revisions[i].revisionTime,
                appIcon: revisions[i].additionalSettings.appImages.appIcon
            });
        }
        return revisionsList;
    };
    configurationService.saveAppSettingsRevisionLocally = function(callback){
        qm.localForage.getItem(qm.items.appSettingsRevisions).then(function(savedRevisionsInDescendingOrder){
            if(!savedRevisionsInDescendingOrder){
                savedRevisionsInDescendingOrder = [];
            }
            var revisionsForCurrentClient = [];
            for(var i = 0; i > savedRevisionsInDescendingOrder.length; i++){
                var savedRevision = savedRevisionsInDescendingOrder[i];
                //if(savedRevision.clientId === $rootScope.appSettings.clientId){revisionsForCurrentClient.push(savedRevision);} // TODO: Might want to switch to this
                revisionsForCurrentClient.push(savedRevision);
                if(revisionsForCurrentClient.length > 5){
                    break;
                }
            }
            var currentRevision = JSON.parse(JSON.stringify($rootScope.appSettings)); // Decouple
            currentRevision.revisionTime = qm.timeHelper.getCurrentLocalDateAndTime();
            revisionsForCurrentClient.unshift(currentRevision);
            qmLog.info("Saving " + currentRevision.appDisplayName + " revision " + currentRevision.revisionTime);
            qm.localForage.setItem(qm.items.appSettingsRevisions, revisionsForCurrentClient);
            if(callback){
                var revisionsList = configurationService.convertAppSettingsRevisionsArrayToRevisionsList(revisionsForCurrentClient);
                callback(revisionsList);
            }
        });
    };
    configurationService.switchApp = function(selectedApp, callback){
        configurationService.setBuilderClientId(selectedApp.clientId);
        configurationService.saveAppSettingsRevisionLocally(function(revisionList){
            qmLog.info("Switching to " + selectedApp.appDisplayName + ": ", selectedApp);
            if(selectedApp.clientId === $rootScope.appSettings.clientId){
                callback(revisionList);
                return;  // Can't do this if we're using it for revisions
            }
            //window.location.href = window.location.origin + window.location.pathname + '#/app/configuration/' + selectedApp.clientId;
            qm.appsManager.getAppSettingsFromApi(selectedApp.clientId, function(appSettings){
                qmService.processAndSaveAppSettings(appSettings);
                configurationService.saveAppSettingsRevisionLocally(function(revisionList){
                    callback(revisionList);
                });
            });
        });
    };
    configurationService.saveRevisionAndPostAppSettingsAfterConfirmation = function(appSettings){
        if(!appSettings){
            appSettings = $rootScope.appSettings;
        }
        var deferred = $q.defer();
        console.debug("saveRevisionAndPostAppSettingsAfterConfirmation");
        configurationService.saveAppSettingsRevisionLocally(function(revisionList){
            configurationService.postAppSettingsAfterConfirmation(appSettings, function(response){
                deferred.resolve(revisionList);
            }, function(error){
                qmLog.error(error);
                deferred.reject(error);
            });
        });
        return deferred.promise;
    };
    configurationService.postAppSettingsAfterConfirmation = function(appSettings, successHandler, errorHandler, ev){
        if(!appSettings){
            appSettings = $rootScope.appSettings;
        }
        configurationService.setBuilderClientId(appSettings.clientId);
        var users = appSettings.users || configurationService.users;
        var numberOfUsers = (users) ? users.length : 0;
        var title = 'Save Settings';
        var textContent = 'Are you absolutely sure you want to save your settings for ' + appSettings.appDisplayName + " (" +
            appSettings.clientId + ") and apply your changes for your " + numberOfUsers + " users?";
        function yesCallback(){
            qmService.showInfoToast("Saving app settings...");
            qmService.showBasicLoader();
            $timeout(function(){ // Allow time to show toast first
                qm.api.post('api/v1/appSettings', appSettings, function(response){
                    //qmService.processAndSaveAppSettings(response.appSettings, successHandler);  // We'll over-write changes while posting
                    qmService.hideLoader();
                }, function(userErrorMessage){
                    qmService.showMaterialAlert("Could Not Save", userErrorMessage, ev);
                    if(errorHandler){
                        errorHandler(userErrorMessage);
                    }
                });
            }, 100);
        }
        function noCallback(){
            qmLog.info("Canceled save")
        }
        if(numberOfUsers > 5){  // Don't bother with brand new apps
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        }else{
            yesCallback();
        }
    };
    configurationService.defaultAppDescriptions = {
        general: "Better living through data",
        medication: "Better health through data",
        diet: "Better health through data",
        mood: "Discover new ways to improve your mood!"
    };
    $rootScope.appTypes = getValuesForSubPropertyInObjectPlusCustom($rootScope.variableCategories, 'appType');
    configurationService.replaceJsonString = function(search, replace, targetObject){
        var targetString = JSON.stringify(targetObject);
        targetString = targetString.replace(search + ',', replace + ',');
        targetString = targetString.replace(search, replace);
        targetString = targetString.replace(',,', ',');
        targetString = targetString.replace('[,{', '[{');
        targetString = targetString.replace('},]', '}]');
        return JSON.parse(targetString);
    };
    configurationService.deleteAppComponentElement = function(selectedComponentType, appSettingToDelete){
        var replacementString = '';
        configurationService.replaceAppSetting(selectedComponentType, appSettingToDelete, replacementString);
    };
    function guid(){
        function s4(){
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    configurationService.addAppComponentElement = function(selectedComponentType, appSettingToDuplicate){
        var appSettingToDuplicateWithUniqueId = appSettingToDuplicate;
        appSettingToDuplicateWithUniqueId.$hashKey = guid();
        var replacementString = JSON.stringify(appSettingToDuplicate) + ', ' + JSON.stringify(appSettingToDuplicateWithUniqueId);
        configurationService.replaceAppSetting(selectedComponentType, appSettingToDuplicate, replacementString);
    };
    var allStates = $state.get();
    var stateList = [];
    for(i = 0; i < allStates.length; i++){
        if(allStates[i].name.indexOf('app.') !== -1 && allStates[i].name.indexOf('configuration') === -1){
            stateList.push({name: allStates[i].name, hrefWithHash: '#/app' + allStates[i].url});
        }
    }
    configurationService.outputPrettyStateList = function(){
        var stateListJson = {};
        for(i = 0; i < allStates.length; i++){
            stateListJson[allStates[i].name.replace('app.', '')] = allStates[i].name;
        }
        console.log(qm.stringHelper.prettyJsonStringify(stateListJson));
    };
    //configurationService.outputPrettyStateList();
    stateList.sort(function(a, b){
        return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
    });
    $rootScope.stateList = stateList;
    $rootScope.openEditAppSettingsModal = function(appSettingType, appSettingObjectToEdit){
        if(configurationService.defaultDesigns[appSettingType]){
            /** @namespace $rootScope.appSettings.appDesign */
            $rootScope.appSettings.appDesign[appSettingType].type = "custom";
            $rootScope.appSettings.appType = "custom";
        }
        $rootScope.originalAppSetting = appSettingObjectToEdit;
        qmLog.info("Editing: ", appSettingObjectToEdit, appSettingObjectToEdit);
        // This must be done so that we aren't also modifying originalAppSetting, rendering replacement impossible
        // TODO: Why do we need to replace anything if we're editing the original?
        //$rootScope.appSettingObjectToEdit = JSON.parse(JSON.stringify(appSettingObjectToEdit));
        $rootScope.appSettingObjectToEdit = appSettingObjectToEdit;
        $rootScope.appSettingType = appSettingType;
        if($state.current.name.toLowerCase().indexOf('configuration') === -1){
            qmLog.info("Going to configuration state because we clicked openEditAppSettingsModal");
            qmService.goToState(qm.staticData.stateNames.configuration);  // TODO: Maybe because we used to have buttons on actual menu
        }
        //if(!doNotOpenModal){$rootScope.editorModal.show();}
    };
    $rootScope.deleteAppComponentElement = function(selectedComponentType, appSettingToDelete){
        configurationService.deleteAppComponentElement(selectedComponentType, appSettingToDelete);
    };
    $rootScope.addAppComponentElement = function(selectedComponentType, appSettingToDuplicate){
        configurationService.addAppComponentElement(selectedComponentType, appSettingToDuplicate);
    };
    configurationService.replaceAppSetting = function(selectedComponentType, originalAppSetting, newSettingString){
        var originalSettingString = JSON.stringify(originalAppSetting);
        if($rootScope.appSettings.appDesign[selectedComponentType]){
            var newComponentSettings = configurationService.replaceJsonString(originalSettingString, newSettingString, $rootScope.appSettings.appDesign[selectedComponentType].active);
            $rootScope.appSettings.appType = "custom";
            $rootScope.appSettings.appDesign[selectedComponentType].type = "custom";
            $rootScope.appSettings.appDesign[selectedComponentType].custom = $rootScope.appSettings.appDesign[selectedComponentType].active = newComponentSettings;
        }else{
            var appSettings = configurationService.replaceJsonString(originalSettingString, newSettingString, $rootScope.appSettings);
            qmService.processAndSaveAppSettings(appSettings);
        }
        //postAppSettingsAfterConfirmation($rootScope.appSettings);
    };
    $rootScope.isObject = function(input){
        return angular.isObject(input);
    };
    $rootScope.isString = function(input){
        return angular.isString(input);
    };
    $rootScope.isImage = function(filename){
        if(!filename || typeof filename !== "string"){
            return;
        }
        if(configurationService.getFileExtension(filename) === ".svg"){
            return true;
        }
        if(configurationService.getFileExtension(filename) === ".png"){
            return true;
        }
        if(configurationService.getFileExtension(filename) === ".jpg"){
            return true;
        }
    };
    configurationService.getFileExtension = function(filename){
        if(!filename || typeof filename !== "string"){
            return;
        }
        var dotIndex = filename.lastIndexOf('.');
        return filename.substring(dotIndex);
    };
    var ionIconNames = ["ion-ionic", "ion-arrow-up-a", "ion-arrow-right-a", "ion-arrow-down-a", "ion-arrow-left-a", "ion-arrow-up-b", "ion-arrow-right-b", "ion-arrow-down-b", "ion-arrow-left-b", "ion-arrow-up-c", "ion-arrow-right-c", "ion-arrow-down-c", "ion-arrow-left-c", "ion-arrow-return-right", "ion-arrow-return-left", "ion-arrow-swap", "ion-arrow-shrink", "ion-arrow-expand", "ion-arrow-move", "ion-arrow-resize", "ion-chevron-up", "ion-chevron-right", "ion-chevron-down", "ion-chevron-left", "ion-navicon-round", "ion-navicon", "ion-drag", "ion-log-in", "ion-log-out", "ion-checkmark-round", "ion-checkmark", "ion-checkmark-circled", "ion-close-round", "ion-close", "ion-close-circled", "ion-plus-round", "ion-plus", "ion-plus-circled", "ion-minus-round", "ion-minus", "ion-minus-circled", "ion-information", "ion-information-circled", "ion-help", "ion-help-circled", "ion-backspace-outline", "ion-backspace", "ion-help-buoy", "ion-asterisk", "ion-alert", "ion-alert-circled", "ion-refresh", "ion-loop", "ion-shuffle", "ion-home", "ion-search", "ion-flag", "ion-star", "ion-heart", "ion-heart-broken", "ion-gear-a", "ion-gear-b", "ion-toggle-filled", "ion-toggle", "ion-settings", "ion-wrench", "ion-hammer", "ion-edit", "ion-trash-a", "ion-trash-b", "ion-document", "ion-document-text", "ion-clipboard", "ion-scissors", "ion-funnel", "ion-bookmark", "ion-email", "ion-email-unread", "ion-folder", "ion-filing", "ion-archive", "ion-reply", "ion-reply-all", "ion-forward", "ion-share", "ion-paper-airplane", "ion-link", "ion-paperclip", "ion-compose", "ion-briefcase", "ion-medkit", "ion-at", "ion-pound", "ion-quote", "ion-cloud", "ion-upload", "ion-more", "ion-grid", "ion-calendar", "ion-clock", "ion-compass", "ion-pinpoint", "ion-pin", "ion-navigate", "ion-location", "ion-map", "ion-lock-combination", "ion-locked", "ion-unlocked", "ion-key", "ion-arrow-graph-up-right", "ion-arrow-graph-down-right", "ion-arrow-graph-up-left", "ion-arrow-graph-down-left", "ion-stats-bars", "ion-connection-bars", "ion-pie-graph", "ion-chatbubble", "ion-chatbubble-working", "ion-chatbubbles", "ion-chatbox", "ion-chatbox-working", "ion-chatboxes", "ion-person", "ion-person-add", "ion-person-stalker", "ion-woman", "ion-man", "ion-female", "ion-male", "ion-transgender", "ion-fork", "ion-knife", "ion-spoon", "ion-soup-can-outline", "ion-soup-can", "ion-beer", "ion-wineglass", "ion-coffee", "ion-icecream", "ion-pizza", "ion-power", "ion-mouse", "ion-battery-full", "ion-battery-half", "ion-battery-low", "ion-battery-empty", "ion-battery-charging", "ion-wifi", "ion-bluetooth", "ion-calculator", "ion-camera", "ion-eye", "ion-eye-disabled", "ion-flash", "ion-flash-off", "ion-qr-scanner", "ion-image", "ion-images", "ion-wand", "ion-contrast", "ion-aperture", "ion-crop", "ion-easel", "ion-paintbrush", "ion-paintbucket", "ion-monitor", "ion-laptop", "ion-ipad", "ion-iphone", "ion-ipod", "ion-printer", "ion-usb", "ion-outlet", "ion-bug", "ion-code", "ion-code-working", "ion-code-download", "ion-fork-repo", "ion-network", "ion-pull-request", "ion-merge", "ion-xbox", "ion-playstation", "ion-steam", "ion-closed-captioning", "ion-videocamera", "ion-film-marker", "ion-disc", "ion-headphone", "ion-music-note", "ion-radio-waves", "ion-speakerphone", "ion-mic-a", "ion-mic-b", "ion-mic-c", "ion-volume-high", "ion-volume-medium", "ion-volume-low", "ion-volume-mute", "ion-levels", "ion-play", "ion-pause", "ion-stop", "ion-record", "ion-skip-forward", "ion-skip-backward", "ion-eject", "ion-bag", "ion-card", "ion-cash", "ion-pricetag", "ion-pricetags", "ion-thumbsup", "ion-thumbsdown", "ion-happy-outline", "ion-happy", "ion-sad-outline", "ion-sad", "ion-bowtie", "ion-tshirt-outline", "ion-tshirt", "ion-trophy", "ion-podium", "ion-ribbon-a", "ion-ribbon-b", "ion-university", "ion-magnet", "ion-beaker", "ion-erlenmeyer-flask", "ion-egg", "ion-earth", "ion-planet", "ion-lightbulb", "ion-cube", "ion-leaf", "ion-waterdrop", "ion-flame", "ion-fireball", "ion-bonfire", "ion-umbrella", "ion-nuclear", "ion-no-smoking", "ion-thermometer", "ion-speedometer", "ion-model-s", "ion-plane", "ion-jet", "ion-load-a", "ion-load-b", "ion-load-c", "ion-load-d", "ion-ios-ionic-outline", "ion-ios-arrow-back", "ion-ios-arrow-forward", "ion-ios-arrow-up", "ion-ios-arrow-right", "ion-ios-arrow-down", "ion-ios-arrow-left", "ion-ios-arrow-thin-up", "ion-ios-arrow-thin-right", "ion-ios-arrow-thin-down", "ion-ios-arrow-thin-left", "ion-ios-circle-filled", "ion-ios-circle-outline", "ion-ios-checkmark-empty", "ion-ios-checkmark-outline", "ion-ios-checkmark", "ion-ios-plus-empty", "ion-ios-plus-outline", "ion-ios-plus", "ion-ios-close-empty", "ion-ios-close-outline", "ion-ios-close", "ion-ios-minus-empty", "ion-ios-minus-outline", "ion-ios-minus", "ion-ios-information-empty", "ion-ios-information-outline", "ion-ios-information", "ion-ios-help-empty", "ion-ios-help-outline", "ion-ios-help", "ion-ios-search", "ion-ios-search-strong", "ion-ios-star", "ion-ios-star-half", "ion-ios-star-outline", "ion-ios-heart", "ion-ios-heart-outline", "ion-ios-more", "ion-ios-more-outline", "ion-ios-home", "ion-ios-home-outline", "ion-ios-cloud", "ion-ios-cloud-outline", "ion-ios-cloud-upload", "ion-ios-cloud-upload-outline", "ion-ios-cloud-download", "ion-ios-cloud-download-outline", "ion-ios-upload", "ion-ios-upload-outline", "ion-ios-download", "ion-ios-download-outline", "ion-ios-refresh", "ion-ios-refresh-outline", "ion-ios-refresh-empty", "ion-ios-reload", "ion-ios-loop-strong", "ion-ios-loop", "ion-ios-bookmarks", "ion-ios-bookmarks-outline", "ion-ios-book", "ion-ios-book-outline", "ion-ios-flag", "ion-ios-flag-outline", "ion-ios-glasses", "ion-ios-glasses-outline", "ion-ios-browsers", "ion-ios-browsers-outline", "ion-ios-at", "ion-ios-at-outline", "ion-ios-pricetag", "ion-ios-pricetag-outline", "ion-ios-pricetags", "ion-ios-pricetags-outline", "ion-ios-cart", "ion-ios-cart-outline", "ion-ios-chatboxes", "ion-ios-chatboxes-outline", "ion-ios-chatbubble", "ion-ios-chatbubble-outline", "ion-ios-cog", "ion-ios-cog-outline", "ion-ios-gear", "ion-ios-gear-outline", "ion-ios-settings", "ion-ios-settings-strong", "ion-ios-toggle", "ion-ios-toggle-outline", "ion-ios-analytics", "ion-ios-analytics-outline", "ion-ios-pie", "ion-ios-pie-outline", "ion-ios-pulse", "ion-ios-pulse-strong", "ion-ios-filing", "ion-ios-filing-outline", "ion-ios-box", "ion-ios-box-outline", "ion-ios-compose", "ion-ios-compose-outline", "ion-ios-trash", "ion-ios-trash-outline", "ion-ios-copy", "ion-ios-copy-outline", "ion-ios-email", "ion-ios-email-outline", "ion-ios-undo", "ion-ios-undo-outline", "ion-ios-redo", "ion-ios-redo-outline", "ion-ios-paperplane", "ion-ios-paperplane-outline", "ion-ios-folder", "ion-ios-folder-outline", "ion-ios-paper", "ion-ios-paper-outline", "ion-ios-list", "ion-ios-list-outline", "ion-ios-world", "ion-ios-world-outline", "ion-ios-alarm", "ion-ios-alarm-outline", "ion-ios-speedometer", "ion-ios-speedometer-outline", "ion-ios-stopwatch", "ion-ios-stopwatch-outline", "ion-ios-timer", "ion-ios-timer-outline", "ion-ios-clock", "ion-ios-clock-outline", "ion-ios-time", "ion-ios-time-outline", "ion-ios-calendar", "ion-ios-calendar-outline", "ion-ios-photos", "ion-ios-photos-outline", "ion-ios-albums", "ion-ios-albums-outline", "ion-ios-camera", "ion-ios-camera-outline", "ion-ios-reverse-camera", "ion-ios-reverse-camera-outline", "ion-ios-eye", "ion-ios-eye-outline", "ion-ios-bolt", "ion-ios-bolt-outline", "ion-ios-color-wand", "ion-ios-color-wand-outline", "ion-ios-color-filter", "ion-ios-color-filter-outline", "ion-ios-grid-view", "ion-ios-grid-view-outline", "ion-ios-crop-strong", "ion-ios-crop", "ion-ios-barcode", "ion-ios-barcode-outline", "ion-ios-briefcase", "ion-ios-briefcase-outline", "ion-ios-medkit", "ion-ios-medkit-outline", "ion-ios-medical", "ion-ios-medical-outline", "ion-ios-infinite", "ion-ios-infinite-outline", "ion-ios-calculator", "ion-ios-calculator-outline", "ion-ios-keypad", "ion-ios-keypad-outline", "ion-ios-telephone", "ion-ios-telephone-outline", "ion-ios-drag", "ion-ios-location", "ion-ios-location-outline", "ion-ios-navigate", "ion-ios-navigate-outline", "ion-ios-locked", "ion-ios-locked-outline", "ion-ios-unlocked", "ion-ios-unlocked-outline", "ion-ios-monitor", "ion-ios-monitor-outline", "ion-ios-printer", "ion-ios-printer-outline", "ion-ios-game-controller-a", "ion-ios-game-controller-a-outline", "ion-ios-game-controller-b", "ion-ios-game-controller-b-outline", "ion-ios-americanfootball", "ion-ios-americanfootball-outline", "ion-ios-baseball", "ion-ios-baseball-outline", "ion-ios-basketball", "ion-ios-basketball-outline", "ion-ios-tennisball", "ion-ios-tennisball-outline", "ion-ios-football", "ion-ios-football-outline", "ion-ios-body", "ion-ios-body-outline", "ion-ios-person", "ion-ios-person-outline", "ion-ios-personadd", "ion-ios-personadd-outline", "ion-ios-people", "ion-ios-people-outline", "ion-ios-musical-notes", "ion-ios-musical-note", "ion-ios-bell", "ion-ios-bell-outline", "ion-ios-mic", "ion-ios-mic-outline", "ion-ios-mic-off", "ion-ios-volume-high", "ion-ios-volume-low", "ion-ios-play", "ion-ios-play-outline", "ion-ios-pause", "ion-ios-pause-outline", "ion-ios-recording", "ion-ios-recording-outline", "ion-ios-fastforward", "ion-ios-fastforward-outline", "ion-ios-rewind", "ion-ios-rewind-outline", "ion-ios-skipbackward", "ion-ios-skipbackward-outline", "ion-ios-skipforward", "ion-ios-skipforward-outline", "ion-ios-shuffle-strong", "ion-ios-shuffle", "ion-ios-videocam", "ion-ios-videocam-outline", "ion-ios-film", "ion-ios-film-outline", "ion-ios-flask", "ion-ios-flask-outline", "ion-ios-lightbulb", "ion-ios-lightbulb-outline", "ion-ios-wineglass", "ion-ios-wineglass-outline", "ion-ios-pint", "ion-ios-pint-outline", "ion-ios-nutrition", "ion-ios-nutrition-outline", "ion-ios-flower", "ion-ios-flower-outline", "ion-ios-rose", "ion-ios-rose-outline", "ion-ios-paw", "ion-ios-paw-outline", "ion-ios-flame", "ion-ios-flame-outline", "ion-ios-sunny", "ion-ios-sunny-outline", "ion-ios-partlysunny", "ion-ios-partlysunny-outline", "ion-ios-cloudy", "ion-ios-cloudy-outline", "ion-ios-rainy", "ion-ios-rainy-outline", "ion-ios-thunderstorm", "ion-ios-thunderstorm-outline", "ion-ios-snowy", "ion-ios-moon", "ion-ios-moon-outline", "ion-ios-cloudy-night", "ion-ios-cloudy-night-outline", "ion-android-arrow-up", "ion-android-arrow-forward", "ion-android-arrow-down", "ion-android-arrow-back", "ion-android-arrow-dropup", "ion-android-arrow-dropup-circle", "ion-android-arrow-dropright", "ion-android-arrow-dropright-circle", "ion-android-arrow-dropdown", "ion-android-arrow-dropdown-circle", "ion-android-arrow-dropleft", "ion-android-arrow-dropleft-circle", "ion-android-add", "ion-android-add-circle", "ion-android-remove", "ion-android-remove-circle", "ion-android-close", "ion-android-cancel", "ion-android-radio-button-off", "ion-android-radio-button-on", "ion-android-checkmark-circle", "ion-android-checkbox-outline-blank", "ion-android-checkbox-outline", "ion-android-checkbox-blank", "ion-android-checkbox", "ion-android-done", "ion-android-done-all", "ion-android-menu", "ion-android-more-horizontal", "ion-android-more-vertical", "ion-android-refresh", "ion-android-sync", "ion-android-wifi", "ion-android-call", "ion-android-apps", "ion-android-settings", "ion-android-options", "ion-android-funnel", "ion-android-search", "ion-android-home", "ion-android-cloud-outline", "ion-android-cloud", "ion-android-download", "ion-android-upload", "ion-android-cloud-done", "ion-android-cloud-circle", "ion-android-favorite-outline", "ion-android-favorite", "ion-android-star-outline", "ion-android-star-half", "ion-android-star", "ion-android-calendar", "ion-android-alarm-clock", "ion-android-time", "ion-android-stopwatch", "ion-android-watch", "ion-android-locate", "ion-android-navigate", "ion-android-pin", "ion-android-compass", "ion-android-map", "ion-android-walk", "ion-android-bicycle", "ion-android-car", "ion-android-bus", "ion-android-subway", "ion-android-train", "ion-android-boat", "ion-android-plane", "ion-android-restaurant", "ion-android-bar", "ion-android-cart", "ion-android-camera", "ion-android-image", "ion-android-film", "ion-android-color-palette", "ion-android-create", "ion-android-mail", "ion-android-drafts", "ion-android-send", "ion-android-archive", "ion-android-delete", "ion-android-attach", "ion-android-share", "ion-android-share-alt", "ion-android-bookmark", "ion-android-document", "ion-android-clipboard", "ion-android-list", "ion-android-folder-open", "ion-android-folder", "ion-android-print", "ion-android-open", "ion-android-exit", "ion-android-contract", "ion-android-expand", "ion-android-globe", "ion-android-chat", "ion-android-textsms", "ion-android-hangout", "ion-android-happy", "ion-android-sad", "ion-android-person", "ion-android-people", "ion-android-person-add", "ion-android-contact", "ion-android-contacts", "ion-android-playstore", "ion-android-lock", "ion-android-unlock", "ion-android-microphone", "ion-android-microphone-off", "ion-android-notifications-none", "ion-android-notifications", "ion-android-notifications-off", "ion-android-volume-mute", "ion-android-volume-down", "ion-android-volume-up", "ion-android-volume-off", "ion-android-hand", "ion-android-desktop", "ion-android-laptop", "ion-android-phone-portrait", "ion-android-phone-landscape", "ion-android-bulb", "ion-android-sunny", "ion-android-alert", "ion-android-warning", "ion-social-twitter", "ion-social-twitter-outline", "ion-social-facebook", "ion-social-facebook-outline", "ion-social-googleplus", "ion-social-googleplus-outline", "ion-social-google", "ion-social-google-outline", "ion-social-dribbble", "ion-social-dribbble-outline", "ion-social-octocat", "ion-social-github", "ion-social-github-outline", "ion-social-instagram", "ion-social-instagram-outline", "ion-social-whatsapp", "ion-social-whatsapp-outline", "ion-social-snapchat", "ion-social-snapchat-outline", "ion-social-foursquare", "ion-social-foursquare-outline", "ion-social-pinterest", "ion-social-pinterest-outline", "ion-social-rss", "ion-social-rss-outline", "ion-social-tumblr", "ion-social-tumblr-outline", "ion-social-wordpress", "ion-social-wordpress-outline", "ion-social-reddit", "ion-social-reddit-outline", "ion-social-hackernews", "ion-social-hackernews-outline", "ion-social-designernews", "ion-social-designernews-outline", "ion-social-yahoo", "ion-social-yahoo-outline", "ion-social-buffer", "ion-social-buffer-outline", "ion-social-skype", "ion-social-skype-outline", "ion-social-linkedin", "ion-social-linkedin-outline", "ion-social-vimeo", "ion-social-vimeo-outline", "ion-social-twitch", "ion-social-twitch-outline", "ion-social-youtube", "ion-social-youtube-outline", "ion-social-dropbox", "ion-social-dropbox-outline", "ion-social-apple", "ion-social-apple-outline", "ion-social-android", "ion-social-android-outline", "ion-social-windows", "ion-social-windows-outline", "ion-social-html5", "ion-social-html5-outline", "ion-social-css3", "ion-social-css3-outline", "ion-social-javascript", "ion-social-javascript-outline", "ion-social-angular", "ion-social-angular-outline", "ion-social-nodejs", "ion-social-sass", "ion-social-python", "ion-social-chrome", "ion-social-chrome-outline", "ion-social-codepen", "ion-social-codepen-outline", "ion-social-markdown", "ion-social-tux", "ion-social-freebsd-devil", "ion-social-usd", "ion-social-usd-outline", "ion-social-bitcoin", "ion-social-bitcoin-outline", "ion-social-yen", "ion-social-yen-outline", "ion-social-euro", "ion-social-euro-outline",];
    function outputIonIconMap(){
        var iconMap = {};
        for(var i = 0; i < ionIconNames.length; i++){
            var x = ionIconNames[i];
            var name = qm.stringHelper.toCamelCaseCase(x.replace('ion-', ''));
            iconMap[name] = x;
        }
        console.log(iconMap);
    }
    function titleCase(str){
        var splitStr = str.toLowerCase().split(' ');
        for(var i = 0; i < splitStr.length; i++){
            // You do not need to check if i is larger than splitStr length, as your for does that for you
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        // Directly return the joined string
        return splitStr.join(' ');
    }
    configurationService.formatIonIconName = function(name){
        if(!name || typeof name !== "string"){
            return name;
        }
        name = name.replace('ion-', '');
        name = name.replace('android-', '');
        name = name.replace('ios-', '');
        name = name.split('-').join(' ');
        return titleCase(name);
    };
    configurationService.getIonIcons = function(searchQuery){
        var deferred = $q.defer();
        var ionIconsObjects = [];
        for(var i = 0; i < ionIconNames.length; i++){
            var iconObject = {
                name: configurationService.formatIonIconName(ionIconNames[i]),
                value: ionIconNames[i],
                ionIcon: ionIconNames[i]
            };
            if(!searchQuery || iconObject.name.indexOf(searchQuery) !== -1 || iconObject.value.indexOf(searchQuery) !== -1){
                ionIconsObjects.push(iconObject);
            }
        }
        ionIconsObjects = ionIconsObjects.sort(function(a, b){
            return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
        });
        //return ionIconsObjects;
        deferred.resolve(ionIconsObjects);
        return deferred.promise;
    };
    configurationService.getAppsSettings = function(clientId){
        var deferred = $q.defer();
        qm.api.get('api/v1/appSettings', [], {clientId: clientId}, function(response){
            configurationService.separateUsersAndConfigureAppSettings(response.appSettings);
        }, function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };
    configurationService.separateUsersAndConfigureAppSettings = function(appSettings){
        if(!appSettings){
            qmLog.error("No appSettings provided to separateUsersAndConfigureAppSettings");
            return false;
        }
        configurationService.users = null;
        if(appSettings.users){
            configurationService.users = appSettings.users;
            delete appSettings.users;
        }
        qmService.showInfoToast("Switching to " + appSettings.appDisplayName);
        qmService.processAndSaveAppSettings(appSettings);
    };
    configurationService.upgradeUser = function(userId){
        var deferred = $q.defer();
        qm.api.post('api/v1/upgrade', {
            clientId: $rootScope.appSettings.clientId,
            userId: userId
        }, function(response){
            qmLog.debug("Upgrade response ", response);
        }, function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };
    configurationService.addCollaborator = function(email){
        var deferred = $q.defer();
        qm.api.post('api/v2/apps/' + $rootScope.appSettings.clientId + '/add-collaborator', {
            clientId: $rootScope.appSettings.clientId,
            email: email
        }, function(response){
            qmLog.debug("Upgrade response ", response);
        }, function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };
    String.prototype.replaceAll = function(find, replace){
        function escapeRegExp(str){
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }
        return this.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    };
    configurationService.createApp = function(newApp){
        function sanitizeClientId(clientId){
            clientId = clientId.toLowerCase();
            clientId = clientId.replaceAll(' ', '-');
            clientId = clientId.replaceAll('.', '-');
            return clientId;
        }
        var newAppToPost = JSON.parse(JSON.stringify(newApp)); // Avoids retention of old client id in case of failure
        var deferred = $q.defer();
        if(!newAppToPost.qmClientId){
            newAppToPost.qmClientId = newAppToPost.appDisplayName;
        }
        newAppToPost.qmClientId = sanitizeClientId(newAppToPost.qmClientId);
        qmService.showBasicLoader();
        qm.api.post('api/v2/apps/create', newAppToPost, function(response){
            qmLog.debug("createApp response ", response);
            qmService.hideLoader();
            qmService.showInfoToast("App created!");
            qmService.showMaterialAlert("App Created", "Now go to Settings -> App Images and add your own icon and logo!");
            configurationService.allAppSettings = null;
            deferred.resolve(response.data.appSettings);
        }, function(error){
            var message = error;
            if(typeof message !== "string"){message = error.message;}
            if(message){qmService.showMaterialAlert("App Creation Issue", message);}
            qmLog.error(message);
            deferred.reject(message);
        });
        return deferred.promise;
    };
    configurationService.deleteCollaborator = function(userId, clientId){
        if(!userId){
            qmLog.errorAndExceptionTestingOrDevelopment("No user id provided to configurationService.deleteCollaborator");
        }
        var deferred = $q.defer();
        qm.api.post('api/v2/apps/' + clientId + '/delete-collaborator', {
            clientId: clientId,
            userId: userId
        }, function(response){
            qmLog.debug("Delete response ", response);
        }, function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };
    configurationService.getEmbeddableJs = function(){
        return '<script src="https://cdn.rawgit.com/QuantiModo/quantimodo-embed-js/0.0.1/quantimodo-embed.min.js"></script>' +
            '<script>' +
            'window.QuantiModoIntegration.options = {clientId: "' + $rootScope.appSettings.clientId + '"}; ' +
            'window.QuantiModoIntegration.createSingleFloatingActionButton();' +
            '</script>';
    };
    return configurationService;
});
