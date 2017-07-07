angular.module('starter').controller('UpgradeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, quantimodoService) {
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        $rootScope.showFilterBarSearchIcon = false;
        if(quantimodoService.sendToLoginIfNecessaryAndComeBack()){ return; }
        if($rootScope.isChromeExtension){chrome.tabs.create({url: quantimodoService.getApiUrl() + '/upgrade'}); window.close(); return;}
        $scope.planFeaturesCard = quantimodoService.getPlanFeatureCards()[1];
        $rootScope.upgradeFooterText = null;
        $rootScope.hideNavigationMenu = false;
        quantimodoService.setupUpgradePages();
        quantimodoService.hideLoader();
    });
    $scope.useLitePlan = function () {if($stateParams.litePlanState){$state.go($stateParams.litePlanState);} else { $scope.goBack();}};
    $scope.hideUpgradePage = function () {
        $rootScope.upgradePages = $rootScope.upgradePages.filter(function( obj ) {
            return obj.id !== $rootScope.upgradePages[0].id; });
        if($rootScope.upgradePages.length === 1){ $scope.hideLearnMoreButton = true; }
        if(!$rootScope.upgradePages || $rootScope.upgradePages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.appDesign.defaultState);
        } else { $rootScope.hideMenuButton = true; }
    };
    if(!$scope.productId){ $scope.productId = 'monthly7'; }
    $scope.monthlySubscription = function () { $scope.productId = 'yearly60'; $scope.upgrade(); };
    $scope.yearlySubscription = function () { $scope.productId = 'yearly60';  $scope.upgrade(); };
    var mobilePurchaseDebug = false;
    $scope.upgrade = function (ev) {
        if($rootScope.isMobile || mobilePurchaseDebug){  mobileUpgrade(ev);} else { webUpgrade(ev); }
    };
    var webUpgrade = function(ev) {
        quantimodoService.reportErrorDeferred('User clicked upgrade button');
        $mdDialog.show({
            controller: WebUpgradeDialogController,
            templateUrl: 'templates/fragments/web-upgrade-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false
        }).then(function(answer) {
            quantimodoService.reportErrorDeferred('User submitted credit card info');
            var body = {
                "card_number": answer.creditCardInfo.cardNumber,
                "card_month": answer.creditCardInfo.month,
                "card_year": answer.creditCardInfo.year,
                "card_cvc": answer.creditCardInfo.securityCode,
                'productId': answer.productId,
                'coupon': answer.coupon
            };
            quantimodoService.recordUpgradeProductPurchase(answer.productId, null, 1);
            quantimodoService.showBlackRingLoader();
            quantimodoService.postCreditCardDeferred(body).then(function (response) {
                quantimodoService.reportErrorDeferred('Got successful upgrade response from API');
                quantimodoService.hideLoader();
                console.debug(JSON.stringify(response));
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Thank you!')
                        .textContent("Let's get started!")
                        .ariaLabel('OK!')
                        .ok('Get Started')
                ).finally(function() {
                    $scope.goBack();
                    /** @namespace response.data.purchaseId */
                    quantimodoService.recordUpgradeProductPurchase(answer.productId, response.data.purchaseId, 2);
                });
            }, function (response) {
                quantimodoService.reportErrorDeferred(response);
                var message = '';
                if(response.error){ message = response.error; }
                quantimodoService.hideLoader();
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Could not upgrade')
                        .textContent(message + '  Please try again or contact mike@quantimo.do for help.')
                        .ariaLabel('Error')
                        .ok('OK')
                );
            });
        }, function() {  $scope.status = 'You cancelled the dialog.'; });
    };
    var purchaseDebugMode = false;
    function WebUpgradeDialogController($scope, $mdDialog) {
        $scope.productId = 'monthly7';
        var currentYear = new Date().getFullYear();
        $scope.creditCardInfo = { year: null };
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.years = [];
        for(var i = 0; i < 13; i++){  $scope.years.push(currentYear + i); }
        $scope.hide = function() { $mdDialog.hide(); };
        $scope.cancel = function() {
            quantimodoService.reportErrorDeferred('User cancelled upgrade!  What happened?');
            $mdDialog.cancel();
        };
        $scope.webSubscribe = function(productId, coupon, creditCardInfo, event) {
            if (!creditCardInfo.securityCode) { quantimodoService.reportErrorDeferred('Please enter card number'); return;}
            if (!creditCardInfo.cardNumber) {quantimodoService.reportErrorDeferred('Please enter card number'); return; }
            if (!creditCardInfo.month) { quantimodoService.reportErrorDeferred('Please enter card month'); return; }
            if (!creditCardInfo.year) { quantimodoService.reportErrorDeferred('Please enter card year'); return; }
            var answer = { productId: productId, coupon: coupon, creditCardInfo: creditCardInfo };
            $mdDialog.hide(answer);
        };
    }
    function MobileUpgradeDialogController($scope, $mdDialog) {
        console.debug('$scope.productId is ' + $scope.productId);
        $scope.productId = 'monthly7';
        $scope.hide = function(){$mdDialog.hide();};
        $scope.cancel = function() {
            quantimodoService.reportErrorDeferred('User cancelled upgrade!  What happened?');
            $mdDialog.cancel();
        };
        $scope.subscribe = function(answer) {$mdDialog.hide(answer);};
    }
    var mobileUpgrade = function (ev) {
        if (!window.inAppPurchase && !mobilePurchaseDebug) {
            console.error('inAppPurchase not available');
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
            quantimodoService.reportErrorDeferred('User cancelled mobileUpgrade subscription selection');
            $scope.status = 'You cancelled the dialog.';
        });
    };
    function getSubscriptionProvider() {
        var subscriptionProvider = 'unknown';
        if($rootScope.isAndroid){ subscriptionProvider = 'google';}
        if($rootScope.isIOS){subscriptionProvider = 'apple';}
        return subscriptionProvider;
    }
    function getProductId(baseProductId) {
        if($rootScope.isIOS){ return config.appSettings.clientId + '_' + baseProductId; }
        return baseProductId;
    }
    function handleSubscribeResponse(baseProductId, data) {
        quantimodoService.reportErrorDeferred('inAppPurchase.subscribe response: ' + JSON.stringify(data));
        quantimodoService.hideLoader();
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
        quantimodoService.reportErrorDeferred("User subscribed to " + getProductId(baseProductId) + ": " + JSON.stringify(data));
        quantimodoService.updateUserSettingsDeferred({
            subscriptionProvider: getSubscriptionProvider(),
            productId: getProductId(baseProductId),
            trialEndsAt: moment().add(14, 'days').toISOString()
            //coupon: answer.coupon
        }).then(function (response) {quantimodoService.recordUpgradeProductPurchase(baseProductId, response.data.purchaseId, 2);});
        $rootScope.user.stripeActive = true;
    }
    function makeInAppPurchase(baseProductId) {
        quantimodoService.showBlackRingLoader();
        var getReceipt = false;
        inAppPurchase.subscribe(getProductId(baseProductId))
            .then(function (data) {
                if(getReceipt){
                    inAppPurchase.getReceipt()
                        .then(function (receipt) {
                            quantimodoService.reportErrorDeferred('inAppPurchase.getReceipt response: ' + JSON.stringify(receipt));
                            console.debug("inAppPurchase.getReceipt " + receipt);
                        }).catch(function (error) { quantimodoService.reportErrorDeferred('inAppPurchase.getReceipt error response: ' + JSON.stringify(error)); });
                }
                handleSubscribeResponse(baseProductId, data);
            }).catch(function (error) {
            quantimodoService.hideLoader();
            var alert;
            function showErrorAlert() {
                alert = $mdDialog.alert({ title: error.errorMessage,
                    textContent: "Please try again or contact mike@quantimo.do with Error Code: " + error.errorCode + ", Error Message: " + error.errorMessage + ", Product ID: " + getProductId(baseProductId),
                    ok: 'OK' });
                $mdDialog.show(alert).finally(function() { alert = undefined; });
            }
            if($rootScope.isIOS){ showErrorAlert(); } // We want to alert the Apple Reviews about their stupid errors
            if($rootScope.isAndroid){ handleSubscribeResponse(baseProductId, error); } // Sometimes Android has an error message even though it actually succeeds
            quantimodoService.reportErrorDeferred('inAppPurchase.catch error ' + JSON.stringify(error));
        });
    }
    var getProductsAndMakeInAppPurchase = function (baseProductId) {
        if(purchaseDebugMode){
            alert('Called makeInAppPurchase for ' + getProductId(baseProductId));
            quantimodoService.updateUserSettingsDeferred({ subscriptionProvider: getSubscriptionProvider(), productId: getProductId(baseProductId), trialEndsAt: moment().add(14, 'days').toISOString() });
        }
        quantimodoService.showBlackRingLoader();
        //quantimodoService.recordUpgradeProductPurchase(baseProductId, null, 1);
        inAppPurchase
            .getProducts([getProductId(baseProductId)])
            .then(function (products) {
                quantimodoService.reportErrorDeferred('inAppPurchase.getProducts response: ' + JSON.stringify(products));
                if(purchaseDebugMode){alert('Available Products: ' + JSON.stringify(products));}
                //[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                makeInAppPurchase(baseProductId);
            }).catch(function (err) {
            quantimodoService.hideLoader();
            quantimodoService.reportErrorDeferred("couldn't get product " + getProductId(baseProductId) + ": " + JSON.stringify(err));
        });
    };
});
