/**
 * Created by Abdullah on 8/20/2015.
 */


function setMoodButtonListeners()
{
    document.getElementById('mood_depressed').onclick=onMoodButtonClicked;
    document.getElementById('mood_sad').onclick=onMoodButtonClicked;
    document.getElementById('mood_ok').onclick=onMoodButtonClicked;
    document.getElementById('mood_happy').onclick=onMoodButtonClicked;
    document.getElementById('mood_ecstatic').onclick=onMoodButtonClicked;
}

var onMoodButtonClicked = function()
{
    // Figure out what rating was selected
    var buttonId = this.id;
    var moodValue;
    if(buttonId == "mood_depressed")
    {
         moodValue = 1;
    }
    else if(buttonId == "mood_sad")
    {
         moodValue = 2;
    }
    else if(buttonId == "mood_ok")
    {
         moodValue = 3;
    }
    else if(buttonId == "mood_happy")
    {
         moodValue = 4;
    }
    else if(buttonId == "mood_ecstatic")
    {
         moodValue = 5;
    }
    else
    {   //LOL
        console.log("How did I get here...");
        return;
    }


    /*// Create an array of measurements
    var measurements = 	[
        {
            timestamp: 	Math.floor(Date.now() / 1000),
            value: 		moodValue
        }
    ];
    // Add it to a request, payload is what we'll send to QuantiModo
    var request =		{
        message: "uploadMeasurements",
        payload:[
            {
                measurements:			measurements,
                name: 					"Overall Mood",
                source: 				"MoodiModo",
                category: 				"Mood",
                combinationOperation: 	"MEAN",
                unit:					"/5"
            }
        ]

    };
    // Request our background script to upload it for us
    chrome.extension.sendMessage(request);

    clearNotifications();*/
    updateMood(buttonId,moodValue,new Date().getTime()/1000,function(){
        window.close();
    });
};


var updateMood = function(mood,moodVal,report_time,done){
    console.log("mood reported from notifications", mood, report_time);

    // update localstorage
    var obj = {};
    obj[config.appSettings.storage_identifier+'lastReportedTrackingFactorValue'] = mood;
    chrome.storage.local.set({'mood':mood},function(){});

    chrome.storage.local.get([config.appSettings.storage_identifier+'allData',
                              config.appSettings.storage_identifier+'barChartData',
                              config.appSettings.storage_identifier+'lineChartData',
                              config.appSettings.storage_identifier+'measurementsQueue'],
        function(localStorage){

        var allDataObject = {
            storedValue : moodVal,
            value : moodVal,
            timestamp : report_time,
            humanTime : {
                date : new Date().toISOString()
            }
        };

        // update full data
        if(localStorage[config.appSettings.storage_identifier+'allData']){

            var allData = JSON.parse(localStorage[config.appSettings.storage_identifier+'allData']);
            allData.push(allDataObject);
            var obj = {};
            obj[config.appSettings.storage_identifier+'allData'] = JSON.stringify(allData);
            chrome.storage.local.set(obj,function(){});
        }

        // update Bar chart data
        if(localStorage[config.appSettings.storage_identifier+'barMoodsData']){
            var barMoodsData = JSON.parse(localStorage[config.appSettings.storage_identifier+'barMoodsData']);
            barMoodsData[moodVal-1]++;
            var obj = {};
            obj[config.appSettings.storage_identifier+'barMoodsData'] = JSON.stringify(barMoodsData);
            chrome.storage.local.set(obj,function(){});
        }

        // update Line chart data
        if(localStorage[config.appSettings.storage_identifier+'lineMoodsData']){
            var lineMoodsData = JSON.parse(localStorage[config.appSettings.storage_identifier+'lineMoodsData']);
            lineMoodsData.push([report_time, moodVal]);
            var obj = {};
            obj[config.appSettings.storage_identifier+'lineMoodsData']=JSON.stringify(lineMoodsData);
            chrome.storage.local.set(obj,function(){});
        }

        //update measurementsQueue
        if(!localStorage[config.appSettings.storage_identifier+'measurementsQueue']){
            localStorage.measurementsQueue = '[]';
        }else{
            var measurementsQueue = JSON.parse(localStorage[config.appSettings.storage_identifier+'measurementsQueue']);
            measurementsQueue.push(allDataObject);
            var obj = {};
            obj[config.appSettings.storage_identifier+'measurementsQueue'] = JSON.stringify(measurementsQueue);
            chrome.storage.local.set(obj,function(){});
        }

        done();

    });

}

document.addEventListener('DOMContentLoaded', function ()
{
    //console.log('pankajkmar');
    var wDiff = (346 - window.innerWidth);
    var hDiff = (60 - window.innerHeight);

    window.resizeBy(wDiff, hDiff);

  /* // cookie function call here to remove the error.
    chrome.cookies.get({ url: 'https://app.quantimo.do', name: 'wordpress_logged_in_c9005e0fb733417360658b145e2ed413' },
        function (cookie) {
            if (cookie) {
                console.log(cookie.value);
            }
            else {
                var url = "https://app.quantimo.do/wp-login.php";
                chrome.tabs.create({"url":url, "selected":true});
            }
        });


     var backgroundPage = chrome.extension.getBackgroundPage();
     backgroundPage.isUserLoggedIn(function(isLoggedIn)
     {
     if(!isLoggedIn)
     {

     }
     });*/

    setMoodButtonListeners();

});

