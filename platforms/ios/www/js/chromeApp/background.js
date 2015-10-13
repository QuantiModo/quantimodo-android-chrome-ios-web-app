chrome.app.runtime.onLaunched.addListener(function() {
  //window.open('www/index.html?app=mindfirst');
  chrome.app.window.create('www/index.html?app=mindfirst', {
    innerBounds: {
      width: 476,
      height: 603
    }
  });
});

chrome.alarms.onAlarm.addListener(function(alarm)
{
    console.log('alarms triggered');

        var notificationParams = {
            type: "basic",
            title: "How are you?",
            message: "It's time to report your mood!",
            iconUrl: "www/img/Icon_full.png",
            priority: 2
        };
        chrome.notifications.clear("trackReportNotification",function(wasCleared){
            chrome.notifications.create("trackReportNotification", notificationParams, function(id){});
        });

   /* var showBadge = (localStorage["showBadge"] || "true") == "true" ? true : false;
    if(showBadge)
    {
        var badgeParams = {text:"?"};
        chrome.browserAction.setBadgeText(badgeParams);
    }*/
});

chrome.notifications.onClicked.addListener(function(notificationId)
{
    if(notificationId == "trackReportNotification")
    {
       /* var windowParams = {url: "www/templates/popup.html",
            type: 'panel',
            width: 300,
            height: 290,
            top: screen.height,
            left: screen.width
        };
        chrome.app.window.create(windowParams);*/

        chrome.app.window.create('www/templates/popup.html', {
            innerBounds: {
                width: 376,
                height: 60
            },
            outerBounds:{
                left:screen.width-400,
                top:screen.height-150
            }
         });
    }
});
