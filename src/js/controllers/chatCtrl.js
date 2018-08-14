angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout", "$q",
	function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout, $q) {
		$scope.controller_name = "ChatCtrl";
		$scope.state = {
			dialogFlow: false,
			trackingReminderNotification: null,
			messages: [],
            userInputString: '',
            visualizationType: 'rainbow', // 'siri', 'rainbow', 'equalizer'
            listening: qm.speech.listening,
            circlePage: {
			    title: null,
                image: {
			        url: null
                }
            }
		};
		if($scope.state.visualizationType === 'rainbow'){$scope.state.bodyCss = "background: hsl(250,10%,10%); overflow: hidden;"}
        if($scope.state.visualizationType === 'siri'){$scope.state.bodyCss = "background: radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat fixed 0 0; margin: 0;"}
        if($scope.state.visualizationType === 'equalizer'){$scope.state.bodyCss = "background-color:#333;"}
        qmService.navBar.setFilterBarSearchIcon(false);
        function blurAll(){
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
        }
		$scope.state.toggleMicrophone = function(){
            $scope.state.listening = qm.speech.toggleListening();
            var container = document.getElementById('mic-input-field-container');
            if($scope.state.listening){
                blurAll();
            } else {
                container[0].focus();
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
        });
        $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();
            if(!qm.getUser()){
                talk("I'm not sure who you are so while you're logging in, take that time to ask yourself who you think you are on a deeper level.");
                qmService.login.sendToLoginIfNecessaryAndComeBack();
                return;
            }
            var robot = document.querySelector('.robot');
            robot.addEventListener('click', function (event) {
                if (speechSynthesis.speaking) {
                    qm.speech.shutUpRobot(true);
                } else {
                    if(qm.speech.lastUtterance){
                        qm.speech.talkRobot(qm.speech.lastUtterance.text);
                    } else {
                        qmLog.info("Nothing to say");
                    }
                }
            });
            qm.speech.getMostRecentNotificationAndTalk();
        });
        function ask(text){
            qm.speech.listening = $scope.state.listening = true;
            talk(text);
            //annyang.addCommands(reminderNotificationCommands);
        }
        $scope.state.userReply = function(reply) {
            reply = reply || $scope.state.userInputString;
            if(reply){$scope.state.userInputString = reply;}
            if ( reply === '' || !reply) {
                qmLog.error("No reply!");
                return;
            }
			$scope.state.messages.push({who: 'user', message: $scope.state.userInputString, time: 'Just now'});
            qm.speech.getMostRecentNotificationAndTalk();
			$scope.state.userInputString = '';
		};
        function talk(message) {
            $scope.state.circlePage.title = message;
            if(!message && !qm.dialogFlow.lastApiResponse.payload){return;}
			if(!message && !qm.dialogFlow.lastApiResponse.payload.google){return;}
			message = message || qm.dialogFlow.lastApiResponse.payload.google.systemIntent.data.listSelect.title;
			$scope.state.lastBotMessage = message;
            $scope.state.messages.push({who    : 'bot', message: message, time   : 'Just now'});
            qm.speech.talkRobot(message)
        }
		qm.staticData.dialogAgent.intents["Cancel Intent"].callback = function(){
		    qm.speech.talkRobot(qm.staticData.dialogAgent.intents["Cancel Intent"].responses.messages.speech);
		    qm.speech.abortListening();
		    qmService.goToDefaultState();
        };
        qm.staticData.dialogAgent.intents["Create Reminder Intent"].callback = function(){
		    qm.speech.currentIntent.name = "Create Reminder Intent";
		    var intent = qm.staticData.dialogAgent.intents["Create Reminder Intent"];
            if(!qm.dialogFlow.weHaveRequiredParams(intent)){return;}
            qm.variablesHelper.getFromLocalStorageOrApi({searchPhrase: qm.speech.currentIntent.parameters.variableName}, function(variable){
                qmService.addToRemindersUsingVariableObject(variable, {skipReminderSettingsIfPossible: true, doneState: "false"});
            });
        };
        $scope.state.simulateQuery = false;
        $scope.state.isDisabled    = false;
        $scope.state.allListItems        = loadAll();  // list of `state` value/display objects
        $scope.state.newState = function(state) {
            alert("Sorry! You'll need to create a Constitution for " + state + " first!");
        };
        $scope.state.querySearch = function(query) {
            var results = query ? $scope.state.allListItems.filter( createFilterFor(query) ) : $scope.state.allListItems,
                deferred;
            if ($scope.state.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        };
        $scope.state.searchTextChange = function(text) {
            qmLog.info('Text changed to ' + text);
        };
        $scope.state.selectedItemChange = function(item) {
            qmLog.info('Item changed to ' + JSON.stringify(item));
        };
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = query.toLowerCase();
            return function filterFn(button) {
                return (button.value.indexOf(lowercaseQuery) === 0);
            };
        }
        /**
         * Build `states` list of key/value pairs
         */
        function loadAll() {
            if(!$scope.state.trackingReminderNotification){return [];}
            var buttons = $scope.state.trackingReminderNotification.card.buttons;
            return buttons.map( function (button) {
                return {
                    value: button.longTitle,
                    display: state.longTitle
                };
            });
        }
    }]
);