angular.module('starter').controller('UpgradeCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading", "$mdDialog", "$rootScope", "$stateParams", "qmService", "qmLogService", "$locale", function ($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $mdDialog,
                                                              $rootScope, $stateParams, qmService, qmLogService, $locale) {
    WebUpgradeDialogController.$inject = ["$scope", "$mdDialog"];
    MobileUpgradeDialogController.$inject = ["$scope", "$mdDialog"];
    $scope.state = {
        coupon: null,
        hideFeatures: false
    };
    $scope.signUpQuestions = [
        {
            question: "What do you do with my data?",
            answer: "Your data belongs entirely to you. We do not sell or otherwise do anything with your data to " +
            "put your privacy at risk.  "
        },
        {
            question: "Can I pause my account?",
            answer: "You can pause or quit at any time. You have complete control."
        },
        {
            question: "Data Security",
            answer: "Our customers have demanding security and privacy requirements. Our platform was designed using " +
            "the most rigorous security standards, using the same technology used by online banks."
        },
    ];
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug('Entering state ' + $state.current.name, null);
        qmService.navBar.setFilterBarSearchIcon(false);
        if(qmService.sendToLoginIfNecessaryAndComeBack()){ return; }
        if(qm.platform.isChromeExtension()){chrome.tabs.create({url: qm.api.getBaseUrl() + '/upgrade'}); window.close(); return;}
        $scope.planFeaturesCard = qmService.getPlanFeatureCards()[1];
        $rootScope.upgradeFooterText = null;
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        qmService.setupUpgradePages();
        qmService.hideLoader();
    });
    $scope.$on('$ionicView.afterEnter', function(e) { qmLogService.debug('afterEnter state ' + $state.current.name, null);
        if(qm.platform.isWebOrChrome() || qm.platform.isChromeExtension()){stripeSetup();}
    });
    $scope.useLitePlan = function () {if($stateParams.litePlanState){qmService.goToState($stateParams.litePlanState);} else { $scope.goBack();}};
    $scope.hideUpgradePage = function () {
        $rootScope.upgradePages = $rootScope.upgradePages.filter(function( obj ) {
            return obj.id !== $rootScope.upgradePages[0].id; });
        if($rootScope.upgradePages.length === 1){ $scope.hideLearnMoreButton = true; }
        if(!$rootScope.upgradePages || $rootScope.upgradePages.length === 0){
            qmService.rootScope.setProperty('hideMenuButton', false);
            qmService.goToDefaultState();
        } else { qmService.rootScope.setProperty('hideMenuButton', true); }
    };
    if(!$scope.productId){ $scope.productId = 'monthly7'; }
    $scope.monthlySubscription = function () { $scope.productId = 'yearly60'; $scope.upgrade(); };
    $scope.yearlySubscription = function () { $scope.productId = 'yearly60';  $scope.upgrade(); };
    var mobilePurchaseDebug = false;
    $scope.upgrade = function (ev) {
        if($rootScope.platform.isMobile || mobilePurchaseDebug){  mobileUpgrade(ev);} else { webUpgrade(ev); }
    };
    // Deprecated
    var webUpgrade = function(ev) {
        qmLogService.error(null, 'User clicked upgrade button');
        $mdDialog.show({
            controller: WebUpgradeDialogController,
            //templateUrl: 'templates/fragments/web-upgrade-dialog-fragment.html',
            templateUrl: 'templates/credit-card-stripe.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false
        }).then(function(answer) {
            qmLogService.error(null, 'User submitted credit card info');
            var body = {
                "card_number": answer.creditCardInfo.cardNumber,
                "card_month": answer.creditCardInfo.month,
                "card_year": answer.creditCardInfo.year,
                "card_cvc": answer.creditCardInfo.securityCode,
                'productId': answer.productId,
                'coupon': answer.coupon
            };
            qmService.postCreditCardDeferred(body);
        }, function() {  $scope.status = 'You cancelled the dialog.'; });
    };
    var purchaseDebugMode = false;
    function getFormObj(formId) {
        var formObj = {};
        var inputs = $('#'+formId).serializeArray();
        $.each(inputs, function (i, input) {formObj[input.name] = input.value;});
        return formObj;
    }
    function stripeTokenHandler(token) {
        var formObject = getFormObj('payment-form');
        formObject.productId = $scope.productId;
        formObject.couponCode =  $scope.state.coupon;
        formObject.stripeToken = token;
        qmService.postCreditCardDeferred(formObject);
    }
    function stripeSetup() {
        var stripe = Stripe('pk_live_jwzyvmlPu1cU7ZQ5LbanoELX');  // Create a Stripe client.
        if(qm.appMode.isTesting()){stripe = Stripe('pk_test_D1XwEhLXgG04dfp8cLr36SbP');}
        var elements = stripe.elements();  // Create an instance of Elements.
        // Custom styling can be passed to options when creating an Element.
        var style = {
            base: {
                color: '#32325d',
                lineHeight: '18px',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };
        var card = elements.create('card', {style: style});  // Create an instance of the card Element.
        card.mount('#card-element');  // Add an instance of the card Element into the `card-element` <div>.
        card.addEventListener('change', function(event) {
            var displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });  // Handle real-time validation errors from the card Element.
        var form = document.getElementById('payment-form'); // Handle form submission.
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            stripe.createToken(card).then(function(result) {
                if (result.error) {
                    // Inform the user if there was an error.
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                } else {
                    stripeTokenHandler(result.token); // Send the token to your server.
                }
            });
        });
    }
     // Deprecated
    function WebUpgradeDialogController($scope, $mdDialog) {
        $scope.productId = 'monthly7';
        var currentYear = new Date().getFullYear();
        $scope.creditCardInfo = { year: null };
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.years = [];
        for(var i = 0; i < 13; i++){  $scope.years.push(currentYear + i); }
        $scope.hide = function() { $mdDialog.hide(); };
        $scope.cancel = function() {
            qmLogService.error(null, 'User cancelled upgrade!  What happened?');
            $mdDialog.cancel();
        };
        $scope.webSubscribe = function(productId, coupon, creditCardInfo, event) {
            if (!creditCardInfo.securityCode) { qmLogService.error(null, 'Please enter card number'); return;}
            if (!creditCardInfo.cardNumber) {qmLogService.error(null, 'Please enter card number'); return; }
            if (!creditCardInfo.month) { qmLogService.error(null, 'Please enter card month'); return; }
            if (!creditCardInfo.year) { qmLogService.error(null, 'Please enter card year'); return; }
            var answer = { productId: productId, coupon: coupon, creditCardInfo: creditCardInfo };
            $mdDialog.hide(answer);
        };
    }
    function MobileUpgradeDialogController($scope, $mdDialog) {
        qmLogService.debug('$scope.productId is ' + $scope.productId, null);
        $scope.productId = 'monthly7';
        $scope.hide = function(){$mdDialog.hide();};
        $scope.cancel = function() {
            qmLogService.error(null, 'User cancelled upgrade!  What happened?');
            $mdDialog.cancel();
        };
        $scope.subscribe = function(answer) {$mdDialog.hide(answer);};
    }
    var mobileUpgrade = function (ev) {
        if (!window.inAppPurchase && !mobilePurchaseDebug) {
            qmLogService.error(null, 'inAppPurchase not available');
            webUpgrade(ev);
            return;
        }
        $mdDialog.show({
            controller: MobileUpgradeDialogController,
            templateUrl: 'templates/fragments/select-subscription-plan-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false
        }).then(function(baseProductId) {
            //makeInAppPurchase(baseProductId);  // iOS requires us to get products first or we get "unknown product id" error
            getProductsAndMakeInAppPurchase(baseProductId);
        }, function() {
            qmLogService.error(null, 'User cancelled mobileUpgrade subscription selection');
            $scope.status = 'You cancelled the dialog.';
        });
    };
    function getSubscriptionProvider() {
        var subscriptionProvider = 'unknown';
        if($rootScope.platform.isAndroid){ subscriptionProvider = 'google';}
        if($rootScope.platform.isIOS){subscriptionProvider = 'apple';}
        return subscriptionProvider;
    }
    function getProductId(baseProductId) {
        if($rootScope.platform.isIOS){
            if (baseProductId.toLowerCase().indexOf('month') !== -1) {
                return qm.getAppSettings().additionalSettings.monetizationSettings.iosMonthlySubscriptionCode.value;
            } else if (baseProductId.toLowerCase().indexOf('year') !== -1) {
                return qm.getAppSettings().additionalSettings.monetizationSettings.iosYearlySubscriptionCode.value;
            } else {
                qmLog.error("Could not determine subscription code for baseProductId "+baseProductId);
            }
        }
        return baseProductId;
    }
    function handleSubscribeResponse(baseProductId, data) {
        qmLogService.error(null, 'inAppPurchase.subscribe response: ' + JSON.stringify(data));
        qmService.hideLoader();
        var alert;
        function showSuccessAlert() {
            alert = $mdDialog.alert({  title: 'Thank you!', textContent: "Let's get started!", ok: 'OK' });
            $mdDialog.show( alert )
                .finally(function() {
                    $scope.goBack();
                    $rootScope.user.stripeActive = true;
                    alert = undefined;
                });
        }
        showSuccessAlert();
        qmLogService.error(null, 'User subscribed to ' + getProductId(baseProductId) + ': ' + JSON.stringify(data));
        qmService.updateUserSettingsDeferred({
            subscriptionProvider: getSubscriptionProvider(),
            productId: getProductId(baseProductId),
            trialEndsAt: moment().add(14, 'days').toISOString()
            //coupon: answer.coupon
        }).then(function (response) {qmService.recordUpgradeProductPurchase(baseProductId, response.data.purchaseId, 2);});
        $rootScope.user.stripeActive = true;
    }
    function makeInAppPurchase(baseProductId) {
        qmService.showBlackRingLoader();
        var getReceipt = false;
        inAppPurchase.subscribe(getProductId(baseProductId))
            .then(function (data) {
                if(getReceipt){
                    inAppPurchase.getReceipt()
                        .then(function (receipt) {
                            qmLogService.error(null, 'inAppPurchase.getReceipt response: ' + JSON.stringify(receipt));
                            qmLogService.debug('inAppPurchase.getReceipt ' + receipt, null);
                        }).catch(function (error) { qmLogService.error(null, 'inAppPurchase.getReceipt error response: ' + JSON.stringify(error)); });
                }
                handleSubscribeResponse(baseProductId, data);
            }).catch(function (error) {
            qmService.hideLoader();
            var alert;
            function showErrorAlert() {
                alert = $mdDialog.alert({ title: error.errorMessage,
                    textContent: "Please try again or contact mike@quantimo.do with Error Code: " + error.errorCode + ", Error Message: " + error.errorMessage + ", Product ID: " + getProductId(baseProductId),
                    ok: 'OK' });
                $mdDialog.show(alert).finally(function() { alert = undefined; });
            }
            if($rootScope.platform.isIOS){ showErrorAlert(); } // We want to alert the Apple Reviews about their stupid errors
            if($rootScope.platform.isAndroid){ handleSubscribeResponse(baseProductId, error); } // Sometimes Android has an error message even though it actually succeeds
            qmLogService.error(null, 'inAppPurchase.catch error ' + JSON.stringify(error));
        });
    }
    var getProductsAndMakeInAppPurchase = function (baseProductId) {
        if(purchaseDebugMode){
            alert('Called makeInAppPurchase for ' + getProductId(baseProductId));
            qmService.updateUserSettingsDeferred({ subscriptionProvider: getSubscriptionProvider(),
                productId: getProductId(baseProductId), trialEndsAt: moment().add(14, 'days').toISOString() });
        }
        qmService.showBlackRingLoader();
        //qmService.recordUpgradeProductPurchase(baseProductId, null, 1);
        inAppPurchase
            .getProducts([getProductId(baseProductId)])
            .then(function (products) {
                qmLogService.error(null, 'inAppPurchase.getProducts response: ' + JSON.stringify(products));
                if(purchaseDebugMode){alert('Available Products: ' + JSON.stringify(products));}
                //[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                makeInAppPurchase(baseProductId);
            }).catch(function (err) {
            qmService.hideLoader();
            qmLogService.error(null, 'couldn\'t get product ' + getProductId(baseProductId) + ': ' + JSON.stringify(err));
        });
    };
}]);
